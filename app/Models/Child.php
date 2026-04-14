<?php

namespace App\Models;

use Database\Factories\ChildFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $color
 * @property Carbon|null $birthdate
 */

class Child extends Model
{
    /** @use HasFactory<ChildFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'color',
        'birthdate',
        'notes',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'meta' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function calendarEvents(): BelongsToMany
    {
        return $this->belongsToMany(CalendarEvent::class, 'calendar_event_child')
            ->withTimestamps();
    }
}
