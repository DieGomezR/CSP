<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\MediationSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\MediationSession;
use Inertia\Inertia;
use Inertia\Response;

final class MediationEscalationController extends Controller
{
    public function index(): Response
    {
        $sessions = MediationSession::query()
            ->with(['workspace:id,name', 'createdByMember.user:id,name,email'])
            ->where('status', MediationSessionStatus::Canceled->value)
            ->latest('closed_at')
            ->get()
            ->map(static function (MediationSession $session): array {
                return [
                    'id' => $session->id,
                    'workspace_name' => $session->workspace->name,
                    'subject' => $session->subject,
                    'reason' => $session->canceled_reason,
                    'created_by' => $session->createdByMember->user->name,
                    'closed_at' => $session->closed_at?->format('M j, Y g:i A'),
                    'session_url' => route('mediation.show', [
                        'mediationSession' => $session->id,
                        'workspace' => $session->workspace_id,
                    ]),
                ];
            })
            ->all();

        return Inertia::render('admin/mediation-escalations', [
            'sessions' => $sessions,
        ]);
    }
}
