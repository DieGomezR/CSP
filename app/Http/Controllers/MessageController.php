<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Messages\CreateWorkspaceMessageThread;
use App\Actions\Messages\SendWorkspaceMessage;
use App\Http\Requests\Messages\StoreWorkspaceMessageThreadRequest;
use App\Http\Requests\Messages\StoreWorkspaceMessageRequest;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use App\Models\WorkspaceMessageThread;
use App\Support\Messages\MessageAccess;
use App\Support\Notifications\WorkspaceNotificationDispatcher;
use App\Support\Realtime\WorkspaceRealtimeDispatcher;
use App\Support\Workspaces\CurrentWorkspaceResolver;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

final class MessageController extends Controller
{
    public function __construct(
        private readonly CurrentWorkspaceResolver $currentWorkspaceResolver,
        private readonly MessageAccess $messageAccess,
        private readonly CreateWorkspaceMessageThread $createWorkspaceMessageThread,
        private readonly SendWorkspaceMessage $sendWorkspaceMessage,
        private readonly WorkspaceNotificationDispatcher $workspaceNotificationDispatcher,
        private readonly WorkspaceRealtimeDispatcher $workspaceRealtimeDispatcher,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $workspace = $this->currentWorkspaceResolver->resolve($request);

        if (! $request->user()->workspaces()->exists() || $workspace === null) {
            return to_route('onboarding.family.create');
        }

        $workspace->loadMissing('members.user:id,name,email');
        $viewer = $this->messageAccess->resolveWorkspaceMember($workspace, $request->user());
        $threads = $this->messageAccess->visibleThreads($workspace);
        $selectedThread = $this->resolveSelectedThread($request, $threads);

        if ($selectedThread instanceof WorkspaceMessageThread) {
            $selectedThread->loadMissing(['messages.workspaceMember.user:id,name,email', 'members.user:id,name,email']);
            $this->messageAccess->markThreadAsRead($selectedThread, $viewer);
            $threads = $this->messageAccess->visibleThreads($workspace);
            $selectedThread = $this->resolveSelectedThread($request, $threads);
            $selectedThread?->loadMissing(['messages.workspaceMember.user:id,name,email', 'members.user:id,name,email']);
        }

        return Inertia::render('messages/index', [
            'workspace' => $this->serializeWorkspace($workspace, $viewer),
            'threads' => $this->serializeThreads($threads, $viewer),
            'selectedThread' => $selectedThread ? $this->serializeThread($selectedThread, $viewer) : null,
            'participants' => $workspace->members
                ->sortBy(fn (WorkspaceMember $member): string => $member->user->name)
                ->values()
                ->map(fn (WorkspaceMember $member): array => [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'role' => $member->role,
                    'initials' => $this->initials($member->user->name),
                ])->all(),
            'composer' => [
                'workspace_id' => $workspace->id,
                'thread_id' => $selectedThread?->id,
            ],
        ]);
    }

