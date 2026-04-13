<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\Models\MediationMessage;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

final class MediationCommunicationAnalyzer
{
    /**
     * @return array{warnings:list<array{severity:string,label:string,evidence:string}>,patterns:list<string>}
     */
    public function analyze(string $message): array
    {
        $normalized = Str::lower(Str::squish($message));
        $warnings = [];
        $patterns = [];

        $map = [
            'critical' => [
                'Threatening language' => ['kill', 'hurt', 'threat', 'violent', 'violence'],
                'Child safety concern' => ['unsafe', 'danger', 'dangerous', 'neglect', 'abuse'],
            ],
            'high' => [
                'Escalation risk' => ['fight', 'scream', 'angry', 'hate', 'never', 'always'],
                'Blame-heavy framing' => ['your fault', 'you ruined', 'you caused'],
                'Controlling language' => ['you must', 'you have to', 'i decide', 'my rules'],
                'Profanity or insulting tone' => ['stupid', 'idiot', 'damn', 'hell'],
            ],
            'medium' => [
                'Stonewalling or shutdown' => ['ignore', 'whatever', 'leave me alone', 'do not talk'],
                'Urgency pressure' => ['right now', 'immediately', 'asap'],
                'Child-centered pressure' => ['in front of the child', 'in front of our child', 'the child heard'],
                'Scheduling friction' => ['late again', 'pickup', 'dropoff', 'exchange time'],
            ],
        ];

        foreach ($map as $severity => $groups) {
            foreach ($groups as $label => $keywords) {
                foreach ($keywords as $keyword) {
                    if (! Str::contains($normalized, $keyword)) {
                        continue;
                    }

                    $warnings[] = [
                        'severity' => $severity,
                        'label' => $label,
                        'evidence' => $keyword,
                    ];
                    $patterns[] = $label;
                    break;
                }
            }
        }

        return [
            'warnings' => $warnings,
            'patterns' => array_values(array_unique($patterns)),
        ];
    }

    /**
     * @param Collection<int, MediationMessage> $messages
     * @return array{
     *     critical_high_count:int,
     *     total_count:int,
     *     warnings:list<array{severity:string,label:string,evidence:string,message_id:int,created_at:?string}>
     * }
     */
    public function summarizeWarnings(Collection $messages): array
    {
        $warnings = [];

        foreach ($messages as $message) {
            $items = data_get($message->metadata, 'analysis.warnings', []);

            if (! is_array($items)) {
                continue;
            }

            foreach ($items as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $warnings[] = [
                    'severity' => (string) ($item['severity'] ?? 'medium'),
                    'label' => (string) ($item['label'] ?? 'Communication warning'),
                    'evidence' => (string) ($item['evidence'] ?? ''),
                    'message_id' => $message->id,
                    'created_at' => $message->created_at?->toIso8601String(),
                ];
            }
        }

        $criticalHighCount = collect($warnings)
            ->whereIn('severity', ['critical', 'high'])
            ->count();

        return [
            'critical_high_count' => $criticalHighCount,
            'total_count' => count($warnings),
            'warnings' => $warnings,
        ];
    }
}
