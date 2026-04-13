@extends('emails.layout', [
    'eyebrow' => 'Billing Confirmed',
    'title' => 'Your '.$plan['label'].' trial is live',
    'intro' => 'Your KidSchedule subscription is active and ready to use. Billing stays managed in your account, while Stripe handles the secure payment processing.',
    'ctaUrl' => $billingUrl,
    'ctaLabel' => 'Open billing',
])

@section('content')
    <div style="background:#f7fbfb;border:1px solid #dceceb;border-radius:20px;padding:22px;">
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
            Hi {{ $userName }}, your subscription is now on <strong>{{ $plan['label'] }}</strong> with <strong>{{ $plan['billing_mode_label'] }}</strong> pricing at <strong>{{ $plan['price_display'] }}/month</strong>.
        </p>
        @if ($trialEndsAt)
            <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
                Your 60-day trial ends on <strong>{{ $trialEndsAt->format('F j, Y') }}</strong>.
            </p>
        @endif
        <p style="margin:0;font-size:16px;line-height:1.7;color:#64748b;">
            You can manage billing, switch plans, or go back to your calendar anytime.
        </p>
    </div>

    <div style="margin-top:18px;">
        <a href="{{ $calendarUrl }}" style="font-size:15px;font-weight:800;color:#3da999;text-decoration:none;">
            Go to your calendar
        </a>
    </div>
@endsection
