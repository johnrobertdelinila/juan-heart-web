<?php

namespace App\Notifications;

use App\Models\EmergencyAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmergencyAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public EmergencyAlert $alert,
        public ?string $actionRequired = null,
        public ?string $acknowledgeUrl = null
    ) {
        $this->queue = 'high-priority';
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'sms'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('URGENT: Emergency Alert - Juan Heart Web')
            ->view('emails.emergency-alert', [
                'user' => $notifiable,
                'alert' => $this->alert,
                'action_required' => $this->actionRequired,
                'acknowledge_url' => $this->acknowledgeUrl,
                'priority' => 'critical',
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'alert_id' => $this->alert->id,
            'title' => $this->alert->title,
            'message' => $this->alert->message,
            'severity' => $this->alert->severity,
            'action_required' => $this->actionRequired,
            'acknowledge_url' => $this->acknowledgeUrl,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}