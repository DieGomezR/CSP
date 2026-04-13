<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\DTO\Mediation\ClaudeReply;
use App\Models\MediationSession;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use RuntimeException;

final class AnthropicMediationClient
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly MediationConversationBuilder $conversationBuilder,
    ) {
    }

    /**
     * @param Collection<int, \App\Models\MediationMessage> $messages
     * @param array{warnings:list<array<string,mixed>>} $warningsSummary
     */
    public function reply(MediationSession $session, Collection $messages, array $warningsSummary, bool $alternateReply = false): ClaudeReply
    {
        $apiKey = (string) config('services.anthropic.key');
        $baseUrl = rtrim((string) config('services.anthropic.base_url', 'https://api.anthropic.com'), '/');
        $model = (string) config('services.anthropic.model', 'claude-sonnet-4-5');
        $version = (string) config('services.anthropic.version', '2023-06-01');

        if ($apiKey === '' || $model === '') {
            return new ClaudeReply(
                text: "I'm ready to help mediate this conversation, but the Claude integration is not configured yet. Please add the Anthropic API key and model, or continue with the written summary and next-step prompts.",
                metadata: ['provider' => 'fallback', 'configured' => false],
            );
        }

        $payload = [
            'model' => $model,
            'max_tokens' => 550,
            'system' => $this->conversationBuilder->buildSystemPrompt($session, $warningsSummary),
            'messages' => $this->conversationBuilder->buildMessages($session, $messages, $alternateReply),
        ];

        $response = $this->http
            ->baseUrl($baseUrl)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => $version,
                'content-type' => 'application/json',
            ])
            ->timeout(30)
            ->acceptJson()
            ->post('/v1/messages', $payload);

        try {
            $response->throw();
        } catch (RequestException $exception) {
            throw new RuntimeException('Anthropic mediation request failed.', previous: $exception);
        }

        $content = Arr::get($response->json(), 'content', []);
        $text = collect(is_array($content) ? $content : [])
            ->filter(static fn (mixed $item): bool => is_array($item) && ($item['type'] ?? null) === 'text')
            ->map(static fn (array $item): string => (string) ($item['text'] ?? ''))
            ->implode("\n\n");

        $text = Str::squish($text);

        if ($text === '') {
            throw new RuntimeException('Anthropic mediation response was empty.');
        }

        return new ClaudeReply(
            text: $text,
            metadata: [
                'provider' => 'anthropic',
                'configured' => true,
                'request_id' => $response->header('request-id'),
                'model' => Arr::get($response->json(), 'model'),
                'stop_reason' => Arr::get($response->json(), 'stop_reason'),
                'usage' => Arr::get($response->json(), 'usage', []),
            ],
        );
    }
}
