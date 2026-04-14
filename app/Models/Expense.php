<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ExpenseStatus;
use Database\Factories\ExpenseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int|null $child_id
 * @property int $created_by_member_id
 * @property int $shared_with_member_id
 * @property int|null $accepted_by_member_id
 * @property string $currency
 * @property int $amount_cents
 * @property float $amount
 * @property string $category
 * @property Carbon|null $expense_date
 * @property string|null $description
 * @property int $other_party_share_percentage
 * @property ExpenseStatus $status
 * @property string|null $receipt_path
 * @property Carbon|null $accepted_at
 * @property-read Workspace $workspace
 * @property-read Child|null $child
 * @property-read WorkspaceMember $createdByMember
 * @property-read WorkspaceMember $sharedWithMember
 * @property-read WorkspaceMember|null $acceptedByMember
 */

class Expense extends Model
{
    /** @use HasFactory<ExpenseFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'child_id',
        'created_by_member_id',
        'shared_with_member_id',
        'accepted_by_member_id',
        'currency',
        'amount_cents',
        'category',
        'expense_date',
        'description',
        'other_party_share_percentage',
        'status',
        'receipt_path',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'expense_date' => 'date',
            'accepted_at' => 'datetime',
            'status' => ExpenseStatus::class,
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function createdByMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class, 'created_by_member_id');
    }

    public function sharedWithMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class, 'shared_with_member_id');
    }

    public function acceptedByMember(): BelongsTo
    {
        return $this->belongsTo(WorkspaceMember::class, 'accepted_by_member_id');
    }

    public function getAmountAttribute(): float
    {
        return round($this->amount_cents / 100, 2);
    }
}
