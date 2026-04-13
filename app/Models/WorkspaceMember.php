<?php

namespace App\Models;

use Database\Factories\WorkspaceMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $user_id
 * @property string $role
 * @property string $status
 * @property-read Workspace $workspace
 * @property-read User $user
 */
class WorkspaceMember extends Model
{
    /** @use HasFactory<WorkspaceMemberFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'role',
        'status',
        'notification_preferences',
        'joined_at',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'notification_preferences' => 'array',
            'joined_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Workspace, self>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo<User, self>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdExpenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'created_by_member_id');
    }

    public function sharedExpenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'shared_with_member_id');
    }

    /**
     * @return HasMany<Moment, self>
     */
    public function moments(): HasMany
    {
        return $this->hasMany(Moment::class, 'created_by_member_id');
    }

    /**
     * @return HasMany<MomentReaction, self>
     */
    public function momentReactions(): HasMany
    {
        return $this->hasMany(MomentReaction::class);
    }

    /**
     * @return HasMany<MediationSession, self>
     */
    public function mediationSessions(): HasMany
    {
        return $this->hasMany(MediationSession::class, 'created_by_member_id');
    }

    /**
     * @return HasMany<MediationMessage, self>
     */
    public function mediationMessages(): HasMany
    {
        return $this->hasMany(MediationMessage::class);
    }
}
