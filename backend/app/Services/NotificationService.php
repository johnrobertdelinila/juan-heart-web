<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Services\Notifications\Contracts\NotificationDriver;
use App\Services\Notifications\Drivers\MockEmailDriver;
use App\Services\Notifications\Drivers\MockSmsDriver;
use App\Services\Notifications\Drivers\MockPushDriver;
use App\Services\Notifications\Drivers\MailgunDriver;
use App\Services\Notifications\Drivers\TwilioDriver;
use App\Services\Notifications\Drivers\FirebaseDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

class NotificationService
{
    /**
     * Driver instances cache.
     *
     * @var array<string, NotificationDriver>
     */
    protected array $drivers = [];

    /**
     * Send a notification to a user through specified channels.
     *
     * @param User $user
     * @param string $type Notification type (e.g., 'assessment', 'appointment')
     * @param string $title
     * @param string $body
     * @param array $channels Channels to send through: ['email', 'sms', 'push']
     * @param array $data Additional data
     * @param string $priority Priority level: 'low', 'normal', 'high', 'critical'
     * @return array Results from each channel
     */
    public function send(
        User $user,
        string $type,
        string $title,
        string $body,
        array $channels = ['email'],
        array $data = [],
        string $priority = 'normal'
    ): array {
        // Create in-app notification record
        $notification = $this->createNotificationRecord($user, $type, $title, $body, $data, $priority);

        // Get user preferences and filter channels
        $enabledChannels = $this->filterChannelsByPreferences($user, $type, $channels);

        if (empty($enabledChannels)) {
            Log::info('No enabled channels for notification', [
                'user_id' => $user->id,
                'type' => $type,
                'requested_channels' => $channels,
            ]);

            return [
                'notification_id' => $notification->id,
                'channels' => [],
                'message' => 'No channels enabled for this notification type',
            ];
        }

        // Send through each enabled channel
        $results = [];
        foreach ($enabledChannels as $channel) {
            $driver = $this->getDriver($channel);

            if (!$driver) {
                Log::warning("No driver available for channel: {$channel}");
                continue;
            }

            if (!$driver->isConfigured()) {
                Log::warning("Driver {$driver->getName()} is not configured");
                $results[$channel] = [
                    'success' => false,
                    'message' => "Driver not configured",
                    'driver' => $driver->getName(),
                ];
                continue;
            }

            // Queue notification if enabled and queue is available, otherwise send immediately
            if (config('services.notifications.queue_enabled', true) && $this->isQueueAvailable()) {
                try {
                    $this->queueNotification($driver, $user, $title, $body, $data);
                    $results[$channel] = [
                        'success' => true,
                        'message' => 'Notification queued',
                        'driver' => $driver->getName(),
                        'queued' => true,
                    ];
                } catch (\Exception $e) {
                    // Fallback to immediate send if queue fails
                    Log::warning("Queue failed, sending immediately: {$e->getMessage()}");
                    $results[$channel] = $driver->send($user, $title, $body, $data);
                }
            } else {
                $results[$channel] = $driver->send($user, $title, $body, $data);
            }
        }

        return [
            'notification_id' => $notification->id,
            'channels' => $results,
        ];
    }

