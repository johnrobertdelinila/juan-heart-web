<?php

namespace App\Services\Notifications\Contracts;

use App\Models\User;
use Illuminate\Support\Facades\Log;

abstract class BaseDriver implements NotificationDriver
{
    /**
     * Log a notification attempt.
     *
     * @param User $user
     * @param string $subject
     * @param string $message
     * @param array $result
     * @return void
     */
    protected function logNotification(User $user, string $subject, string $message, array $result): void
    {
        if (config('services.notifications.log_enabled', true)) {
            Log::channel('stack')->info('Notification sent', [
                'driver' => $this->getName(),
                'channel' => $this->getChannel(),
                'user_id' => $user->id,
                'user_email' => $user->email,
                'subject' => $subject,
                'success' => $result['success'] ?? false,
                'metadata' => $result['metadata'] ?? [],
            ]);
        }
    }

    /**
     * Create a standard success response.
     *
     * @param array $metadata
     * @return array{success: bool, message: string, driver: string, metadata: array}
     */
    protected function successResponse(array $metadata = []): array
    {
        return [
            'success' => true,
            'message' => 'Notification sent successfully',
            'driver' => $this->getName(),
            'metadata' => $metadata,
        ];
    }

    /**
     * Create a standard error response.
     *
     * @param string $message
     * @param array $metadata
     * @return array{success: bool, message: string, driver: string, metadata: array}
     */
    protected function errorResponse(string $message, array $metadata = []): array
    {
        return [
            'success' => false,
            'message' => $message,
            'driver' => $this->getName(),
            'metadata' => $metadata,
        ];
    }
}
