@extends('emails.layout', [
    'eyebrow' => 'Plan Updated',
    'title' => 'Your KidSchedule plan changed',
    'intro' => 'We updated your billing selection successfully. Your account remains active and your billing settings have been synchronized with Stripe.',
    'ctaUrl' => $billingUrl,
    'ctaLabel' => 'Review billing',
])

@section('content')
    <div style="background:#f7fbfb;border:1px solid #dceceb;border-radius:20px;padding:22px;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
            Hi {{ $userName }}, your subscription changed from <strong>{{ $previousPlan['label'] }}</strong> ({{ $previousPlan['billing_mode_label'] }}, {{ $previousPlan['price_display'] }}/month)
            to <strong>{{ $currentPlan['label'] }}</strong> ({{ $currentPlan['billing_mode_label'] }}, {{ $currentPlan['price_display'] }}/month).
        </p>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#64748b;">
            If this change wasn't expected, review your billing page immediately and contact support.
        </p>
    </div>
@endsection
