<?php

declare(strict_types=1);

namespace App\DTO\Access;

final readonly class WorkspaceAccessSnapshot
{
    /**
     * @param array<string, bool> $features
     * @param array<string, bool> $abilities
     * @param array{
     *     active: bool,
     *     on_trial: bool,
     *     status: ?string,
     *     plan: ?string,
     *     plan_label: ?string,
     *     billing_mode: ?string,
     *     billing_mode_label: ?string,
     *     covered: bool
     * } $subscription
     */
    public function __construct(
        public int $workspaceId,
        public string $membershipRole,
        public bool $isOwner,
        public array $features,
        public array $abilities,
        public array $subscription,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'workspace_id' => $this->workspaceId,
            'membership_role' => $this->membershipRole,
            'is_owner' => $this->isOwner,
            'features' => $this->features,
            'abilities' => $this->abilities,
            'subscription' => $this->subscription,
        ];
    }
}
