<?php

declare(strict_types=1);

namespace App\Actions\Mediation;

use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use Illuminate\Validation\ValidationException;

final class ResolveMediationSession
{
    public function handle(MediationSession $session, string $reason): void
    {
        $reason = trim($reason);

        if ($reason === '') {
            throw ValidationException::withMessages([
                'reason' => 'Please explain what was agreed before marking the session as resolved.',
            ]);
        }

        $session->forceFill([
            'status' => MediationSessionStatus::Resolved,
            'resolved_reason' => $reason,
            'closed_at' => now(),
            'last_message_at' => now(),
        ])->save();

        MediationMessage::query()->create([
            'mediation_session_id' => $session->id,
            'role' => MediationMessageRole::Assistant,
            'kind' => 'resolution',
            'body' => "Session Resolved\n\nGreat work. The session was closed with this summary:\n\n{$reason}\n\nThis conversation is now archived and can be referenced later if needed.",
            'metadata' => [
                'reason' => $reason,
            ],
        ]);
    }
}
