<?php

namespace App\Services\Notifications\Drivers;

use App\Models\User;
use App\Services\Notifications\Contracts\BaseDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MockSmsDriver extends BaseDriver
{
    /**
     * Send an SMS notification (mock - logs to database and file).
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
            // Check if user has phone number
            if (empty($user->phone)) {
                return $this->errorResponse('User does not have a phone number', [
                    'user_id' => $user->id,
                ]);
            }

            // Log to database (sms_logs table would be created in a migration)
            $logId = DB::table('sms_logs')->insertGetId([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'subject' => $subject,
                'message' => $message,
                'data' => json_encode($data),
                'driver' => 'mock',
                'status' => 'sent',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Also log to file
            Log::channel('stack')->info('Mock SMS sent', [
                'log_id' => $logId,
                'user_id' => $user->id,
                'phone' => $user->phone,
                'subject' => $subject,
                'message' => $message,
            ]);

            $result = $this->successResponse([
                'phone' => $user->phone,
                'log_id' => $logId,
                'note' => 'SMS logged to database and file (mock mode)',
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        } catch (\Exception $e) {
            Log::error('MockSmsDriver failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            $result = $this->errorResponse('Failed to send SMS: ' . $e->getMessage(), [
                'exception' => get_class($e),
            ]);

            $this->logNotification($user, $subject, $message, $result);

            return $result;
        }
    }

    /**
     * Check if SMS is configured.
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
        return 'mock_sms';
    }

    /**
     * Get channel type.
     *
     * @return string
     */
    public function getChannel(): string
    {
        return 'sms';
    }
}
