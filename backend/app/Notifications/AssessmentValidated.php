<?php

namespace App\Notifications;

use App\Models\Assessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentValidated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Assessment $assessment,
        public ?string $clinicianNotes = null,
        public ?string $actionUrl = null
    ) {
        $this->queue = config('services.notifications.queue_name', 'notifications');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Assessment Validated - Juan Heart Web')
            ->view('emails.assessment-validated', [
                'user' => $notifiable,
                'assessment' => $this->assessment,
                'clinician_notes' => $this->clinicianNotes,
                'action_url' => $this->actionUrl,
                'priority' => 'normal',
            ]);
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'assessment_id' => $this->assessment->id,
            'assessment_external_id' => $this->assessment->assessment_external_id,
            'risk_level' => $this->assessment->final_risk_level,
            'risk_score' => $this->assessment->final_risk_score,
            'clinician_notes' => $this->clinicianNotes,
            'action_url' => $this->actionUrl,
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
