<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Mediation\CancelMediationSession;
use App\Actions\Mediation\ResolveMediationSession;
use App\Actions\Mediation\SendMediationMessage;
use App\Actions\Mediation\StartMediationSession;
use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Http\Requests\Mediation\AskAiForHelpRequest;
use App\Http\Requests\Mediation\CancelMediationSessionRequest;
use App\Http\Requests\Mediation\ResolveMediationSessionRequest;
use App\Http\Requests\Mediation\SendMediationMessageRequest;
use App\Http\Requests\Mediation\StartMediationSessionRequest;
use App\Models\MediationSession;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Mediation\MediationAccess;
use App\Support\Mediation\MediationCommunicationAnalyzer;
use App\Support\Mediation\MediationPdfBuilder;
use App\Support\Mediation\MediationReportBuilder;
use App\Support\Notifications\WorkspaceNotificationDispatcher;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class MediationController extends Controller
{
    public function __construct(
        private readonly CurrentWorkspaceResolver $currentWorkspaceResolver,
        private readonly MediationAccess $mediationAccess,
        private readonly MediationCommunicationAnalyzer $analyzer,
        private readonly MediationPdfBuilder $pdfBuilder,
        private readonly MediationReportBuilder $reportBuilder,
        private readonly WorkspaceNotificationDispatcher $workspaceNotificationDispatcher,
        private readonly WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
        private readonly StartMediationSession $startMediationSession,
        private readonly SendMediationMessage $sendMediationMessage,
        private readonly ResolveMediationSession $resolveMediationSession,
        private readonly CancelMediationSession $cancelMediationSession,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $activeSession = $this->mediationAccess->activeSessionForWorkspace($workspace);
        $sessions = $this->mediationAccess->visibleSessionsQuery($workspace)->get();
        $activeWarnings = $activeSession instanceof MediationSession
            ? $this->analyzer->summarizeWarnings($activeSession->messages)
            : ['critical_high_count' => 0, 'total_count' => 0, 'warnings' => []];

        $closedCount = $sessions->filter(static fn (MediationSession $session): bool => $session->status->isClosed())->count();
        $resolvedCount = $sessions->where('status', MediationSessionStatus::Resolved)->count();

        return Inertia::render('mediation/index', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'stats' => [
                'criticalHighWarnings' => $activeWarnings['critical_high_count'],
                'totalActiveWarnings' => $activeWarnings['total_count'],
                'sessionsCount' => $sessions->count(),
                'resolutionRate' => $closedCount > 0 ? (int) round(($resolvedCount / $closedCount) * 100) : 0,
            ],
            'activeWarnings' => $activeWarnings['warnings'],
            'activeSession' => $activeSession ? $this->serializeSessionCard($activeSession) : null,
            'history' => $sessions->map(fn (MediationSession $session): array => $this->serializeSessionCard($session))->all(),
            'reportDefaults' => [
                'start' => now()->subMonths(6)->toDateString(),
                'end' => now()->toDateString(),
            ],
        ]);
    }

    public function store(StartMediationSessionRequest $request): RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);
        abort_unless($workspace instanceof Workspace, 404);

        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $session = $this->startMediationSession->handle($workspace, $viewer, (string) $request->validated('subject'));

        $this->workspaceNotificationDispatcher->dispatch(
            $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation_started',
            'New mediation session',
            sprintf('%s started a mediation session: %s.', $viewer->user->name, $session->subject),
            route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id]),
            $workspace,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation',
            'session_started',
            $workspace->id,
            $viewer->user_id,
            ['mediation_session_id' => $session->id],
        );

        return to_route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $workspace->id])
            ->with('status', 'Mediation session started.');
    }

    public function show(Request $request, MediationSession $mediationSession): Response
    {
        $workspace = $this->resolveWorkspace($request, $mediationSession->workspace_id);
        abort_unless($workspace instanceof Workspace, 404);

        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $mediationSession->loadMissing(['createdByMember.user:id,name,email', 'messages.workspaceMember.user:id,name,email']);
        $this->mediationAccess->ensureBelongsToWorkspace($mediationSession, $viewer);

        return Inertia::render('mediation/session', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'session' => $this->serializeSession($mediationSession, $viewer),
        ]);
    }

    public function send(SendMediationMessageRequest $request, MediationSession $mediationSession): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($mediationSession->workspace_id);
        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $this->mediationAccess->ensureBelongsToWorkspace($mediationSession, $viewer);

        $this->sendMediationMessage->handle(
            $mediationSession,
            $viewer,
            (string) $request->validated('message'),
            (string) $request->validated('client_request_id'),
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation',
            'session_updated',
            $workspace->id,
            $viewer->user_id,
            ['mediation_session_id' => $mediationSession->id],
        );

        return back()->with('status', (bool) config('mediation.ai.queue_replies', false)
            ? 'Message sent. The AI reply is being prepared.'
            : 'Message sent.');
    }

    public function askAiForHelp(AskAiForHelpRequest $request, MediationSession $mediationSession): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($mediationSession->workspace_id);
        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $this->mediationAccess->ensureBelongsToWorkspace($mediationSession, $viewer);

        $this->sendMediationMessage->handle(
            $mediationSession,
            $viewer,
            '',
            (string) $request->validated('client_request_id'),
            true,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation',
            'session_updated',
            $workspace->id,
            $viewer->user_id,
            ['mediation_session_id' => $mediationSession->id],
        );

        return back()->with('status', (bool) config('mediation.ai.queue_replies', false)
            ? 'A different AI suggestion was requested and is being prepared.'
            : 'A different AI suggestion was added to the conversation.');
    }

    public function resolve(ResolveMediationSessionRequest $request, MediationSession $mediationSession): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($mediationSession->workspace_id);
        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $this->mediationAccess->ensureBelongsToWorkspace($mediationSession, $viewer);

        $this->resolveMediationSession->handle($mediationSession, (string) $request->validated('reason'));

        $this->workspaceNotificationDispatcher->dispatch(
            $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation_resolved',
            'Mediation session resolved',
            sprintf('%s resolved "%s".', $viewer->user->name, $mediationSession->subject),
            route('mediation.show', ['mediationSession' => $mediationSession->id, 'workspace' => $workspace->id]),
            $workspace,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation',
            'session_resolved',
            $workspace->id,
            $viewer->user_id,
            ['mediation_session_id' => $mediationSession->id],
        );

        return back()->with('status', 'Mediation session resolved.');
    }

    public function cancel(CancelMediationSessionRequest $request, MediationSession $mediationSession): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($mediationSession->workspace_id);
        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());
        $this->mediationAccess->ensureBelongsToWorkspace($mediationSession, $viewer);

        $this->cancelMediationSession->handle($mediationSession, (string) $request->validated('reason'));

        $this->workspaceNotificationDispatcher->dispatch(
            $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation_escalated',
            'Additional support requested',
            sprintf('%s requested more help for "%s".', $viewer->user->name, $mediationSession->subject),
            route('mediation.show', ['mediationSession' => $mediationSession->id, 'workspace' => $workspace->id]),
            $workspace,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'mediation',
            'session_canceled',
            $workspace->id,
            $viewer->user_id,
            ['mediation_session_id' => $mediationSession->id],
        );

        return back()->with('status', 'Mediation session closed. Additional support was requested.');
    }

    public function report(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());

        return Inertia::render('mediation/report', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'defaults' => [
                'start' => now()->subMonths(6)->toDateString(),
                'end' => now()->toDateString(),
            ],
        ]);
    }

    public function printReport(Request $request): \Symfony\Component\HttpFoundation\Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->mediationAccess->resolveWorkspaceMember($workspace, $request->user());

        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
        ]);

        $report = $this->reportBuilder->build(
            $workspace,
            CarbonImmutable::parse((string) $validated['start']),
            CarbonImmutable::parse((string) $validated['end']),
        );

        $workspacePayload = $this->serializeWorkspace($workspace, $viewer);
        $filename = sprintf(
            'communication-climate-report-%d-%s-to-%s.pdf',
            $workspace->id,
            $report['period']['start'],
            $report['period']['end'],
        );

        $pdf = $this->pdfBuilder->render($workspacePayload, $report);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=0, must-revalidate',
        ]);
    }

    private function resolveWorkspace(Request $request, ?int $fallbackWorkspaceId = null): ?Workspace
    {
        if ($fallbackWorkspaceId !== null && $request->query('workspace') === null) {
            $request->merge(['workspace' => $fallbackWorkspaceId]);
        }

        return $this->currentWorkspaceResolver->resolve($request);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeWorkspace(Workspace $workspace, WorkspaceMember $viewer): array
    {
        return [
            'id' => $workspace->id,
            'name' => $workspace->name,
            'viewer' => [
                'member_id' => $viewer->id,
                'name' => $viewer->user->name,
                'role' => $viewer->role,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSessionCard(MediationSession $session): array
    {
        return [
            'id' => $session->id,
            'subject' => $session->subject,
            'status' => $session->status->value,
            'status_label' => $session->status->label(),
            'started_at_label' => $session->started_at?->format('M j, Y'),
            'messages_count' => $session->messages->count(),
            'href' => route('mediation.show', ['mediationSession' => $session->id, 'workspace' => $session->workspace_id]),
            'cta_label' => $session->status === MediationSessionStatus::Active ? 'Continue' : 'View',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeSession(MediationSession $session, WorkspaceMember $viewer): array
    {
        $warningsSummary = $this->analyzer->summarizeWarnings($session->messages);

        return [
            'id' => $session->id,
            'subject' => $session->subject,
            'status' => $session->status->value,
            'status_label' => $session->status->label(),
            'started_at_label' => $session->started_at?->diffForHumans(),
            'resolution_reason' => $session->resolved_reason,
            'cancellation_reason' => $session->canceled_reason,
            'can_reply' => $session->status === MediationSessionStatus::Active,
            'messages' => $session->messages->map(function ($message) use ($viewer): array {
                $authorName = $message->role === MediationMessageRole::Assistant
                    ? 'AI Mediator'
                    : ($message->role === MediationMessageRole::System
                        ? 'System'
                        : ($message->workspaceMember?->user->name ?? $viewer->user->name));

                return [
                    'id' => $message->id,
                    'role' => $message->role->value,
                    'kind' => $message->kind,
                    'body' => $message->body,
                    'author_name' => $authorName,
                    'created_at_label' => $message->created_at?->format('g:i A'),
                    'analysis' => data_get($message->metadata, 'analysis', ['warnings' => [], 'patterns' => []]),
                    'tag' => data_get($message->metadata, 'tag'),
                ];
            })->all(),
            'warnings' => $warningsSummary['warnings'],
        ];
    }
}
