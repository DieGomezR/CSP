<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Models\MediationSession;
use App\Models\Workspace;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

final class MediationReportBuilder
{
    public function __construct(
        private readonly MediationCommunicationAnalyzer $analyzer,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function build(Workspace $workspace, CarbonImmutable $startDate, CarbonImmutable $endDate): array
    {
        /** @var Collection<int, MediationSession> $sessions */
        $sessions = $workspace->mediationSessions()
            ->with(['createdByMember.user:id,name,email', 'messages.workspaceMember.user:id,name,email'])
            ->whereDate('started_at', '>=', $startDate->toDateString())
            ->whereDate('started_at', '<=', $endDate->toDateString())
            ->orderBy('started_at')
            ->get();

        $allMessages = $sessions->flatMap(static fn (MediationSession $session) => $session->messages);
        $warningSummary = $this->analyzer->summarizeWarnings($allMessages);
        $closedSessions = $sessions->filter(static fn (MediationSession $session): bool => $session->status->isClosed());
        $resolvedCount = $sessions->where('status', MediationSessionStatus::Resolved)->count();

        $patterns = $allMessages
            ->filter(static fn ($message): bool => $message->role === MediationMessageRole::User)
            ->flatMap(static fn ($message): array => data_get($message->metadata, 'analysis.patterns', []))
            ->countBy()
            ->map(static fn (int $count, string $pattern): array => ['label' => $pattern, 'count' => $count])
            ->values()
            ->all();

        return [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
            ],
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'start_label' => $startDate->format('M j, Y'),
                'end_label' => $endDate->format('M j, Y'),
            ],
            'summary' => [
                'sessions_count' => $sessions->count(),
                'resolved_count' => $resolvedCount,
                'canceled_count' => $sessions->where('status', MediationSessionStatus::Canceled)->count(),
                'messages_count' => $allMessages->count(),
                'critical_high_warnings' => $warningSummary['critical_high_count'],
                'total_warnings' => $warningSummary['total_count'],
                'resolution_rate' => $closedSessions->count() > 0 ? (int) round(($resolvedCount / $closedSessions->count()) * 100) : 0,
            ],
            'warnings' => $warningSummary['warnings'],
            'patterns' => $patterns,
            'sessions' => $sessions->map(function (MediationSession $session): array {
                return [
                    'id' => $session->id,
                    'subject' => $session->subject,
                    'status' => $session->status->value,
                    'status_label' => $session->status->label(),
                    'started_at' => $session->started_at?->format('M j, Y g:i A'),
                    'closed_at' => $session->closed_at?->format('M j, Y g:i A'),
                    'created_by' => $session->createdByMember->user->name,
                    'messages_count' => $session->messages->count(),
                    'resolution_reason' => $session->resolved_reason,
                    'cancellation_reason' => $session->canceled_reason,
                ];
            })->all(),
            'ai_interventions' => $allMessages
                ->filter(static fn ($message): bool => $message->role === MediationMessageRole::Assistant)
                ->map(static function ($message): array {
                    return [
                        'session_id' => $message->mediation_session_id,
                        'kind' => $message->kind,
                        'created_at' => $message->created_at?->format('M j, Y g:i A'),
                        'preview' => \Illuminate\Support\Str::limit($message->body, 180),
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
