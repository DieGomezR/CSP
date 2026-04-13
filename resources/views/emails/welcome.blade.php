@extends('emails.layout', [
    'eyebrow' => 'Welcome',
    'title' => 'Your family calendar is ready',
    'intro' => 'KidSchedule is now live for your account. You can add children, build schedules, sync calendars, and invite co-parents or caregivers from your dashboard.',
    'ctaUrl' => route('dashboard'),
    'ctaLabel' => 'Open KidSchedule',
])

@section('content')
    <div style="background:#f7fbfb;border:1px solid #dceceb;border-radius:20px;padding:22px 22px 8px;">
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
            Hi {{ $userName }},
        </p>
        <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#334155;">
            Start by creating your first events, connecting your school calendar, and inviting anyone who needs visibility into the schedule.
        </p>
        <ul style="margin:0;padding:0 0 0 18px;color:#334155;">
            <li style="margin:0 0 10px;font-size:16px;line-height:1.7;">Create and share your family calendar</li>
            <li style="margin:0 0 10px;font-size:16px;line-height:1.7;">Invite co-parents and caregivers</li>
            <li style="margin:0 0 10px;font-size:16px;line-height:1.7;">Sync with Apple Calendar, Google Calendar, and Outlook</li>
        </ul>
    </div>
@endsection
