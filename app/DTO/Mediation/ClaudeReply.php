<?php

declare(strict_types=1);

namespace App\DTO\Mediation;

final readonly class ClaudeReply
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public string $text,
        public array $metadata = [],
    ) {
    }
}
