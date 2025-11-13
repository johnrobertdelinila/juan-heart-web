<?php

namespace App\Notifications;

use App\Models\Referral;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReferralAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Referral $referral,
        public ?string $clinicalNotes = null,
        public ?string $assessmentSummary = null,
        public ?string $actionUrl = null
    ) {
        $this->queue = config('services.notifications.queue_name', 'notifications');
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Patient Referral Assigned - Juan Heart Web')
            ->view('emails.referral-assigned', [
                'user' => $notifiable,
                'referral' => $this->referral,
                'clinical_notes' => $this->clinicalNotes,
                'assessment_summary' => $this->assessmentSummary,
                'action_url' => $this->actionUrl,
                'priority' => $this->referral->priority === 'urgent' ? 'critical' : 'high',
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'referral_id' => $this->referral->id,
            'priority' => $this->referral->priority,
            'reason' => $this->referral->reason,
            'clinical_notes' => $this->clinicalNotes,
            'assessment_summary' => $this->assessmentSummary,
            'action_url' => $this->actionUrl,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}