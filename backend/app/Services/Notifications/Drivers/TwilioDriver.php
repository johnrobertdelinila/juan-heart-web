<?php

namespace App\Services\Notifications\Drivers;

use App\Models\User;
use App\Services\Notifications\Contracts\BaseDriver;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Twilio SMS Driver
 *
 * Production SMS delivery via Twilio API.
 *
 * Required Configuration:
 * - TWILIO_SID: Your Twilio Account SID
 * - TWILIO_TOKEN: Your Twilio Auth Token
 * - TWILIO_FROM: Your Twilio phone number
 *
 * To enable this driver:
 * 1. Set NOTIFICATION_SMS_DRIVER=twilio in .env
 * 2. Configure Twilio credentials
 * 3. Verify phone number in Twilio dashboard
 */
class TwilioDriver extends BaseDriver
{
    /**
     * Send an SMS via Twilio API.
     *
     * @param User $user
     * @param string $subject
     * @param string $message
     * @param array $data
     * @return array
     */
    public function send(User $user, string $subject, string $message, array $data = []): array
    {
        if (!$this->isConfigured()) {
            return $this->errorResponse('Twilio is not configured. Please set TWILIO_SID, TWILIO_TOKEN, and TWILIO_FROM.');
        }

        if (empty($user->phone)) {
            return $this->errorResponse('User does not have a phone number');
        }

        try {
            // TODO: Implement Twilio API integration when credentials are available
            // Example implementation:
            /*
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $from = config('services.twilio.from');

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To' => $user->phone,
                    'Body' => "{$subject}\n\n{$message}",
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $this->successResponse([
                    'message_sid' => $data['sid'],
                    'phone' => $user->phone,
                    'status' => $data['status'],
                ]);
            }

            return $this->errorResponse('Twilio API error: ' . $response->body());
            */

            return $this->errorResponse('Twilio driver not yet implemented. Configure credentials and implement the send() method.');
        } catch (\Exception $e) {
            Log::error('TwilioDriver failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->errorResponse('Failed to send SMS via Twilio: ' . $e->getMessage());
        }
    }

    /**
     * Check if Twilio is properly configured.
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty(config('services.twilio.sid'))
            && !empty(config('services.twilio.token'))
            && !empty(config('services.twilio.from'));
    }

    /**
     * Get driver name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'twilio';
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
