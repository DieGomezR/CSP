<?php

declare(strict_types=1);

namespace App\Http\Requests\Mediation;

use Illuminate\Foundation\Http\FormRequest;

final class AskAiForHelpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'client_request_id' => ['required', 'string', 'uuid'],
        ];
    }
}
