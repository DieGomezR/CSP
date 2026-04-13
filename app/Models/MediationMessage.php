<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MediationMessageRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $mediation_session_id
 * @property int|null $workspace_member_id
 * @property int|null $response_to_message_id
 * @property MediationMessageRole $role
 * @property string $kind
 * @property string $body
 * @property string|null $client_request_id
 * @property array<string, mixed>|null $metadata
 * @property-read MediationSession $session
 * @property-read WorkspaceMember|null $workspaceMember
 * @property-read MediationMessage|null $responseToMessage
 */
class MediationMessage extends Model
{
    protected $fillable = [
        'mediation_session_id',
        'workspace_member_id',
        'response_to_message_id',
        'role',
        'kind',
        'body',
        'client_request_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'role' => MediationMessageRole::class,
            'metadata' => 'array',
        ];
    }

    /**
     * @return BelongsTo<MediationSession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(MediationSession::class, 'mediation_session_id');
    }

    /**
     * @return BelongsTo<WorkspaceMember, $this>
     */
    public function workspaceMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class);
    }

    /**
     * @return BelongsTo<MediationMessage, $this>
     */
    public function responseToMessage(): BelongsTo
    {
        return $this->belongsTo(MediationMessage::class, 'response_to_message_id');
    }
}
