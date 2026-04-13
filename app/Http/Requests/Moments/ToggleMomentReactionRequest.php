<?php

declare(strict_types=1);

namespace App\Http\Requests\Moments;

use App\Enums\MomentReactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ToggleMomentReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reaction' => ['required', Rule::in(array_map(static fn (MomentReactionType $reaction): string => $reaction->value, MomentReactionType::cases()))],
        ];
    }
}
