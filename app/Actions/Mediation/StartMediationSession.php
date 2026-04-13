<?php

declare(strict_types=1);

namespace App\Actions\Mediation;

use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Support\Mediation\MediationAccess;
use Illuminate\Validation\ValidationException;

final class StartMediationSession
{
    public function __construct(
        private readonly MediationAccess $mediationAccess,
    ) {
    }

    public function handle(Workspace $workspace, WorkspaceMember $member, string $subject): MediationSession
    {
        $subject = trim($subject);

        if ($subject === '') {
            throw ValidationException::withMessages([
                'subject' => 'Please enter the topic you want to discuss.',
            ]);
        }

        if ($this->mediationAccess->activeSessionForWorkspace($workspace) instanceof MediationSession) {
            throw ValidationException::withMessages([
                'subject' => 'There is already an active mediation session for this family. Continue that session instead of opening a second one.',
            ]);
        }

        $session = MediationSession::query()->create([
            'workspace_id' => $workspace->id,
            'created_by_member_id' => $member->id,
            'subject' => $subject,
            'status' => MediationSessionStatus::Active,
            'started_at' => now(),
            'last_message_at' => now(),
        ]);

        MediationMessage::query()->create([
            'mediation_session_id' => $session->id,
            'role' => MediationMessageRole::Assistant,
            'kind' => 'intro',
            'body' => "Welcome to this mediated discussion. I'm here to help facilitate a constructive conversation about: **{$subject}**\n\nGround rules:\n\n- Focus on the issue, not the person\n- Use \"I feel\" statements\n- Listen to understand, not to respond\n- Keep your child's best interest at the center\n\nLet's begin. Who would like to share their perspective first?",
            'metadata' => [
                'tag' => 'calm_down',
                'source' => 'deterministic',
            ],
        ]);

        return $session;
    }
}
