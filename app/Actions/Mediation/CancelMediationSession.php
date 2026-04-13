<?php

declare(strict_types=1);

namespace App\Actions\Mediation;

use App\Enums\MediationMessageRole;
use App\Enums\MediationSessionStatus;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use Illuminate\Validation\ValidationException;

final class CancelMediationSession
{
    public function handle(MediationSession $session, string $reason): void
    {
        $reason = trim($reason);

        if ($reason === '') {
            throw ValidationException::withMessages([
                'reason' => 'Please explain why you need more help before closing this session.',
            ]);
        }

        $session->forceFill([
            'status' => MediationSessionStatus::Canceled,
            'canceled_reason' => $reason,
            'closed_at' => now(),
            'last_message_at' => now(),
        ])->save();

        MediationMessage::query()->create([
            'mediation_session_id' => $session->id,
            'role' => MediationMessageRole::Assistant,
            'kind' => 'cancellation',
            'body' => "Additional support requested\n\nThis session was closed because more help is needed:\n\n{$reason}\n\nThe conversation is archived for future reference.",
            'metadata' => [
                'reason' => $reason,
            ],
        ]);
    }
}
