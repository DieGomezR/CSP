<?php

declare(strict_types=1);

namespace App\Http\Requests\Expenses;

use App\Enums\ExpenseCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'integer', Rule::exists('workspaces', 'id')],
            'shared_with_member_id' => ['nullable', 'integer', Rule::exists('workspace_members', 'id')],
            'child_id' => ['nullable', 'integer', Rule::exists('children', 'id')],
            'currency' => ['required', 'string', 'size:3'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'category' => ['required', Rule::in(array_map(static fn (ExpenseCategory $category): string => $category->value, ExpenseCategory::cases()))],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
            'other_party_share_percentage' => ['required', 'integer', 'between:0,100'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,pdf', 'max:10240'],
        ];
    }
}
