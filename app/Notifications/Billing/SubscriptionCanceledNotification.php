<?php

declare(strict_types=1);

namespace App\Notifications\Billing;

use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class SubscriptionCanceledNotification extends Notification implements ShouldQueue
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
        private readonly ?CarbonImmutable $endedAt,
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
            ->subject('Your KidSchedule subscription was canceled')
            ->view('emails.billing.subscription-canceled', [
                'userName' => $notifiable->name,
                'plan' => $this->plan,
                'endedAt' => $this->endedAt,
                'billingUrl' => route('billing'),
            ]);
    }
}
