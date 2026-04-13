import { type BlogPost } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Calendar, Facebook, Link2, Mail, Twitter } from 'lucide-react';

interface BlogShowProps {
    post: BlogPost & {
        content: Array<{
            type: 'paragraph' | 'heading' | 'list';
            body?: string;
            items?: string[];
        }>;
    };
    recentPosts: BlogPost[];
    relatedPosts: BlogPost[];
    previousPost: BlogPost | null;
    nextPost: BlogPost | null;
}

export default function BlogShow({ post, recentPosts, relatedPosts, previousPost, nextPost }: BlogShowProps) {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = post.title;

    const handleShare = (platform: string) => {
        const urls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Check out this article: ${shareUrl}`)}`,
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };

    return (
        <>
            <Head title={`${post.title} - KidSchedule`} />

            <div className="min-h-screen bg-[#faf9f6]">
                {/* Navigation Bar */}
                <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-6 lg:py-6">
                        <Link
                            href="/"
                            className="text-xl font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text sm:text-2xl lg:text-[2rem]"
                        >
                            KidSchedule
                        </Link>

                        <nav className="hidden items-center gap-6 text-sm font-extrabold text-slate-600 lg:flex lg:gap-10">
                            <Link href="/#features" className="transition hover:text-slate-950">
                                Features
                            </Link>
                            <Link href="/#pricing" className="transition hover:text-slate-950">
                                Pricing
                            </Link>
                            <Link href={route('blog.index')} className="transition hover:text-slate-950">
                                Blog
                            </Link>
                            <Link
                                href={route('login')}
                                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 sm:px-5 sm:py-3"
                            >
                                Log In
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="border-b border-slate-100 bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
                        <nav className="flex min-w-0 items-center gap-2 overflow-x-auto text-sm text-slate-500">
                            <Link href="/" className="flex-shrink-0 transition hover:text-[#5ab9ae]">
                                Home
                            </Link>
                            <span className="flex-shrink-0">→</span>
                            <Link href={route('blog.index')} className="flex-shrink-0 transition hover:text-[#5ab9ae]">
                                Blog
                            </Link>
                            <span className="flex-shrink-0">→</span>
                            <span className="min-w-0 truncate text-slate-700">{post.title}</span>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-6 lg:py-12">
                    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        {/* Article Content */}
                        <article className="rounded-[1.4rem] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] sm:p-8 lg:p-10">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <Calendar className="size-4" />
                                <span>
                                    Published{' '}
                                    {new Date(post.published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span>•</span>
                                <span>{post.author}</span>
                            </div>

                            <hr className="my-6 border-slate-200" />

                            {/* Content Body */}
                            <div className="space-y-6 text-base leading-relaxed text-slate-700 sm:text-lg">
                                {post.content.map((section, index) => {
                                    if (section.type === 'paragraph') {
                                        return (
                                            <p key={index} className="text-base leading-relaxed sm:text-lg">
                                                {section.body}
                                            </p>
                                        );
                                    }

                                    if (section.type === 'heading') {
                                        return (
                                            <h2 key={index} className="mt-8 text-xl font-black tracking-tight text-slate-900 sm:mt-10 sm:text-2xl">
                                                {section.body}
                                            </h2>
                                        );
                                    }

                                    if (section.type === 'list' && section.items) {
                                        return (
                                            <ul key={index} className="ml-6 space-y-3">
                                                {section.items.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-start gap-2">
                                                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5ab9ae]"></span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }

                                    return null;
                                })}
                            </div>

                            {/* Share Section */}
                            <div className="mt-10 border-t border-slate-200 pt-6 sm:mt-12 sm:pt-8">
                                <h3 className="text-sm font-bold text-slate-700 sm:text-base">Share this article:</h3>
                                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#1877f2] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#166fe5] sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        <Facebook className="size-3.5 sm:size-4" />
                                        <span className="sm:hidden">Share</span>
                                        <span className="hidden sm:inline">Facebook</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#1da1f2] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1a8cd8] sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        <Twitter className="size-3.5 sm:size-4" />
                                        <span className="sm:hidden">Share</span>
                                        <span className="hidden sm:inline">Twitter</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#004182] sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        <Link2 className="size-3.5 sm:size-4" />
                                        <span className="sm:hidden">Share</span>
                                        <span className="hidden sm:inline">LinkedIn</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare('email')}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-slate-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 sm:px-4 sm:py-2.5 sm:text-sm"
                                    >
                                        <Mail className="size-3.5 sm:size-4" />
                                        <span className="sm:hidden">Share</span>
                                        <span className="hidden sm:inline">Email</span>
                                    </button>
                                </div>
                            </div>

                            {/* Previous/Next Navigation */}
                            {(previousPost || nextPost) && (
                                <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row">
                                    {previousPost && (
                                        <Link
                                            href={route('blog.show', previousPost.slug)}
                                            className="flex items-center gap-2 text-base font-bold text-slate-600 transition hover:text-[#5ab9ae]"
                                        >
                                            <ArrowLeft className="size-5" />
                                            <span className="line-clamp-1">{previousPost.title}</span>
                                        </Link>
                                    )}
                                    {nextPost && (
                                        <Link
                                            href={route('blog.show', nextPost.slug)}
                                            className="ml-auto flex items-center gap-2 text-base font-bold text-slate-600 transition hover:text-[#5ab9ae]"
                                        >
                                            <span className="line-clamp-1">{nextPost.title}</span>
                                            <ArrowRight className="size-5" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </article>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* CTA Card */}
                            <div className="rounded-[1.4rem] bg-gradient-to-br from-[#5ab9ae] to-[#4fa89d] px-6 py-7 text-center text-white shadow-[0_8px_30px_-12px_rgba(90,185,174,0.5)] sm:px-8 sm:py-9">
                                <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                                    Try KidSchedule Free
                                </h3>
                                <p className="mt-3 text-base leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
                                    Simplify your custody schedule and co-parenting communication.
                                </p>
                                <Link
                                    href={route('register')}
                                    className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl px-5 py-3 text-sm font-black text-[#5ab9ae] transition hover:bg-slate-50 sm:mt-6 sm:px-6 sm:py-4 sm:text-base"
                                >
                                    Get Started
                                </Link>
                            </div>

                            {/* Recent Posts */}
                            {recentPosts.length > 0 && (
                                <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] sm:p-7">
                                    <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                                        Recent Posts
                                    </h3>
                                    <ul className="mt-5 space-y-4">
                                        {recentPosts.map((recentPost) => (
                                            <li key={recentPost.slug}>
                                                <Link
                                                    href={route('blog.show', recentPost.slug)}
                                                    className="block transition hover:text-[#5ab9ae]"
                                                >
                                                    <p className="text-base font-bold text-slate-800">
                                                        {recentPost.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {new Date(recentPost.published_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] sm:p-7">
                                    <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                                        Related Articles
                                    </h3>
                                    <ul className="mt-5 space-y-4">
                                        {relatedPosts.map((relatedPost) => (
                                            <li key={relatedPost.slug}>
                                                <Link
                                                    href={route('blog.show', relatedPost.slug)}
                                                    className="block transition hover:text-[#5ab9ae]"
                                                >
                                                    <p className="text-base font-bold text-slate-800">
                                                        {relatedPost.title}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {relatedPost.category}
                                                    </p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-[#1d273a] pt-12 text-white sm:pt-16 lg:pt-20">
                    <div className="border-b border-white/5 pb-12 sm:pb-16">
                        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-6">
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Ready to get organized?</h2>
                            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-slate-300 sm:mt-6 sm:text-2xl">
                                Join thousands of families who finally have one place for everything.
                            </p>
                            <p className="mt-8 text-xl font-black sm:mt-12 sm:text-2xl lg:text-3xl">Start Your Free 60-Day Trial</p>
                            <p className="mt-3 text-base text-slate-400 sm:mt-5 sm:text-lg">Setup takes 2 minutes. Cancel anytime.</p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-6 lg:py-16">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
                            <div>
                                <p className="text-2xl font-black tracking-tight sm:text-3xl lg:text-[2.4rem]">KidSchedule</p>
                                <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                                    Built for co-parents, by co-parents.
                                </p>
                                <p className="mt-6 text-sm text-slate-500 sm:mt-8 sm:text-base">
                                    © {new Date().getFullYear()} KidSchedule. All rights reserved.
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.16em] text-white">Product</p>
                                <ul className="mt-6 space-y-4 text-base text-slate-400">
                                    <li>
                                        <Link href="/#features" className="transition hover:text-white">
                                            Features
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/#pricing" className="transition hover:text-white">
                                            Pricing
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            Compare
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('register')} className="transition hover:text-white">
                                            Start Free Trial
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.16em] text-white">Legal</p>
                                <ul className="mt-6 space-y-4 text-base text-slate-400">
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.16em] text-white">Support</p>
                                <ul className="mt-6 space-y-4 text-base text-slate-400">
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            FAQ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            Email Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className="transition hover:text-white">
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-16 border-t border-white/5 pt-10 text-center text-sm text-slate-500">
                            <p>Made with <span className="text-red-500">♥</span> for co-parents everywhere</p>
                            <p className="mt-2 text-xs">Build 0.5.217</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
