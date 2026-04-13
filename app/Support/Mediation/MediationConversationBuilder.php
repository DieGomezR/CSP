<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\Enums\MediationMessageRole;
use App\Models\MediationMessage;
use App\Models\MediationSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

final class MediationConversationBuilder
{
    /**
     * @param Collection<int, MediationMessage> $messages
     * @return array<int, array{role:string, content:string}>
     */
    public function buildMessages(MediationSession $session, Collection $messages, bool $alternateReply = false): array
    {
        $payload = [];

        foreach ($messages->take(-12) as $message) {
            if ($message->role === MediationMessageRole::System) {
                continue;
            }

            $content = Str::limit(Str::squish($message->body), 1200);

            if ($content === '') {
                continue;
            }

            $payload[] = [
                'role' => $message->role === MediationMessageRole::Assistant ? 'assistant' : 'user',
                'content' => $content,
            ];
        }

        if ($alternateReply) {
            $payload[] = [
                'role' => 'user',
                'content' => 'Please provide a materially different mediation response than your last answer. Offer another calm, practical path forward and avoid repeating the same wording.',
            ];
        }

        if ($payload === []) {
            $payload[] = [
                'role' => 'user',
                'content' => 'Help the co-parents start a calm, constructive discussion about: '.$session->subject,
            ];
        }

        return $payload;
    }

    /**
     * @param array{warnings:list<array{severity:string,label:string,evidence:string,message_id?:int,created_at?:string|null}>} $warningsSummary
     */
    public function buildSystemPrompt(MediationSession $session, array $warningsSummary): string
    {
        $warningItems = [];

        foreach (array_slice($warningsSummary['warnings'], 0, 5) as $warning) {
            $warningItems[] = sprintf('%s (%s)', $warning['label'], $warning['severity']);
        }

        $warningSummary = implode(', ', $warningItems);

        return implode("\n", array_filter([
            'You are the KidSchedule AI Mediator for a co-parenting mediation center.',
            'Stay strictly focused on co-parenting conflict resolution, schedules, handoffs, routines, school, child wellbeing logistics, communication repair, expenses, and product-adjacent next steps inside KidSchedule.',
            'Do not answer unrelated general questions. Redirect the user back to the co-parenting issue.',
            'Do not provide legal advice, therapy, diagnosis, or emergency guidance beyond telling the user to seek a qualified attorney, therapist, mediator, or emergency services when appropriate.',
            'Be neutral, concise, non-judgmental, and practical.',
            'Prefer short structured suggestions, de-escalation language, and child-centered framing.',
            'If the conversation appears heated, explicitly recommend calm wording and one next step each parent can take.',
            'Session subject: '.$session->subject,
            $warningSummary !== '' ? 'Recent communication risks detected: '.$warningSummary : null,
            'Available product context: calendar planning, shared expenses, requests, secure messaging, and family coordination.',
        ]));
    }
}
