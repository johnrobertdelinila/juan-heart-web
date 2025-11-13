<?php

namespace App\Services\Notifications\Drivers;

use App\Models\User;
use App\Services\Notifications\Contracts\BaseDriver;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MockEmailDriver extends BaseDriver
{
    /**
     * Send an email notification via MailHog.
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
            // Get email view from data or use default
            $view = $data['view'] ?? 'emails.generic';
            $viewData = $data['view_data'] ?? ['message' => $message];

            Mail::send($view, $viewData, function ($mail) use ($user, $subject) {
                $mail->to($user->email, $user->full_name ?? $user->name)
                     ->subject($subject);
            });

            $result = $this->successResponse([
                'email' => $user->email,
                'subject' => $subject,
                'mailhog_url' => 'http://localhost:8025',
                'note' => 'Email sent to MailHog. Check http://localhost:8025 to view.',
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        } catch (\Exception $e) {
            Log::error('MockEmailDriver failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $result = $this->errorResponse('Failed to send email: ' . $e->getMessage(), [
                'exception' => get_class($e),
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        }
    }

    /**
     * Check if email is configured.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        // Mock driver is always configured (uses MailHog or default mail config)
        return true;
    }

    /**
     * Get driver name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'mock_email';
    }

    /**
     * Get channel type.
     *
     * @return string
     */
    public function getChannel(): string
    {
        return 'email';
    }
}
