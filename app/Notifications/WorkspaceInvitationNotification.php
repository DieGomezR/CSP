<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class WorkspaceInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly WorkspaceInvitation $invitation)
    {
    }

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $workspaceName = (string) $this->invitation->workspace()->value('name');
        $senderName = (string) $this->invitation->invitedBy()->value('name');
        $signupUrl = route('register', ['invite' => $this->invitation->token]);

        return (new MailMessage)
            ->subject("You've been invited to {$workspaceName} on KidSchedule")
            ->view('emails.workspace-invitation', [
                'workspaceName' => $workspaceName,
                'senderName' => $senderName,
                'signupUrl' => $signupUrl,
                'inviteeEmail' => $this->invitation->email,
            ]);
    }
}
