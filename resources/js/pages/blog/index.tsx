import { type BlogPost } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar } from 'lucide-react';

interface BlogIndexProps {
    posts: BlogPost[];
    categories: string[];
}

export default function BlogIndex({ posts, categories }: BlogIndexProps) {
    return (
        <>
            <Head title="Blog - KidSchedule" />

            <div className="min-h-screen bg-[#faf9f6]">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#5ab9ae] to-[#4fa89d]">
                    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">KidSchedule Blog</h1>
                        <p className="mt-3 text-lg text-white/90 sm:mt-4 sm:text-xl md:text-xl">
                            Tips, guides, and insights for co-parenting success
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
                    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                        {/* Blog Posts */}
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <article
                                    key={post.slug}
                                    className="rounded-[1.2rem] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] transition hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)] sm:rounded-[1.4rem] sm:p-8"
                                >
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 sm:text-sm">
                                        <Calendar className="size-3.5 sm:size-4" />
                                        <span>{new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{post.author}</span>
                                    </div>
                                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:mt-4 sm:text-3xl">
                                        {post.title}
                                    </h2>
                                    <p className="mt-3 text-base leading-relaxed text-slate-600 sm:mt-4 sm:text-lg">
                                        {post.excerpt}
                                    </p>
                                    <Link
                                        href={route('blog.show', post.slug)}
                                        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#5ab9ae] transition hover:gap-3 sm:mt-6 sm:text-base"
                                    >
                                        Read More
                                        <ArrowRight className="size-4 sm:size-5" />
                                    </Link>
                                </article>
                            ))}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* CTA Card */}
                            <div className="rounded-[1.2rem] bg-gradient-to-br from-[#5ab9ae] to-[#4fa89d] px-6 py-7 text-center text-white shadow-[0_8px_30px_-12px_rgba(90,185,174,0.5)] sm:rounded-[1.4rem] sm:px-8 sm:py-9">
                                <h3 className="text-xl font-black tracking-tight sm:text-2xl">
                                    Ready to Simplify Co-Parenting?
                                </h3>
                                <p className="mt-3 text-base leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
                                    Try KidSchedule free and see how easy shared custody can be.
                                </p>
                                <Link
                                    href={route('register')}
                                    className="mt-5 inline-flex rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#5ab9ae] transition hover:bg-slate-50 sm:mt-6 sm:px-6 sm:py-4 sm:text-base"
                                >
                                    Start Free Trial
                                </Link>
                            </div>

                            {/* Categories */}
                            <div className="rounded-[1.2rem] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] sm:rounded-[1.4rem] sm:p-7">
                                <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                                    Categories
                                </h3>
                                <ul className="mt-4 space-y-3 text-sm sm:mt-5 sm:space-y-3 sm:text-base">
                                    {categories.map((category) => (
                                        <li key={category}>
                                            <button
                                                type="button"
                                                className="transition hover:text-[#5ab9ae]"
                                            >
                                                {category}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
