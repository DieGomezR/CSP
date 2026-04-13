<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Communication Climate Report</title>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; margin: 0; background: #eef8f6; color: #1f2937; }
        .page { max-width: 960px; margin: 0 auto; padding: 40px 28px 56px; }
        .card { background: #fff; border: 1px solid #dbe8e5; border-radius: 18px; padding: 24px; margin-top: 18px; }
        .grid { display: grid; gap: 14px; }
        .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .muted { color: #64748b; }
        .pill { display: inline-block; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
        .pill-warning { background: #fff2ee; color: #d06b55; }
        .pill-ok { background: #e7faf0; color: #34a56c; }
        .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: .18em; color: #8f8bff; font-weight: 800; }
        h1 { font-size: 40px; line-height: 1.05; margin: 10px 0 0; }
        h2 { font-size: 22px; margin: 0 0 12px; }
        p { line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 10px; border-bottom: 1px solid #ebf0f2; text-align: left; vertical-align: top; font-size: 14px; }
        th { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; }
        .banner { border: 1px solid #ffd68f; background: #fff7df; color: #a17512; border-radius: 16px; padding: 16px 18px; }
        @media print {
            body { background: white; }
            .page { padding: 16px 0 32px; }
            .no-print { display: none; }
            .card { break-inside: avoid; }
        }
    </style>
</head>
<body @if (($renderMode ?? 'browser') !== 'pdf') onload="window.print()" @endif>
    <div class="page">
        <div class="no-print" style="margin-bottom: 16px;">
            <a href="{{ route('mediation.report', ['workspace' => $workspace['id']]) }}" style="color:#8f8bff;font-weight:700;text-decoration:none;">&larr; Back to report setup</a>
        </div>

        <div>
            <div class="section-title">Communication Climate Report</div>
            <h1>{{ $report['workspace']['name'] }}</h1>
            <p class="muted">Report period: {{ $report['period']['start_label'] }} to {{ $report['period']['end_label'] }}</p>
        </div>

        <div class="card">
            <div class="grid grid-4">
                <div>
                    <p class="section-title" style="color:#ff6678;">Critical / High warnings</p>
                    <h2>{{ $report['summary']['critical_high_warnings'] }}</h2>
                </div>
                <div>
                    <p class="section-title" style="color:#ffb455;">Total warnings</p>
                    <h2>{{ $report['summary']['total_warnings'] }}</h2>
                </div>
                <div>
                    <p class="section-title" style="color:#788cff;">Sessions</p>
                    <h2>{{ $report['summary']['sessions_count'] }}</h2>
                </div>
                <div>
                    <p class="section-title" style="color:#50c878;">Resolution rate</p>
                    <h2>{{ $report['summary']['resolution_rate'] }}%</h2>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Executive Summary</h2>
            <p class="muted">
                This summary is generated from stored platform records only. During the selected period there were {{ $report['summary']['sessions_count'] }} mediation sessions,
                {{ $report['summary']['resolved_count'] }} resolved outcomes, {{ $report['summary']['canceled_count'] }} sessions closed for additional support,
                and {{ $report['summary']['messages_count'] }} recorded messages.
            </p>
        </div>

        <div class="card">
            <h2>Warning History</h2>
            @if (count($report['warnings']) === 0)
                <p class="muted">No communication warnings were detected in the selected period.</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Severity</th>
                            <th>Label</th>
                            <th>Evidence</th>
                            <th>Message ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($report['warnings'] as $warning)
                            <tr>
                                <td>{{ strtoupper($warning['severity']) }}</td>
                                <td>{{ $warning['label'] }}</td>
                                <td>{{ $warning['evidence'] }}</td>
                                <td>#{{ $warning['message_id'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="card">
            <h2>Mediation Sessions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Started</th>
                        <th>Closed</th>
                        <th>Messages</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($report['sessions'] as $session)
                        <tr>
                            <td>
                                <strong>{{ $session['subject'] }}</strong><br>
                                <span class="muted">Created by {{ $session['created_by'] }}</span>
                                @if ($session['resolution_reason'])
                                    <p class="muted" style="margin:8px 0 0;">Resolution: {{ $session['resolution_reason'] }}</p>
                                @endif
                                @if ($session['cancellation_reason'])
                                    <p class="muted" style="margin:8px 0 0;">Additional support reason: {{ $session['cancellation_reason'] }}</p>
                                @endif
                            </td>
                            <td>{{ $session['status_label'] }}</td>
                            <td>{{ $session['started_at'] }}</td>
                            <td>{{ $session['closed_at'] ?? 'Open' }}</td>
                            <td>{{ $session['messages_count'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Communication Patterns</h2>
            @if (count($report['patterns']) === 0)
                <p class="muted">No recurring communication patterns were identified from the stored mediation messages.</p>
            @else
                <div class="grid">
                    @foreach ($report['patterns'] as $pattern)
                        <div>
                            <span class="pill pill-warning">{{ $pattern['count'] }}x</span>
                            <strong style="margin-left:10px;">{{ $pattern['label'] }}</strong>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <div class="card">
            <h2>AI Intervention Log</h2>
            @if (count($report['ai_interventions']) === 0)
                <p class="muted">No AI intervention messages were recorded in the selected period.</p>
            @else
                <table>
                    <thead>
                        <tr>
                            <th>Session</th>
                            <th>Kind</th>
                            <th>Time</th>
                            <th>Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($report['ai_interventions'] as $entry)
                            <tr>
                                <td>#{{ $entry['session_id'] }}</td>
                                <td>{{ $entry['kind'] }}</td>
                                <td>{{ $entry['created_at'] }}</td>
                                <td>{{ $entry['preview'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="banner" style="margin-top: 18px;">
            Legal disclaimer: this report is generated automatically from KidSchedule records and rule-based communication analysis. It is not legal advice, not a forensic determination, and should be reviewed by qualified counsel before court submission.
        </div>
    </div>
</body>
</html>
