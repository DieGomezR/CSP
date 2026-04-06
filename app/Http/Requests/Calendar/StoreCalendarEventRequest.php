<?php

namespace App\Http\Requests\Calendar;

use App\Models\Workspace;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $workspace = $this->route('workspace');

        return $workspace instanceof Workspace
            && $this->user() !== null
            && $workspace->users()->whereKey($this->user()->id)->exists();
    }

    /**
     * @return array<string, array<int, ValidationRule|string>|string>
     */
    public function rules(): array
    {
        /** @var Workspace|null $workspace */
        $workspace = $this->route('workspace');

        return [
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:120'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'timezone' => ['required', 'timezone'],
            'is_all_day' => ['required', 'boolean'],
            'color' => ['required', 'regex:/^#(?:[0-9A-Fa-f]{6})$/'],
            'child_ids' => ['nullable', 'array'],
            'child_ids.*' => [
                'integer',
                Rule::exists('children', 'id')->where(
                    fn ($query) => $query->where('workspace_id', $workspace?->id ?? 0)
                ),
            ],
            'recurrence_type' => ['required', Rule::in(['none', 'daily', 'weekly', 'monthly'])],
            'recurrence_interval' => ['nullable', 'integer', 'min:1', 'max:12'],
            'recurrence_until' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'recurrence_days_of_week' => ['nullable', 'array'],
            'recurrence_days_of_week.*' => ['integer', Rule::in(range(0, 6))],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_all_day' => $this->boolean('is_all_day'),
            'child_ids' => collect($this->input('child_ids', []))
                ->filter(fn ($value) => $value !== null && $value !== '')
                ->map(fn ($value) => (int) $value)
                ->values()
                ->all(),
            'recurrence_days_of_week' => collect($this->input('recurrence_days_of_week', []))
                ->filter(fn ($value) => $value !== null && $value !== '')
                ->map(fn ($value) => (int) $value)
                ->values()
                ->all(),
        ]);
    }
}
