<?php

declare(strict_types=1);

namespace App\Actions\Expenses;

use App\DTO\Expenses\UpsertExpenseData;
use App\Models\Expense;
use Illuminate\Support\Facades\Storage;

final class UpsertExpense
{
    public function handle(UpsertExpenseData $data, ?Expense $expense = null): Expense
    {
        $expense ??= new Expense();

        $receiptPath = $expense->receipt_path;

        if ($data->receipt !== null) {
            if ($receiptPath !== null) {
                Storage::disk('public')->delete($receiptPath);
            }

            $receiptPath = $data->receipt->store('expense-receipts', 'public');
        }

        $expense->fill([
            'workspace_id' => $data->workspaceId,
            'child_id' => $data->childId,
            'created_by_member_id' => $data->createdByMemberId,
            'shared_with_member_id' => $data->sharedWithMemberId,
            'currency' => strtoupper($data->currency),
            'amount_cents' => $data->amountCents,
            'category' => $data->category,
            'expense_date' => $data->expenseDate,
            'description' => $data->description,
            'other_party_share_percentage' => $data->otherPartySharePercentage,
            'receipt_path' => $receiptPath,
        ]);

        $expense->save();

        return $expense->refresh();
    }
}
