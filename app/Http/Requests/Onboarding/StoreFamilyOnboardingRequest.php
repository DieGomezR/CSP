<?php

namespace App\Http\Requests\Onboarding;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;

class StoreFamilyOnboardingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $children = collect($this->input('children', []))
            ->map(function ($child) {
                $child = is_array($child) ? $child : [];

                return [
                    'name' => trim((string) Arr::get($child, 'name', '')),
                    'birthdate' => Arr::get($child, 'birthdate') ?: null,
                    'color' => Arr::get($child, 'color', '#4DBFAE'),
                ];
            })
            ->values()
            ->all();

        $this->merge([
            'family_name' => trim((string) $this->input('family_name', '')),
            'children' => $children,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'family_name' => ['required', 'string', 'max:120'],
            'timezone' => ['required', 'timezone'],
            'children' => ['required', 'array', 'min:1', 'max:8'],
            'children.*.name' => ['required', 'string', 'max:80'],
            'children.*.birthdate' => ['nullable', 'date', 'before:today'],
            'children.*.color' => ['required', 'string', 'regex:/^#[A-Fa-f0-9]{6}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'children.min' => 'Add at least one child to start the family workspace.',
            'children.*.name.required' => 'Each child needs a name.',
            'children.*.birthdate.before' => 'Birthdates must be in the past.',
        ];
    }
}
