<?php

declare(strict_types=1);

namespace App\Http\Requests\Messages;

use Illuminate\Foundation\Http\FormRequest;

final class StoreWorkspaceMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'workspace_id' => ['required', 'integer', 'exists:workspaces,id'],
            'thread_id' => ['required', 'integer', 'exists:workspace_message_threads,id'],
            'message' => ['required', 'string', 'min:1', 'max:4000'],
            'client_request_id' => ['nullable', 'string', 'max:120'],
        ];
    }
}