    /**
     * Send notification to multiple users (broadcast).
     *
     * @param array $userIds
     * @param string $type
     * @param string $title
     * @param string $body
     * @param array $channels
     * @param array $data
     * @param string $priority
     * @return array
     */
    public function sendBulk(
        array $userIds,
        string $type,
        string $title,
        string $body,
        array $channels = ['email'],
        array $data = [],
        string $priority = 'normal'
    ): array {
        $results = [];
        $users = User::whereIn('id', $userIds)->get();

        foreach ($users as $user) {
            try {
                $results[$user->id] = $this->send($user, $type, $title, $body, $channels, $data, $priority);
            } catch (\Exception $e) {
                Log::error('Failed to send notification to user', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);

                $results[$user->id] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return [
            'total' => count($userIds),
            'sent' => count(array_filter($results, fn($r) => !isset($r['success']) || $r['success'])),
            'failed' => count(array_filter($results, fn($r) => isset($r['success']) && !$r['success'])),
            'results' => $results,
        ];
    }

    /**
     * Create in-app notification record.
     *
     * @param User $user
     * @param string $type
     * @param string $title
     * @param string $body
     * @param array $data
     * @param string $priority
     * @return Notification
     */
    protected function createNotificationRecord(
        User $user,
        string $type,
        string $title,
        string $body,
        array $data,
        string $priority
    ): Notification {
        // Map type to valid database enum values
        $validTypes = ['message', 'referral', 'assessment', 'appointment', 'alert', 'system', 'reminder'];
        $mappedType = in_array($type, $validTypes) ? $type : 'system';

        // If type was 'emergency', map to 'alert'
        if ($type === 'emergency') {
            $mappedType = 'alert';
        }

        return Notification::create([
            'user_id' => $user->id,
            'type' => $mappedType,
            'title' => $title,
            'body' => $body,
            'priority' => $priority,
            'data' => $data,
            'action_url' => $data['action_url'] ?? null,
            'related_message_id' => $data['related_message_id'] ?? null,
            'related_referral_id' => $data['related_referral_id'] ?? null,
            'related_assessment_id' => $data['related_assessment_id'] ?? null,
        ]);
    }

    /**
     * Filter channels based on user preferences.
     *
     * @param User $user
     * @param string $type
     * @param array $requestedChannels
     * @return array
     */
    protected function filterChannelsByPreferences(User $user, string $type, array $requestedChannels): array
    {
        // Get user preferences from database
        $preferences = DB::table('notification_preferences')
            ->where('user_id', $user->id)
            ->where('notification_type', $type)
            ->where('is_enabled', true)
            ->pluck('channel')
            ->toArray();

        // If no preferences set, use defaults (all requested channels enabled)
        if (empty($preferences)) {
            return $requestedChannels;
        }

        // Return intersection of requested and enabled channels
        return array_intersect($requestedChannels, $preferences);
    }

    /**
     * Queue a notification for async processing.
     *
     * @param NotificationDriver $driver
     * @param User $user
     * @param string $subject
     * @param string $message
     * @param array $data
     * @return void
     */
    protected function queueNotification(
        NotificationDriver $driver,
        User $user,
        string $subject,
        string $message,
        array $data
    ): void {
        $queueConnection = config('services.notifications.queue_connection', 'redis');
        $queueName = config('services.notifications.queue_name', 'notifications');

        Queue::connection($queueConnection)->push(
            function () use ($driver, $user, $subject, $message, $data) {
                $driver->send($user, $subject, $message, $data);
            },
            '',
            $queueName
        );
    }

    /**
     * Get driver instance for a channel.
     *
     * @param string $channel
     * @return NotificationDriver|null
     */
    protected function getDriver(string $channel): ?NotificationDriver
    {
        // Return cached driver if available
        if (isset($this->drivers[$channel])) {
            return $this->drivers[$channel];
        }

        // Create new driver instance based on channel and configuration
        $driver = match ($channel) {
            'email' => $this->getEmailDriver(),
            'sms' => $this->getSmsDriver(),
            'push' => $this->getPushDriver(),
            default => null,
        };

        // Cache the driver
        if ($driver) {
            $this->drivers[$channel] = $driver;
        }

        return $driver;
    }

    /**
     * Get configured email driver.
     *
     * @return NotificationDriver
     */
    protected function getEmailDriver(): NotificationDriver
    {
        $driverType = config('services.notifications.email_driver', 'mock');

        return match ($driverType) {
            'mailgun' => new MailgunDriver(),
            'mock' => new MockEmailDriver(),
            default => new MockEmailDriver(),
        };
    }

    /**
     * Get configured SMS driver.
     *
     * @return NotificationDriver
     */
    protected function getSmsDriver(): NotificationDriver
    {
        $driverType = config('services.notifications.sms_driver', 'mock');

        return match ($driverType) {
            'twilio' => new TwilioDriver(),
            'mock' => new MockSmsDriver(),
            default => new MockSmsDriver(),
        };
    }

    /**
     * Get configured push notification driver.
     *
     * @return NotificationDriver
     */
    protected function getPushDriver(): NotificationDriver
    {
        $driverType = config('services.notifications.push_driver', 'mock');

        return match ($driverType) {
            'firebase' => new FirebaseDriver(),
            'mock' => new MockPushDriver(),
            default => new MockPushDriver(),
        };
    }

    /**
     * Check if queue is available.
     *
     * @return bool
     */
    protected function isQueueAvailable(): bool
    {
        try {
            $queueConnection = config('services.notifications.queue_connection', 'redis');

            // If queue is database, it's always available
            if ($queueConnection === 'database' || $queueConnection === 'sync') {
                return true;
            }

            // For Redis, check if Redis is available
            if ($queueConnection === 'redis') {
                return class_exists('Redis') && extension_loaded('redis');
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
}
