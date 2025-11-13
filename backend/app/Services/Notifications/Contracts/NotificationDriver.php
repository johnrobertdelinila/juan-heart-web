<?php

namespace App\Services\Notifications\Contracts;

use App\Models\User;

interface NotificationDriver
{
    /**
     * Send a notification through this driver.
     *
     * @param User $user The user to send the notification to
     * @param string $subject The subject/title of the notification
     * @param string $message The message body
     * @param array $data Additional data for the notification
     * @return array{success: bool, message: string, driver: string, metadata?: array}
     */
    public function send(User $user, string $subject, string $message, array $data = []): array;

    /**
     * Check if the driver is properly configured and ready to use.
     *
     * @return bool
     */
    public function isConfigured(): bool;

    /**
     * Get the driver name.
     *
     * @return string
     */
    public function getName(): string;

    /**
     * Get the channel type (email, sms, push).
     *
     * @return string
     */
    public function getChannel(): string;
}
