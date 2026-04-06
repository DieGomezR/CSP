import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Check, GraduationCap, Shield, Users } from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '#blog' },
    { label: 'For PTAs', href: '#pta' },
];

const heroBullets = ['45,000+ school calendars', 'Syncs to any calendar app', 'Share with caregivers'];

const familySegments = [
    {
        icon: '👨‍👩‍👧',
        title: 'Busy Families',
        body: 'School, sports, activities, carpools. Everyone sees the same calendar and caregivers can stay in sync too.',
        accent: 'text-teal-800',
        background: 'bg-[#dffaf0]',
        link: 'Learn more →',
    },
    {
        icon: '⚖️',
        title: 'Co-Parents',
        body: 'Custody schedules, documented messaging, expense tracking, and court-ready exports when they are needed.',
        accent: 'text-[#3556d4]',
        background: 'bg-[#dfebff]',
        link: 'Learn more →',
    },
    {
        icon: '⚽',
        title: 'Teams & Clubs',
        body: 'One calendar for the whole team. Parents subscribe once and practices, games, and changes stay synced.',
        accent: 'text-[#d96b1c]',
        background: 'bg-[#fff1dc]',
        link: 'Learn more →',
    },
    {
        icon: '🏫',
        title: 'PTAs & Schools',
        body: 'Member directory, event management, volunteer signups, and announcements without the spreadsheet chaos.',
        accent: 'text-[#7a49d9]',
        background: 'bg-[#efe2ff]',
        link: 'Learn more →',
    },
];

const featureCards = [
    {
        icon: '🏫',
        title: 'School Calendar Sync',
        body: "45,000+ school districts. Import your school's calendar with one click - holidays, early dismissals, and conferences.",
    },
    {
        icon: '📷',
        title: 'AI Calendar Import',
        body: 'Snap a photo of any schedule and pull dates out automatically for sports, activities, and school flyers.',
    },
    {
        icon: '🗓️',
        title: 'Syncs Everywhere',
        body: 'Subscribe in Google Calendar, Apple, or Outlook. Changes sync automatically with one source of truth.',
    },
    {
        icon: '👶',
        title: 'Child-by-Child View',
        body: "Each kid gets their own color and schedule so your calendar stays readable instead of collapsing into noise.",
    },
    {
        icon: '🧑‍🍼',
        title: 'Share with Caregivers',
        body: 'Grandparents, nannies, and babysitters can get view-only access and you can revoke it any time.',
    },
    {
        icon: '🔔',
        title: 'Smart Reminders',
        body: "Morning digest of the day ahead and change alerts without getting pinged at midnight.",
    },
];

const blogPosts = [
    {
        date: 'January 30, 2026',
        title: 'Alternating Weeks Custody Schedule: The Complete 50/50 Guide',
        excerpt: 'Learn how alternating weeks works, who it fits best, and practical tips to make it sustainable.',
    },
    {
        date: 'January 30, 2026',
        title: 'The 5-2-2-5 Custody Schedule: A Complete Guide for Co-Parents',
        excerpt: 'A clean overview of the 5-2-2-5 model, its tradeoffs, and when it may fit your family.',
    },
];

const plans = {
    parent: [
        {
            name: 'Essential',
            subtitle: 'For everyday families',
            price: '$5.99',
            features: [
                'Shared family calendar',
                'School calendar sync',
                'Webcal feeds for any app',
                'Email reminders',
                'Caregiver guest access',
            ],
        },
        {
            name: 'Plus',
            subtitle: 'For active families',
            price: '$8.99',
            featured: true,
            badge: 'Most Popular',
            features: [
                'Everything in Essential',
                'AI calendar import (photo)',
                'Activity & sports tracking',
                'SMS reminders',
                'Expense tracking',
                'Secure family messaging',
            ],
        },
        {
            name: 'Complete',
            subtitle: 'For complex situations',
            price: '$11.99',
            features: [
                'Everything in Plus',
                'Custody schedule templates',
                'Court-ready exports',
                'AI tone analysis',
                'Change request workflow',
                'Tamper-proof audit trail',
            ],
        },
    ],
    family: [
        {
            name: 'Essential',
            subtitle: 'For everyday families',
            price: '$11.99',
            features: [
                'Shared family calendar',
                'School calendar sync',
                'Webcal feeds for any app',
                'Email reminders',
                'Caregiver guest access',
            ],
        },
        {
            name: 'Plus',
            subtitle: 'For active families',
            price: '$17.99',
            featured: true,
            badge: 'Most Popular',
            features: [
                'Everything in Essential',
                'AI calendar import (photo)',
                'Activity & sports tracking',
                'SMS reminders',
                'Expense tracking',
                'Secure family messaging',
            ],
        },
        {
            name: 'Complete',
            subtitle: 'For complex situations',
            price: '$23.99',
            features: [
                'Everything in Plus',
                'Custody schedule templates',
                'Court-ready exports',
                'AI tone analysis',
                'Change request workflow',
                'Tamper-proof audit trail',
            ],
        },
    ],
} as const;

