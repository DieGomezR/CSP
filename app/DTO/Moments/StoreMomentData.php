<?php

declare(strict_types=1);

namespace App\DTO\Moments;

use Illuminate\Http\UploadedFile;

final readonly class StoreMomentData
{
    public function __construct(
        public int $workspaceId,
        public int $createdByMemberId,
        public string $visibility,
        public UploadedFile $photo,
        public ?string $caption,
        public ?string $takenOn,
    ) {
    }

    /**
     * @param array<string, mixed> $validated
     */
    public static function fromValidated(array $validated, int $workspaceId, int $createdByMemberId): self
    {
        return new self(
            workspaceId: $workspaceId,
            createdByMemberId: $createdByMemberId,
            visibility: (string) $validated['visibility'],
            photo: $validated['photo'],
            caption: isset($validated['caption']) && $validated['caption'] !== '' ? (string) $validated['caption'] : null,
            takenOn: isset($validated['taken_on']) && $validated['taken_on'] !== '' ? (string) $validated['taken_on'] : null,
        );
    }
}
