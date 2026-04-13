<?php

declare(strict_types=1);

namespace App\Notifications\Billing;

use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param array{
     *     plan:string,
     *     billing_mode:string,
     *     label:string,
     *     billing_mode_label:string,
     *     price_display:string
     * } $plan
     */
    public function __construct(
        private readonly array $plan,
        private readonly ?CarbonImmutable $trialEndsAt,
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
            ->subject('Your KidSchedule trial is live')
            ->view('emails.billing.subscription-confirmed', [
                'userName' => $notifiable->name,
                'plan' => $this->plan,
                'trialEndsAt' => $this->trialEndsAt,
                'billingUrl' => route('billing'),
                'calendarUrl' => route('calendar'),
            ]);
    }
}
