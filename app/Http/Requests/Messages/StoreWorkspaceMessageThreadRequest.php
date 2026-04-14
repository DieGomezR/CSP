<?php

declare(strict_types=1);

namespace App\Http\Requests\Messages;

use Illuminate\Foundation\Http\FormRequest;

final class StoreWorkspaceMessageThreadRequest extends FormRequest
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
            'subject' => ['required', 'string', 'min:2', 'max:140'],
        ];
    }
}
