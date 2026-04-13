<?php

declare(strict_types=1);

namespace App\Actions\Moments;

use App\DTO\Moments\StoreMomentData;
use App\Models\Moment;

final class StoreMoment
{
    public function handle(StoreMomentData $data): Moment
    {
        $storedPath = $data->photo->store("moments/{$data->workspaceId}", 'local');

        $moment = Moment::query()->create([
            'workspace_id' => $data->workspaceId,
            'created_by_member_id' => $data->createdByMemberId,
            'visibility' => $data->visibility,
            'photo_path' => $storedPath,
            'photo_original_name' => $data->photo->getClientOriginalName(),
            'photo_mime_type' => $data->photo->getMimeType(),
            'photo_size_bytes' => $data->photo->getSize(),
            'caption' => $data->caption,
            'taken_on' => $data->takenOn,
        ]);

        return $moment->refresh();
    }
}
