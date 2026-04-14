<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\WorkspaceMessageThreadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class WorkspaceMessageThread extends Model
{
    /** @use HasFactory<WorkspaceMessageThreadFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'created_by_member_id',
        'subject',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
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
     * @return HasMany<WorkspaceMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WorkspaceMessage::class);
    }

    /**
     * @return BelongsToMany<WorkspaceMember, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(
            WorkspaceMember::class,
            'workspace_message_thread_members'
        )->withPivot(['last_read_at'])->withTimestamps();
    }
}
