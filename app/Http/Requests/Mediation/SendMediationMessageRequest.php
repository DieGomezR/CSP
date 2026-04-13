<?php

declare(strict_types=1);

namespace App\Http\Requests\Mediation;

use Illuminate\Foundation\Http\FormRequest;

final class SendMediationMessageRequest extends FormRequest
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
            'message' => ['required', 'string', 'min:2', 'max:2500'],
            'client_request_id' => ['required', 'string', 'uuid'],
        ];
    }
}
