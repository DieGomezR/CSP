<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MediationSessionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $created_by_member_id
 * @property string $subject
 * @property MediationSessionStatus $status
 * @property string|null $resolved_reason
 * @property string|null $canceled_reason
 * @property Carbon|null $started_at
 * @property Carbon|null $closed_at
 * @property Carbon|null $last_message_at
 * @property Carbon|null $created_at
 * @property-read Workspace $workspace
 * @property-read WorkspaceMember $createdByMember
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MediationMessage> $messages
 */
class MediationSession extends Model
{
    protected $fillable = [
        'workspace_id',
        'created_by_member_id',
        'subject',
        'status',
        'resolved_reason',
        'canceled_reason',
        'started_at',
        'closed_at',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => MediationSessionStatus::class,
            'started_at' => 'datetime',
            'closed_at' => 'datetime',
            'last_message_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo<WorkspaceMember, $this>
     */
    public function createdByMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class, 'created_by_member_id');
    }

    /**
     * @return HasMany<MediationMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(MediationMessage::class)->orderBy('id');
    }
}