    public function storeThread(StoreWorkspaceMessageThreadRequest $request): RedirectResponse
    {
        $workspace = Workspace::query()
            ->with('members.user:id,name,email')
            ->findOrFail((int) $request->validated('workspace_id'));

        $viewer = $this->messageAccess->resolveWorkspaceMember($workspace, $request->user());

        $thread = $this->createWorkspaceMessageThread->handle(
            $workspace,
            $viewer,
            (string) $request->validated('subject'),
        );

        $this->workspaceNotificationDispatcher->dispatch(
            $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'message_thread_created',
            'New conversation started',
            sprintf('%s started "%s".', $viewer->user->name, $thread->subject),
            route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id]),
            $workspace,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'messages',
            'thread_created',
            $workspace->id,
            $viewer->user_id,
            ['thread_id' => $thread->id],
        );

        return to_route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id])
            ->with('status', 'Conversation created.');
    }

    public function store(StoreWorkspaceMessageRequest $request): RedirectResponse
    {
        $workspace = Workspace::query()
            ->with('members.user:id,name,email')
            ->findOrFail((int) $request->validated('workspace_id'));

        $viewer = $this->messageAccess->resolveWorkspaceMember($workspace, $request->user());
        $thread = WorkspaceMessageThread::query()
            ->with(['members.user:id,name,email'])
            ->findOrFail((int) $request->validated('thread_id'));
        $this->messageAccess->ensureThreadBelongsToWorkspace($thread, $workspace);

        $this->sendWorkspaceMessage->handle(
            $workspace,
            $thread,
            $viewer,
            (string) $request->validated('message'),
            $request->validated('client_request_id'),
        );

        $this->workspaceNotificationDispatcher->dispatch(
            $this->workspaceNotificationDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'message_received',
            'New family message',
            sprintf('%s posted in "%s".', $viewer->user->name, $thread->subject),
            route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id]),
            $workspace,
        );

        $this->workspaceRealtimeDispatcher->dispatch(
            $this->workspaceRealtimeDispatcher->otherWorkspaceUsers($workspace, $viewer),
            'messages',
            'message_posted',
            $workspace->id,
            $viewer->user_id,
            ['thread_id' => $thread->id],
        );

        return to_route('messages.index', ['workspace' => $workspace->id, 'thread' => $thread->id])
            ->with('status', 'Message sent.');
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
                'initials' => $this->initials($viewer->user->name),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeMessage(WorkspaceMessage $message, WorkspaceMember $viewer): array
    {
        $author = $message->workspaceMember->user;
        $isViewer = $message->workspace_member_id === $viewer->id;

        return [
            'id' => $message->id,
            'body' => $message->body,
            'created_at_label' => $message->created_at?->format('g:i A'),
            'created_at_relative' => $message->created_at?->diffForHumans(),
            'is_viewer' => $isViewer,
            'author' => [
                'name' => $author->name,
                'role' => $message->workspaceMember->role,
                'initials' => $this->initials($author->name),
            ],
        ];
    }

    /**
     * @param Collection<int, WorkspaceMessageThread> $threads
     * @return list<array<string, mixed>>
     */
    private function serializeThreads(Collection $threads, WorkspaceMember $viewer): array
    {
        return $threads->map(fn (WorkspaceMessageThread $thread): array => $this->serializeThreadCard($thread, $viewer))->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeThread(WorkspaceMessageThread $thread, WorkspaceMember $viewer): array
    {
        return [
            'id' => $thread->id,
            'subject' => $thread->subject,
            'messages' => $thread->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn (WorkspaceMessage $message): array => $this->serializeMessage($message, $viewer))
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeThreadCard(WorkspaceMessageThread $thread, WorkspaceMember $viewer): array
    {
        $latestMessage = $thread->messages()->latest('created_at')->first();
        $lastMessageAt = $thread->last_message_at;

        return [
            'id' => $thread->id,
            'subject' => $thread->subject,
            'messages_count' => $thread->messages_count,
            'last_message_at_label' => $lastMessageAt === null ? null : Carbon::parse($lastMessageAt)->diffForHumans(),
            'unread_count' => $this->messageAccess->unreadCountForThread($thread, $viewer),
            'href' => route('messages.index', ['workspace' => $thread->workspace_id, 'thread' => $thread->id]),
            'preview' => $latestMessage?->body !== null ? str($latestMessage->body)->limit(90)->value() : 'No messages yet.',
        ];
    }

    /**
     * @param Collection<int, WorkspaceMessageThread> $threads
     */
    private function resolveSelectedThread(Request $request, Collection $threads): ?WorkspaceMessageThread
    {
        $threadId = $request->integer('thread');

        if ($threadId > 0) {
            $thread = $threads->firstWhere('id', $threadId);

            return $thread instanceof WorkspaceMessageThread ? $thread : null;
        }

        /** @var WorkspaceMessageThread|null $thread */
        $thread = $threads->first();

        return $thread;
    }

    private function initials(?string $name): string
    {
        if ($name === null || trim($name) === '') {
            return 'KS';
        }

        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $initials = collect($parts)
            ->filter()
            ->take(2)
            ->map(static fn (string $part): string => strtoupper(substr($part, 0, 1)))
            ->implode('');

        return $initials !== '' ? $initials : 'KS';
    }
}
