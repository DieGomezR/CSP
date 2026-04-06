<?php

namespace App\Models;

use Database\Factories\CalendarEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CalendarEvent extends Model
{
    /** @use HasFactory<CalendarEventFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'creator_id',
        'title',
        'description',
        'location',
        'timezone',
        'starts_at',
        'ends_at',
        'is_all_day',
        'color',
        'recurrence_type',
        'recurrence_interval',
        'recurrence_days_of_week',
        'recurrence_until',
        'status',
        'source',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_all_day' => 'boolean',
            'recurrence_days_of_week' => 'array',
            'recurrence_until' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(Child::class, 'calendar_event_child')
            ->withTimestamps();
    }
}
