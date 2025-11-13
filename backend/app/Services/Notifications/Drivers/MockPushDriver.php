<?php

namespace App\Services\Notifications\Drivers;

use App\Models\User;
use App\Services\Notifications\Contracts\BaseDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MockPushDriver extends BaseDriver
{
    /**
     * Send a push notification (mock - logs to database).
     *
     * @param User $user
     * @param string $subject
     * @param string $message
     * @param array $data
     * @return array
     */
    public function send(User $user, string $subject, string $message, array $data = []): array
    {
        try {
            // Log to database (push_notification_logs table would be created in a migration)
            $logId = DB::table('push_notification_logs')->insertGetId([
                'user_id' => $user->id,
                'title' => $subject,
                'body' => $message,
                'data' => json_encode($data),
                'driver' => 'mock',
                'status' => 'sent',
                'platform' => $data['platform'] ?? 'web',
                'device_token' => $data['device_token'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Also log to file
            Log::channel('stack')->info('Mock Push Notification sent', [
                'log_id' => $logId,
                'user_id' => $user->id,
                'title' => $subject,
                'body' => $message,
                'data' => $data,
            ]);

            $result = $this->successResponse([
                'log_id' => $logId,
                'platform' => $data['platform'] ?? 'web',
                'note' => 'Push notification logged to database (mock mode)',
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        } catch (\Exception $e) {
            Log::error('MockPushDriver failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $result = $this->errorResponse('Failed to send push notification: ' . $e->getMessage(), [
                'exception' => get_class($e),
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        }
    }

    /**
     * Check if push notifications are configured.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        // Mock driver is always configured
        return true;
    }

    /**
     * Get driver name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'mock_push';
    }

    /**
     * Get channel type.
     *
     * @return string
     */
    public function getChannel(): string
    {
        return 'push';
    }
}
