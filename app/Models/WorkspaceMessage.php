<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\WorkspaceMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $workspace_message_thread_id
 * @property int $workspace_member_id
 * @property string|null $client_request_id
 * @property string $body
 * @property-read Workspace $workspace
 * @property-read WorkspaceMember $workspaceMember
 */
final class WorkspaceMessage extends Model
{
    /** @use HasFactory<WorkspaceMessageFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'workspace_message_thread_id',
        'workspace_member_id',
        'client_request_id',
        'body',
    ];

    /**
     * @return BelongsTo<Workspace, $this>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * @return BelongsTo<WorkspaceMessageThread, $this>
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMessageThread::class, 'workspace_message_thread_id');
    }

    /**
     * @return BelongsTo<WorkspaceMember, $this>
     */
    public function workspaceMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class);
    }
}
