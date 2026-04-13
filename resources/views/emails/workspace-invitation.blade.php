@extends('emails.layout', [
    'eyebrow' => 'Family Invitation',
    'title' => 'You were invited to join KidSchedule',
    'intro' => $senderName.' invited you to join the '.$workspaceName.' family calendar. Create an account or sign in with the same email to access the shared schedule.',
    'ctaUrl' => $signupUrl,
    'ctaLabel' => 'Accept invitation',
])

@section('content')
    <div style="background:#f7fbfb;border:1px solid #dceceb;border-radius:20px;padding:22px;">
        <p style="margin:0 0 12px;font-size:16px;line-height:1.7;color:#334155;">
            This invitation was sent to <strong>{{ $inviteeEmail }}</strong>.
        </p>
        <p style="margin:0 0 12px;font-size:16px;line-height:1.7;color:#334155;">
            Once you join, you'll be able to see the shared calendar, custody schedule, upcoming events, and any changes that matter for your family.
        </p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#64748b;">
            This invitation expires in 7 days.
        </p>
    </div>
@endsection
