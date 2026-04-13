<?php

declare(strict_types=1);

namespace App\DTO\Expenses;

use Illuminate\Http\UploadedFile;

final readonly class UpsertExpenseData
{
    public function __construct(
        public int $workspaceId,
        public ?int $childId,
        public int $createdByMemberId,
        public int $sharedWithMemberId,
        public string $currency,
        public int $amountCents,
        public string $category,
        public string $expenseDate,
        public ?string $description,
        public int $otherPartySharePercentage,
        public ?UploadedFile $receipt,
    ) {
    }

    /**
     * @param array<string, mixed> $validated
     */
    public static function fromValidated(array $validated, int $workspaceId, int $createdByMemberId, int $sharedWithMemberId): self
    {
        return new self(
            workspaceId: $workspaceId,
            childId: isset($validated['child_id']) ? (int) $validated['child_id'] : null,
            createdByMemberId: $createdByMemberId,
            sharedWithMemberId: $sharedWithMemberId,
            currency: (string) $validated['currency'],
            amountCents: (int) round(((float) $validated['amount']) * 100),
            category: (string) $validated['category'],
            expenseDate: (string) $validated['expense_date'],
            description: isset($validated['description']) && $validated['description'] !== '' ? (string) $validated['description'] : null,
            otherPartySharePercentage: (int) $validated['other_party_share_percentage'],
            receipt: $validated['receipt'] ?? null,
        );
    }
}
