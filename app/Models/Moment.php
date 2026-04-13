<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MomentVisibility;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $created_by_member_id
 * @property MomentVisibility $visibility
 * @property string $photo_path
 * @property string $photo_original_name
 * @property string $photo_mime_type
 * @property int $photo_size_bytes
 * @property string|null $caption
 * @property Carbon|null $taken_on
 * @property Carbon|null $created_at
 * @property-read Workspace $workspace
 * @property-read WorkspaceMember $createdByMember
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MomentReaction> $reactions
 */
class Moment extends Model
{
    protected $fillable = [
        'workspace_id',
        'created_by_member_id',
        'visibility',
        'photo_path',
        'photo_original_name',
        'photo_mime_type',
        'photo_size_bytes',
        'caption',
        'taken_on',
    ];

    protected function casts(): array
    {
        return [
            'visibility' => MomentVisibility::class,
            'taken_on' => 'date',
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
     * @return HasMany<MomentReaction, $this>
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(MomentReaction::class);
    }
}
