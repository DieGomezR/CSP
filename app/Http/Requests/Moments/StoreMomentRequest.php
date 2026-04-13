<?php

declare(strict_types=1);

namespace App\Http\Requests\Moments;

use App\Enums\MomentVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMomentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'integer', Rule::exists('workspaces', 'id')],
            'photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:10240'],
            'caption' => ['nullable', 'string', 'max:500'],
            'taken_on' => ['nullable', 'date', 'before_or_equal:today'],
            'visibility' => ['required', Rule::in(array_map(static fn (MomentVisibility $visibility): string => $visibility->value, MomentVisibility::cases()))],
        ];
    }
}
