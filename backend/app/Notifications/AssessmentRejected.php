<?php

namespace App\Notifications;

use App\Models\Assessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Assessment $assessment,
        public ?string $reason = null,
        public ?string $nextSteps = null,
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
            ->subject('Assessment Needs Review - Juan Heart Web')
            ->view('emails.assessment-rejected', [
                'user' => $notifiable,
                'assessment' => $this->assessment,
                'reason' => $this->reason,
                'next_steps' => $this->nextSteps,
                'action_url' => $this->actionUrl,
                'priority' => 'high',
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'assessment_id' => $this->assessment->id,
            'assessment_external_id' => $this->assessment->assessment_external_id,
            'status' => $this->assessment->status,
            'reason' => $this->reason,
            'next_steps' => $this->nextSteps,
            'action_url' => $this->actionUrl,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}