const footerColumns = [
    {
        title: 'Product',
        links: ['Features', 'Pricing', 'Compare', 'Start Free Trial'],
    },
    {
        title: 'Legal',
        links: ['Terms of Service', 'Privacy Policy'],
    },
    {
        title: 'Support',
        links: ['FAQ', 'Email Us', 'Contact'],
    },
];

function NavBar({ authUser }: { authUser: SharedData['auth']['user'] | undefined }) {
    return (
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-7">
                <a href="#top" className="text-[2rem] font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text">
                    KidSchedule
                </a>

                <nav className="hidden items-center gap-10 text-sm font-extrabold text-slate-600 md:flex">
                    {navigationItems.map((item) => (
                        <a key={item.label} href={item.href} className="transition hover:text-slate-950">
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {authUser ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                        >
                            Open App
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                        >
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

function InstallPrompt({ ctaHref }: { ctaHref: string }) {
    return (
        <div className="fixed right-6 bottom-6 left-6 z-30 hidden justify-center lg:flex">
            <div className="flex w-full max-w-[430px] items-center gap-4 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.45)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-black text-white">KS</div>
                <div className="min-w-0 flex-1">
                    <p className="text-base font-black text-slate-800">Install KidSchedule</p>
                    <p className="text-sm text-slate-500">Add to home screen for quick access, even offline.</p>
                </div>
                <button type="button" className="text-sm font-bold text-slate-400 transition hover:text-slate-700">
                    Not now
                </button>
                <a
                    href={ctaHref}
                    className="rounded-xl bg-[#67d2c3] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#55c8b7]"
                >
                    Install
                </a>
            </div>
        </div>
    );
}

function FloatingCta({ href }: { href: string }) {
    return (
        <a
            href={href}
            className="fixed right-6 bottom-6 z-30 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(90deg,#63d3c4_0%,#5bcbb8_100%)] px-6 py-4 text-sm font-black text-white shadow-[0_20px_45px_-20px_rgba(77,191,174,0.8)] transition hover:translate-y-[-1px]"
        >
            <CalendarDays className="size-4" />
            Start Free Trial
        </a>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [billingMode, setBillingMode] = useState<'parent' | 'family'>('parent');
    const plansToRender = plans[billingMode];
    const primaryHref = auth.user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="KidSchedule" />

            <div id="top" className="min-h-screen bg-white text-slate-900">
                <NavBar authUser={auth.user} />

                <main>
                    <section className="bg-[linear-gradient(135deg,#eefbf6_0%,#edf8f4_50%,#edf5ff_100%)]">
                        <div className="mx-auto max-w-6xl px-6 pt-18 pb-22 text-center">
                            <h1 className="mx-auto max-w-4xl text-5xl leading-[1.08] font-black tracking-tight text-slate-900 md:text-7xl">
                                The family calendar that actually works.
                            </h1>
                            <p className="mx-auto mt-7 max-w-3xl text-xl leading-9 text-slate-600">
                                School schedules, activities, and everyone&apos;s stuff - finally in one place. Syncs everywhere. Works for any
                                family.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href={primaryHref}
                                    className="rounded-full bg-[linear-gradient(90deg,#67d2c3_0%,#58c9b7_100%)] px-7 py-4 text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.8)] transition hover:translate-y-[-1px]"
                                >
                                    Start Free for 60 Days
                                </a>
                                <a
                                    href="#features"
                                    className="rounded-full border border-white/80 bg-white/70 px-7 py-4 text-base font-black text-slate-700 shadow-sm transition hover:text-slate-950"
                                >
                                    See How It Works
                                </a>
                            </div>

                            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-slate-500">
                                {heroBullets.map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <Check className="size-4 text-[#59c8b7]" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6 py-18">
                        <div className="text-center">
                            <h2 className="text-4xl font-black tracking-tight text-slate-900">Built for how families really work</h2>
                            <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-500">
                                Whether you&apos;re coordinating with a spouse, a co-parent, a coach, or grandma.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 md:grid-cols-2">
                            {familySegments.map((item) => (
                                <article
                                    key={item.title}
                                    className={`rounded-[1.8rem] p-8 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.45)] ${item.background}`}
                                >
                                    <div className="text-3xl">{item.icon}</div>
                                    <h3 className={`mt-7 text-3xl font-black tracking-tight ${item.accent}`}>{item.title}</h3>
                                    <p className={`mt-4 max-w-md text-lg leading-8 ${item.accent} opacity-85`}>{item.body}</p>
                                    <p className={`mt-7 text-base font-black ${item.accent}`}>{item.link}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="features" className="bg-slate-50/75 py-18">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="text-center">
                                <h2 className="text-4xl font-black tracking-tight text-slate-900">Features that save you time</h2>
                                <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-500">
                                    No more juggling apps, spreadsheets, and group texts.
                                </p>
                            </div>

                            <div className="mt-12 grid gap-5 lg:grid-cols-3">
                                {featureCards.map((feature) => (
                                    <article className="rounded-[1.7rem] border border-slate-100 bg-white p-7 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]" key={feature.title}>
                                        <div className="text-3xl">{feature.icon}</div>
                                        <h3 className="mt-6 text-2xl font-black tracking-tight text-slate-900">{feature.title}</h3>
                                        <p className="mt-4 text-lg leading-8 text-slate-500">{feature.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6 py-18">
                        <div className="mx-auto max-w-3xl rounded-[1.8rem] border-l-4 border-[#67d2c3] bg-slate-50 px-10 py-10 text-center shadow-[0_20px_55px_-45px_rgba(15,23,42,0.4)]">
                            <p className="text-[2rem] leading-[1.6] italic text-slate-600">
                                &quot;Finally, one app that handles our crazy schedule. Three kids, two sports each, plus school stuff and I can
                                actually see it all without losing my mind.&quot;
                            </p>
                            <p className="mt-6 text-xl font-black text-[#67d2c3]">Michelle R., mom of 3</p>
                        </div>
                    </section>

                    <section id="pricing" className="bg-slate-50/80 py-18">
                        <div className="mx-auto max-w-6xl px-6 text-center">
                            <h2 className="text-4xl font-black tracking-tight text-slate-900">Simple, affordable plans</h2>
                            <p className="mt-4 text-xl text-slate-500">Start free for 60 days. Cancel anytime.</p>

                            <div className="mt-8 inline-flex rounded-2xl bg-slate-100 p-1.5">
                                <button
                                    type="button"
                                    onClick={() => setBillingMode('parent')}
                                    className={`rounded-xl px-6 py-3 text-sm font-black transition ${
                                        billingMode === 'parent' ? 'bg-[#67d2c3] text-white shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Per Parent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingMode('family')}
                                    className={`rounded-xl px-6 py-3 text-sm font-black transition ${
                                        billingMode === 'family' ? 'bg-[#67d2c3] text-white shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Full Family
                                </button>
                            </div>

                            <div className="mt-12 grid gap-6 xl:grid-cols-3">
                                {plansToRender.map((plan) => (
                                    <article
                                        key={`${billingMode}-${plan.name}`}
                                        className={`relative rounded-[1.8rem] border p-8 text-left shadow-[0_28px_65px_-52px_rgba(15,23,42,0.45)] ${
                                            plan.featured ? 'border-transparent bg-[#63cfc0] text-white' : 'border-slate-200 bg-white text-slate-900'
                                        }`}
                                    >
                                        {plan.badge && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb21a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                                                {plan.badge}
                                            </div>
                                        )}

                                        <h3 className="mt-2 text-4xl font-black tracking-tight">{plan.name}</h3>
                                        <p className={`mt-2 text-lg ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>{plan.subtitle}</p>
                                        <div className="mt-8 flex items-end gap-2">
                                            <span className="text-6xl font-black tracking-tight">{plan.price}</span>
                                            <span className={`pb-2 text-xl ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>/month</span>
                                        </div>

                                        <ul className="mt-8 space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3 text-lg leading-8">
                                                    <Check className={`mt-1 size-5 shrink-0 ${plan.featured ? 'text-white' : 'text-slate-400'}`} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {plan.featured && (
                                            <a
                                                href={primaryHref}
                                                className="mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-4 text-base font-black text-[#55bfae] transition hover:bg-slate-50"
                                            >
                                                Start Free Trial
                                            </a>
                                        )}
                                    </article>
                                ))}
                            </div>

                            <p className="mt-8 text-base text-slate-500">
                                Per parent pricing shown. Toggle to Full Family to include both parents. Cancel anytime.
                            </p>
                        </div>
                    </section>

                    <section id="blog" className="mx-auto max-w-6xl px-6 py-18">
                        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            <div className="space-y-5">
                                {blogPosts.map((post) => (
                                    <article
                                        key={post.title}
                                        className="rounded-[1.8rem] border border-slate-100 bg-white p-7 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]"
                                    >
                                        <p className="text-sm font-bold text-slate-400">{post.date} • KidSchedule Team</p>
                                        <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{post.title}</h3>
                                        <p className="mt-4 text-lg leading-8 text-slate-500">{post.excerpt}</p>
                                        <p className="mt-5 text-base font-black text-slate-800">Read More →</p>
                                    </article>
                                ))}
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#63cfc0_0%,#5bc7b8_100%)] px-8 py-9 text-center text-white shadow-[0_28px_65px_-52px_rgba(77,191,174,0.65)]">
                                    <h3 className="text-3xl font-black tracking-tight">Ready to Simplify Co-Parenting?</h3>
                                    <p className="mt-4 text-lg leading-8 text-white/90">
                                        Try KidSchedule free and see how much easier shared custody can feel.
                                    </p>
                                    <a
                                        href={primaryHref}
                                        className="mt-7 inline-flex rounded-2xl bg-white px-6 py-4 text-base font-black text-[#53bdaa] transition hover:bg-slate-50"
                                    >
                                        Start Free Trial
                                    </a>
                                </div>

                                <div className="rounded-[1.8rem] border border-slate-100 bg-white p-7 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)]">
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Categories</h3>
                                    <ul className="mt-5 space-y-4 text-lg text-slate-500">
                                        <li>App Updates</li>
                                        <li>Child Wellbeing</li>
                                        <li>Co-Parenting Tips</li>
                                        <li>Custody Schedules</li>
                                        <li>Legal Guidance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="pta" className="bg-[#1d273a] pt-20 text-white">
                        <div className="border-b border-white/5 pb-18">
                            <div className="mx-auto max-w-5xl px-6 text-center">
                                <h2 className="text-5xl font-black tracking-tight">Ready to get organized?</h2>
                                <p className="mx-auto mt-6 max-w-3xl text-2xl leading-10 text-slate-300">
                                    Join thousands of families who finally have one place for everything.
                                </p>
                                <p className="mt-12 text-3xl font-black">Start Your Free 60-Day Trial</p>
                                <p className="mt-5 text-lg text-slate-400">Setup takes 2 minutes. Cancel anytime.</p>
                            </div>
                        </div>

                        <footer className="mx-auto max-w-6xl px-6 py-16">
                            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
                                <div>
                                    <p className="text-[2.4rem] font-black tracking-tight">KidSchedule</p>
                                    <p className="mt-6 text-lg leading-8 text-slate-400">Built for co-parents, by co-parents.</p>
                                    <div className="mt-8 flex items-center gap-4 text-slate-400">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8">
                                            <Shield className="size-5" />
                                        </span>
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8">
                                            <Users className="size-5" />
                                        </span>
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/8">
                                            <GraduationCap className="size-5" />
                                        </span>
                                    </div>
                                </div>

                                {footerColumns.map((column) => (
                                    <div key={column.title}>
                                        <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{column.title}</p>
                                        <ul className="mt-6 space-y-4">
                                            {column.links.map((link) => (
                                                <li key={link} className="text-lg text-slate-400">
                                                    {link}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-14 border-t border-white/8 pt-10 text-sm text-slate-500">
                                © 2026 KidSchedule. Terms · Privacy
                            </div>
                        </footer>
                    </section>
                </main>

                <InstallPrompt ctaHref={primaryHref} />
                <FloatingCta href={primaryHref} />
            </div>
        </>
    );
}
