<?php

namespace App\Models;

use Database\Factories\WorkspaceMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
