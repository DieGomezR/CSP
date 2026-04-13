<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MomentReactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $moment_id
 * @property int $workspace_member_id
 * @property MomentReactionType $reaction
 * @property-read Moment $moment
 * @property-read WorkspaceMember $workspaceMember
 */
class MomentReaction extends Model
{
    protected $fillable = [
        'moment_id',
        'workspace_member_id',
        'reaction',
    ];

    protected function casts(): array
    {
        return [
            'reaction' => MomentReactionType::class,
        ];
    }

    /**
     * @return BelongsTo<Moment, $this>
     */
    public function moment(): BelongsTo
    {
        return $this->belongsTo(Moment::class);
    }

    /**
     * @return BelongsTo<WorkspaceMember, $this>
     */
    public function workspaceMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class);
    }
}
