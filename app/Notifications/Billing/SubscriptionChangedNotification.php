<?php

declare(strict_types=1);

namespace App\Notifications\Billing;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param array{
     *     plan:string,
     *     billing_mode:string,
     *     label:string,
     *     billing_mode_label:string,
     *     price_display:string
     * } $previousPlan
     * @param array{
     *     plan:string,
     *     billing_mode:string,
     *     label:string,
     *     billing_mode_label:string,
     *     price_display:string
     * } $currentPlan
     */
    public function __construct(
        private readonly array $previousPlan,
        private readonly array $currentPlan,
    ) {
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
        return (new MailMessage)
            ->subject('Your KidSchedule plan was updated')
            ->view('emails.billing.subscription-changed', [
                'userName' => $notifiable->name,
                'previousPlan' => $this->previousPlan,
                'currentPlan' => $this->currentPlan,
                'billingUrl' => route('billing'),
            ]);
    }
}
