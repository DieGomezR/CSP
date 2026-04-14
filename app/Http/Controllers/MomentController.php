<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Moments\StoreMoment;
use App\DTO\Moments\StoreMomentData;
use App\Enums\MomentReactionType;
use App\Enums\MomentVisibility;
use App\Http\Requests\Moments\StoreMomentRequest;
use App\Models\Moment;
use App\Models\MomentReaction;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Moments\MomentAccess;
use App\Support\Notifications\WorkspaceNotificationDispatcher;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MomentController extends Controller
{
    public function __construct(
        private readonly MomentAccess $momentAccess,
        private readonly StoreMoment $storeMoment,
        private readonly WorkspaceNotificationDispatcher $workspaceNotificationDispatcher,
        private readonly WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());
        $moments = $this->momentAccess
            ->visibleMomentsQuery($workspace, $viewer)
            ->latest()
            ->get();

        return Inertia::render('moments/index', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'moments' => $this->serializeMoments($moments, $viewer),
            'reactionOptions' => MomentReactionType::options(),
            'visibilityOptions' => MomentVisibility::options(),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $workspace = $this->resolveWorkspace($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());

        return Inertia::render('moments/create', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'form' => [
                'workspace_id' => $workspace->id,
                'caption' => '',
                'taken_on' => null,
                'visibility' => MomentVisibility::Family->value,
            ],
            'visibilityOptions' => MomentVisibility::options(),
        ]);
    }

    public function store(StoreMomentRequest $request): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail((int) $request->validated('workspace_id'));
        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());

        $moment = $this->storeMoment->handle(
            StoreMomentData::fromValidated($request->validated(), $workspace->id, $viewer->id),
        );

        if ($moment->visibility->value === 'family') {
            $this->workspaceNotificationDispatcher->dispatch(
                $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
                'moment_shared',
                'New family moment',
                sprintf('%s shared a new moment.', $viewer->user->name),
                route('moments.index', ['workspace' => $workspace->id]),
                $workspace,
            );

            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
                'moments',
                'moment_created',
                $workspace->id,
                $viewer->user_id,
                ['moment_id' => $moment->id],
            );
        }

        return to_route('moments.index', ['workspace' => $workspace->id])
            ->with('status', 'Moment shared!');
    }

    public function destroy(Request $request, Moment $moment): RedirectResponse
    {
        $workspace = Workspace::query()->findOrFail($moment->workspace_id);
        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());
        $shouldSyncFamilyFeed = $moment->visibility === MomentVisibility::Family;
        $momentId = $moment->id;

        if (! $this->momentAccess->canDelete($moment, $viewer)) {
            throw new AuthorizationException('You cannot delete this moment.');
        }

        Storage::disk('local')->delete($moment->photo_path);
        $moment->delete();

        if ($shouldSyncFamilyFeed) {
            $this->workspaceRealtimeDispatcher->dispatch(
                $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
                'moments',
                'moment_deleted',
                $workspace->id,
                $viewer->user_id,
                ['moment_id' => $momentId],
            );
        }

        return back()->with('status', 'Moment deleted.');
    }

    public function image(Request $request, Moment $moment): BinaryFileResponse
    {
        $workspace = Workspace::query()->findOrFail($moment->workspace_id);
        $viewer = $this->momentAccess->resolveWorkspaceMember($workspace, $request->user());

        if (! $this->momentAccess->canView($moment, $viewer)) {
            throw new AuthorizationException('You cannot view this moment.');
        }

        abort_unless(Storage::disk('local')->exists($moment->photo_path), 404);

        return response()->file(
            Storage::disk('local')->path($moment->photo_path),
            [
                'Content-Type' => $moment->photo_mime_type,
                'Content-Disposition' => 'inline; filename="'.$moment->photo_original_name.'"',
                'Cache-Control' => 'private, max-age=3600',
            ],
        );
    }

    private function resolveWorkspace(Request $request, ?int $fallbackWorkspaceId = null): ?Workspace
    {
        $workspaceId = $request->integer('workspace', $fallbackWorkspaceId ?? 0);

        /** @var Workspace|null $workspace */
        $workspace = $request->user()->workspaces()
            ->where('type', 'family')
            ->when($workspaceId > 0, fn ($query) => $query->where('workspaces.id', $workspaceId))
            ->with([
                'members.user:id,name,email',
                'owner:id,name,email',
            ])
            ->withCount(['children', 'members', 'calendarEvents'])
            ->orderBy('name')
            ->first();

        return $workspace;
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeWorkspace(Workspace $workspace, WorkspaceMember $viewer): array
    {
        return [
            'id' => $workspace->id,
            'name' => $workspace->name,
            'timezone' => $workspace->timezone,
            'children_count' => $workspace->children_count,
            'members_count' => $workspace->members_count,
            'events_count' => $workspace->calendar_events_count,
            'viewer' => [
                'member_id' => $viewer->id,
                'role' => $viewer->role,
                'name' => $viewer->user->name,
            ],
        ];
    }

    /**
     * @param Collection<int, Moment> $moments
     * @return list<array<string, mixed>>
     */
    private function serializeMoments(Collection $moments, WorkspaceMember $viewer): array
    {
        return $moments->map(function (Moment $moment) use ($viewer): array {
            /** @var MomentReaction|null $viewerReaction */
            $viewerReaction = $moment->reactions->firstWhere('workspace_member_id', $viewer->id);
            $reactions = array_map(function (array $option) use ($moment, $viewerReaction): array {
                $count = $moment->reactions->filter(
                    static fn (MomentReaction $reaction): bool => $reaction->reaction->value === $option['value'],
                )->count();

                return [
                    ...$option,
                    'count' => $count,
                    'active' => $viewerReaction?->reaction->value === $option['value'],
                ];
            }, MomentReactionType::options());

            return [
                'id' => $moment->id,
                'caption' => $moment->caption,
                'visibility' => $moment->visibility->value,
                'visibility_label' => $moment->visibility->label(),
                'visibility_description' => $moment->visibility->description(),
                'image_url' => route('moments.image', ['moment' => $moment->id]),
                'can_delete' => $this->momentAccess->canDelete($moment, $viewer),
                'can_react' => $this->momentAccess->canReact($moment, $viewer),
                'created_at_iso' => $moment->created_at?->toIso8601String(),
                'created_at_label' => $moment->created_at?->diffForHumans(),
                'taken_on_iso' => $moment->taken_on?->toDateString(),
                'taken_on_label' => $moment->taken_on?->format('M j, Y'),
                'author' => [
                    'name' => $moment->createdByMember->user->name,
                    'role' => $moment->createdByMember->role,
                    'initials' => $this->initials($moment->createdByMember->user->name),
                ],
                'viewer_reaction' => $viewerReaction?->reaction->value,
                'reactions' => $reactions,
            ];
        })->values()->all();
    }

    private function initials(?string $name): string
    {
        if ($name === null || trim($name) === '') {
            return 'FM';
        }

        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $initials = collect($parts)
            ->filter()
            ->take(2)
            ->map(static fn (string $part): string => strtoupper(substr($part, 0, 1)))
            ->implode('');

        return $initials !== '' ? $initials : 'FM';
    }
}
