<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarFeed extends Model
{
    protected $fillable = [
        'workspace_id',
        'name',
        'token',
        'last_accessed_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
