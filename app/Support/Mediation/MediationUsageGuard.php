<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use App\Models\MediationSession;
use App\Models\WorkspaceMember;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

final class MediationUsageGuard
{
    public function ensureCanSend(MediationSession $session, WorkspaceMember $member, bool $alternateReply = false): void
    {
        $rateKey = $this->hourlyRateKey($session, $member, $alternateReply);
        $limit = (int) config($alternateReply ? 'mediation.ai.help_requests_per_hour' : 'mediation.ai.messages_per_hour', 20);

        if (RateLimiter::tooManyAttempts($rateKey, $limit)) {
            throw ValidationException::withMessages([
                'message' => 'The AI mediation limit has been reached for now. Please wait before sending another request.',
            ]);
        }

        RateLimiter::hit($rateKey, 3600);

        $dailyTokenKey = $this->dailyTokenKey($session);
        $dailyTokenLimit = (int) config('mediation.ai.daily_token_limit', 40000);
        $usedTokens = (int) Cache::get($dailyTokenKey, 0);

        if ($usedTokens >= $dailyTokenLimit) {
            throw ValidationException::withMessages([
                'message' => 'Daily AI mediation quota reached for this workspace. Please try again tomorrow or review the existing session history.',
            ]);
        }
    }

    public function recordUsage(MediationSession $session, int $usedTokens): void
    {
        $dailyTokenKey = $this->dailyTokenKey($session);
        Cache::add($dailyTokenKey, 0, now()->endOfDay());
        Cache::increment($dailyTokenKey, max(0, $usedTokens));
    }

    private function hourlyRateKey(MediationSession $session, WorkspaceMember $member, bool $alternateReply): string
    {
        return sprintf(
            'mediation:%s:%d:%d:%s',
            $alternateReply ? 'help' : 'message',
            $session->workspace_id,
            $member->id,
            now()->format('YmdH')
        );
    }

    private function dailyTokenKey(MediationSession $session): string
    {
        return sprintf('mediation:tokens:%d:%s', $session->workspace_id, now()->format('Ymd'));
    }
}
