<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background:#eef8fb;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef8fb;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.12);">
                    <tr>
                        <td style="padding:28px 32px;background:linear-gradient(135deg,#daf7f0 0%,#f3f8ff 100%);border-bottom:1px solid #dceceb;">
                            <div style="font-size:14px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#67d2c3;">
                                {{ $eyebrow ?? 'KidSchedule Update' }}
                            </div>
                            <div style="margin-top:12px;font-size:38px;line-height:1;font-weight:900;color:#0f172a;">
                                <span style="color:#67d2c3;">Kid</span><span style="color:#67a7ff;">Schedule</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px 12px;">
                            <h1 style="margin:0 0 14px;font-size:34px;line-height:1.15;font-weight:900;color:#0f172a;">
                                {{ $title ?? '' }}
                            </h1>
                            @isset($intro)
                                <p style="margin:0 0 24px;font-size:18px;line-height:1.7;color:#64748b;">
                                    {{ $intro }}
                                </p>
                            @endisset

                            @yield('content')

                            @isset($ctaUrl)
                                <div style="margin:30px 0 4px;">
                                    <a href="{{ $ctaUrl }}"
                                       style="display:inline-block;background:#67d2c3;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:15px 24px;border-radius:16px;">
                                        {{ $ctaLabel ?? 'Open KidSchedule' }}
                                    </a>
                                </div>
                            @endisset
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 32px 30px;">
                            <div style="height:1px;background:#e2e8f0;margin-bottom:18px;"></div>
                            <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
                                KidSchedule keeps family calendars, billing, and coordination in one place.
                            </p>
                            <p style="margin:8px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;">
                                If you need help, reply to this email or visit your account dashboard.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
