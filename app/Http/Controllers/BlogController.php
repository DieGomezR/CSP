<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Support\Blog\BlogCatalog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class BlogController extends Controller
{
    public function __construct(private readonly BlogCatalog $blogCatalog)
    {
    }

    public function index(): Response
    {
        $posts = collect($this->blogCatalog->latest())
            ->map(fn (array $post): array => [
                'slug' => $post['slug'],
                'title' => $post['title'],
                'excerpt' => $post['excerpt'],
                'category' => $post['category'],
                'author' => $post['author'],
                'published_at' => $post['published_at'],
                'reading_time' => $this->estimateReadingTime($post),
            ])
            ->values()
            ->all();

        return Inertia::render('blog/index', [
            'posts' => $posts,
            'categories' => $this->blogCatalog->categories(),
            'featured' => $posts[0] ?? null,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = $this->blogCatalog->findBySlug($slug);

        return Inertia::render('blog/show', [
            'post' => [
                ...$post,
                'reading_time' => $this->estimateReadingTime($post),
            ],
            'recentPosts' => collect($this->blogCatalog->latest(4))
                ->reject(fn (array $candidate): bool => $candidate['slug'] === $slug)
                ->take(3)
                ->values()
                ->all(),
            'relatedPosts' => $this->blogCatalog->related($slug),
            'previousPost' => $this->blogCatalog->previous($slug),
            'nextPost' => $this->blogCatalog->next($slug),
        ]);
    }

    /**
     * @param array<string, mixed> $post
     */
    private function estimateReadingTime(array $post): string
    {
        $words = collect($post['content'] ?? [])
            ->flatMap(function (array $section): array {
                if (($section['type'] ?? null) === 'list') {
                    return $section['items'] ?? [];
                }

                return [$section['body'] ?? ''];
            })
            ->implode(' ');

        $minutes = max(1, (int) ceil(str_word_count(Str::of($words)->replaceMatches('/[^\pL\pN\s]/u', ' ')->value()) / 220));

        return $minutes.' min read';
    }
}
