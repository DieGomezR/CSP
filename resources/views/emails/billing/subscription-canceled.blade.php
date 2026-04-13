@extends('emails.layout', [
    'eyebrow' => 'Subscription Canceled',
    'title' => 'Your subscription was canceled',
    'intro' => 'We recorded the cancellation successfully. Your billing record stays available in KidSchedule and Stripe for reference.',
    'ctaUrl' => $billingUrl,
    'ctaLabel' => 'Open billing',
])

@section('content')
    <div style="background:#f7fbfb;border:1px solid #dceceb;border-radius:20px;padding:22px;">
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
            Hi {{ $userName }}, your <strong>{{ $plan['label'] }}</strong> subscription with <strong>{{ $plan['billing_mode_label'] }}</strong> pricing was canceled.
        </p>
        @if ($endedAt)
            <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
                Cancellation recorded on <strong>{{ $endedAt->format('F j, Y \\a\\t g:i A') }}</strong>.
            </p>
        @endif
        <p style="margin:0;font-size:16px;line-height:1.7;color:#64748b;">
            If you want to reactivate or choose a different plan later, you can do it from the billing area inside the app.
        </p>
    </div>
@endsection
