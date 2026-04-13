<?php

declare(strict_types=1);

namespace App\Support\Blog;

use Illuminate\Support\Collection;
use InvalidArgumentException;

final class BlogCatalog
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        return [
            [
                'slug' => 'alternating-weeks-custody-schedule',
                'title' => 'Alternating Weeks Custody Schedule: The Complete 50/50 Guide',
                'excerpt' => 'Learn how the alternating weeks custody schedule works, who it fits best, and practical tips to make week-on/week-off co-parenting sustainable.',
                'category' => 'Custody Schedules',
                'author' => 'KidSchedule Team',
                'published_at' => '2026-01-30',
                'hero_tone' => 'teal',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'body' => 'Alternating weeks is one of the most common 50/50 custody arrangements because it is easy to understand, easy to explain, and relatively simple to maintain once the routine is in place.',
                    ],
                    [
                        'type' => 'paragraph',
                        'body' => 'In a standard alternating weeks schedule, one parent has the children for a full week, and the other parent has the following week. Exchanges often happen on Friday, Sunday, or Monday depending on school, travel, and work needs.',
                    ],
                    [
                        'type' => 'heading',
                        'body' => 'When alternating weeks usually works best',
                    ],
                    [
                        'type' => 'list',
                        'items' => [
                            'Parents live close enough to school and activities',
                            'Children are old enough to handle longer stretches in each home',
                            'Transitions are calmer when they happen less often',
                            'Both households can maintain strong routines',
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'the-5-2-2-5-custody-schedule-guide',
                'title' => 'The 5-2-2-5 Custody Schedule: A Complete Guide for Co-Parents',
                'excerpt' => 'The 5-2-2-5 schedule offers a structured 50/50 routine with predictable weekdays. Here is how it works and when it may fit your family.',
                'category' => 'Custody Schedules',
                'author' => 'KidSchedule Team',
                'published_at' => '2026-01-30',
                'hero_tone' => 'blue',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'body' => 'The 5-2-2-5 custody schedule is built around consistent weekdays. One parent always has the same two weekdays, the other parent has the opposite two weekdays, and weekends alternate.',
                    ],
                    [
                        'type' => 'paragraph',
                        'body' => 'This structure creates predictable routines for school nights while still preserving a 50/50 split over time.',
                    ],
                    [
                        'type' => 'heading',
                        'body' => 'Why families choose 5-2-2-5',
                    ],
                    [
                        'type' => 'list',
                        'items' => [
                            'Children know where they will be on weekday routines',
                            'Parents can align recurring work and school logistics',
                            'It balances consistency with meaningful weekend time',
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'every-other-weekend-midweek-custody-schedule',
                'title' => 'The 70/30 Custody Schedule: Every Other Weekend Plus Midweek Visits Explained',
                'excerpt' => 'A 70/30 schedule often combines alternating weekends with one midweek visit or overnight. Here is when it makes sense and how to manage it well.',
                'category' => 'Co-Parenting Tips',
                'author' => 'KidSchedule Team',
                'published_at' => '2026-01-30',
                'hero_tone' => 'stone',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'body' => 'When people think about custody schedules, the 50/50 split often dominates the conversation. But equal time is not always realistic or even best for every family. That is where the 70/30 schedule comes in.',
                    ],
                    [
                        'type' => 'paragraph',
                        'body' => 'A common version of 70/30 gives one parent most weekdays while the other parent has every other weekend plus a regular midweek visit or overnight. This can preserve consistency while maintaining meaningful contact with both parents.',
                    ],
                    [
                        'type' => 'heading',
                        'body' => 'When 70/30 may make sense',
                    ],
                    [
                        'type' => 'list',
                        'items' => [
                            'One parent is the primary school-week household',
                            'Work schedules or travel would disrupt a 50/50 arrangement',
                            'Younger children need more stability',
                            'A gradual transition makes more sense for your situation',
                        ],
                    ],
                    [
                        'type' => 'heading',
                        'body' => 'Keys to making it work',
                    ],
                    [
                        'type' => 'list',
                        'items' => [
                            'Use one shared calendar for exchanges, school events, and activity times',
                            'Document changes in writing so both households see the same plan',
                            'Keep transportation responsibilities crystal clear',
                            'Review the schedule every few months as children grow',
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'co-parenting-communication-boundaries-that-lower-conflict',
                'title' => 'Co-Parenting Communication Boundaries That Lower Conflict',
                'excerpt' => 'Boundaries in communication can reduce escalation and make logistics much easier to manage when emotions are still running high.',
                'category' => 'Legal Guidance',
                'author' => 'KidSchedule Team',
                'published_at' => '2026-02-12',
                'hero_tone' => 'blue',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'body' => 'Clear communication boundaries reduce stress, lower escalation, and make child-focused decisions easier to document and follow through.',
                    ],
                    [
                        'type' => 'list',
                        'items' => [
                            'Keep messages logistics-focused',
                            'Avoid late-night arguments by defining quiet hours',
                            'Use written requests for schedule changes',
                            'Track expenses and reimbursements in one shared place',
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function categories(): array
    {
        return collect($this->all())
            ->pluck('category')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function latest(int $limit = 10): array
    {
        return collect($this->all())
            ->sortByDesc('published_at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function findBySlug(string $slug): array
    {
        $post = collect($this->all())->firstWhere('slug', $slug);

        if (! is_array($post)) {
            throw new InvalidArgumentException('Blog post not found.');
        }

        return $post;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function related(string $slug, int $limit = 3): array
    {
        $post = $this->findBySlug($slug);

        return collect($this->all())
            ->reject(fn (array $candidate): bool => $candidate['slug'] === $slug)
            ->filter(fn (array $candidate): bool => $candidate['category'] === $post['category'])
            ->take($limit)
            ->values()
            ->all();
    }

    public function previous(string $slug): ?array
    {
        return $this->neighbors($slug)->get('previous');
    }

    public function next(string $slug): ?array
    {
        return $this->neighbors($slug)->get('next');
    }

    /**
     * @return Collection<string, array<string, mixed>|null>
     */
    private function neighbors(string $slug): Collection
    {
        $posts = array_values($this->latest(100));
        $index = collect($posts)->search(fn (array $post): bool => $post['slug'] === $slug);

        if (! is_int($index)) {
            return collect(['previous' => null, 'next' => null]);
        }

        return collect([
            'previous' => $posts[$index - 1] ?? null,
            'next' => $posts[$index + 1] ?? null,
        ]);
    }
}
