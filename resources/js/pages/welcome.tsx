import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    Camera,
    Check,
    GraduationCap,
    Menu,
    School,
    Shield,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: route('blog.index') },
    { label: 'Teams', href: route('for-teams'), external: true },
    { label: 'Co-Parents', href: route('for-coparents'), external: true },
    { label: 'For PTAs', href: route('pta'), external: true },
];

const heroBullets = ['45,000+ school calendars', 'Syncs to any calendar app', 'Share with caregivers'];

const familySegments = [
    {
        icon: Users,
        title: 'Busy Families',
        body: 'School, sports, activities, carpools. Everyone sees the same calendar and caregivers can stay in sync too.',
        accent: 'text-teal-800',
        background: 'bg-[#dffaf0]',
    },
    {
        icon: Shield,
        title: 'Co-Parents',
        body: 'Custody schedules, documented messaging, expense tracking, and court-ready exports when they are needed.',
        accent: 'text-[#3556d4]',
        background: 'bg-[#dfebff]',
        href: route('for-coparents'),
    },
    {
        icon: CalendarDays,
        title: 'Teams & Clubs',
        body: 'One calendar for the whole team. Parents subscribe once and practices, games, and changes stay synced.',
        accent: 'text-[#d96b1c]',
        background: 'bg-[#fff1dc]',
        href: route('for-teams'),
    },
    {
        icon: GraduationCap,
        title: 'PTAs & Schools',
        body: 'Member directory, event management, volunteer signups, and announcements without the spreadsheet chaos.',
        accent: 'text-[#7a49d9]',
        background: 'bg-[#efe2ff]',
        href: route('pta'),
    },
];

const featureCards = [
    {
        icon: School,
        title: 'School Calendar Sync',
        body: "45,000+ school districts. Import your school's calendar with one click - holidays, early dismissals, and conferences.",
    },
    {
        icon: Camera,
        title: 'AI Calendar Import',
        body: 'Snap a photo of any schedule and pull dates out automatically for sports, activities, and school flyers.',
    },
    {
        icon: CalendarDays,
        title: 'Syncs Everywhere',
        body: 'Subscribe in Google Calendar, Apple, or Outlook. Changes sync automatically with one source of truth.',
    },
    {
        icon: Users,
        title: 'Child-by-Child View',
        body: "Each kid gets their own color and schedule so your calendar stays readable instead of collapsing into noise.",
    },
    {
        icon: Shield,
        title: 'Share with Caregivers',
        body: 'Grandparents, nannies, and babysitters can get view-only access and you can revoke it any time.',
    },
    {
        icon: Bell,
        title: 'Smart Reminders',
        body: 'Morning digest of the day ahead and change alerts without getting pinged at midnight.',
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
                'Activity and sports tracking',
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
                'Activity and sports tracking',
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 md:py-7">
                <a href="#top" className="text-xl font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text sm:text-[2rem]">
                    KidSchedule
                </a>

                <nav className="hidden items-center gap-10 text-sm font-extrabold text-slate-600 md:flex">
                    {navigationItems.map((item) =>
                        'external' in item && item.external ? (
                            <Link key={item.label} href={item.href} className="transition hover:text-slate-950">
                                {item.label}
                            </Link>
                        ) : (
                            <a key={item.label} href={item.href} className="transition hover:text-slate-950">
                                {item.label}
                            </a>
                        ),
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {authUser ? (
                        <Link
                            href={route('dashboard')}
                            className="hidden rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 md:inline-block"
                        >
                            Open App
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="hidden rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 md:inline-block"
                        >
                            Log In
                        </Link>
                    )}

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
                    <nav className="space-y-4">
                        {navigationItems.map((item) => (
                            'external' in item && item.external ? (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="block rounded-lg px-4 py-3 text-base font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block rounded-lg px-4 py-3 text-base font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                        <div className="border-t border-slate-100 pt-4">
                            {authUser ? (
                                <Link
                                    href={route('dashboard')}
                                    className="block rounded-2xl border-2 border-slate-200 px-4 py-3 text-center text-base font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Open App
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="block rounded-2xl border-2 border-slate-200 px-4 py-3 text-center text-base font-extrabold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

function ScrollReveal({
    children,
    delay = 0,
    variant = 'up',
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    variant?: 'up' | 'left' | 'right';
    className?: string;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.16,
                rootMargin: '0px 0px -10% 0px',
            },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${className}`.trim()}
            data-reveal={isVisible ? 'visible' : 'hidden'}
            data-reveal-variant={variant}
            style={{ ['--reveal-delay' as string]: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [billingMode, setBillingMode] = useState<'parent' | 'family'>('parent');
    const plansToRender = plans[billingMode];
    const primaryHref = auth.user ? route('dashboard') : route('register');
    const buildPlanHref = (planName: string) =>
        auth.user
            ? route('billing', {
                  mode: billingMode,
                  plan: planName.toLowerCase(),
              })
            : route('register');

    return (
        <>
            <Head title="KidSchedule" />

            <div id="top" className="min-h-screen bg-white text-slate-900">
                <NavBar authUser={auth.user} />

                <main>
                    <section className="bg-[linear-gradient(135deg,#eefbf6_0%,#edf8f4_50%,#edf5ff_100%)]">
                        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 md:pt-18 md:pb-22">
                            <ScrollReveal>
                                <h1 className="mx-auto max-w-4xl text-4xl leading-[1.15] font-black tracking-tight text-slate-900 sm:text-5xl md:text-7xl">
                                    The family calendar that actually works.
                                </h1>
                            </ScrollReveal>
                            <ScrollReveal delay={100}>
                                <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
                                    School schedules, activities, and everyone&apos;s stuff - finally in one place. Syncs everywhere. Works for any
                                    family.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal delay={180}>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                                    <a
                                        href={primaryHref}
                                        className="rounded-full bg-[linear-gradient(90deg,#67d2c3_0%,#58c9b7_100%)] px-6 py-4 text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.8)] transition hover:translate-y-[-1px] sm:px-7 sm:py-4"
                                    >
                                        Start Free for 60 Days
                                    </a>
                                    <a
                                        href="#features"
                                        className="rounded-full border border-white/80 bg-white/70 px-6 py-4 text-base font-black text-slate-700 shadow-sm transition hover:text-slate-950 sm:px-7 sm:py-4"
                                    >
                                        See How It Works
                                    </a>
                                </div>
                            </ScrollReveal>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-500 sm:mt-12 sm:gap-8">
                                {heroBullets.map((item, index) => (
                                    <ScrollReveal key={item} delay={240 + index * 80}>
                                        <div className="flex items-center gap-2">
                                            <Check className="size-4 text-[#59c8b7]" />
                                            {item}
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-18">
                        <ScrollReveal className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Built for how families really work</h2>
                            <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-500 sm:mt-4 sm:text-xl">
                                Whether you&apos;re coordinating with a spouse, a co-parent, a coach, or grandma.
                            </p>
                        </ScrollReveal>

                        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2">
                            {familySegments.map((item, index) => (
                                <ScrollReveal key={item.title} delay={index * 90} variant={index % 2 === 0 ? 'left' : 'right'}>
                                    {'href' in item && item.href ? (
                                        <Link
                                            href={item.href}
                                            className={`flex h-full min-h-[250px] flex-col rounded-[1.4rem] p-6 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 sm:min-h-[300px] sm:rounded-[1.8rem] sm:p-8 ${item.background}`}
                                        >
                                            <item.icon className={`size-8 ${item.accent} sm:size-9`} />
                                            <h3 className={`mt-5 text-2xl font-black tracking-tight sm:mt-7 sm:text-3xl ${item.accent}`}>{item.title}</h3>
                                            <p className={`mt-3 flex-1 text-base leading-7 sm:mt-4 sm:max-w-md sm:text-lg ${item.accent} opacity-85`}>{item.body}</p>
                                            <p className={`mt-5 text-sm font-black sm:mt-7 sm:text-base ${item.accent}`}>Learn more</p>
                                        </Link>
                                    ) : (
                                        <article className={`flex h-full min-h-[250px] flex-col rounded-[1.4rem] p-6 shadow-[0_22px_45px_-38px_rgba(15,23,42,0.45)] sm:min-h-[300px] sm:rounded-[1.8rem] sm:p-8 ${item.background}`}>
                                            <item.icon className={`size-8 ${item.accent} sm:size-9`} />
                                            <h3 className={`mt-5 text-2xl font-black tracking-tight sm:mt-7 sm:text-3xl ${item.accent}`}>{item.title}</h3>
                                            <p className={`mt-3 flex-1 text-base leading-7 sm:mt-4 sm:max-w-md sm:text-lg ${item.accent} opacity-85`}>{item.body}</p>
                                            <p className={`mt-5 text-sm font-black sm:mt-7 sm:text-base ${item.accent}`}>Learn more</p>
                                        </article>
                                    )}
                                </ScrollReveal>
                            ))}
                        </div>
                    </section>

                    <section id="features" className="bg-slate-50/75 py-12 sm:py-16 md:py-18">
                        <div className="mx-auto max-w-6xl px-4 sm:px-6">
                            <ScrollReveal className="text-center">
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Features that save you time</h2>
                                <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-500 sm:mt-4 sm:text-xl">
                                    No more juggling apps, spreadsheets, and group texts.
                                </p>
                            </ScrollReveal>

                            <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
                                {featureCards.map((feature, index) => (
                                    <ScrollReveal key={feature.title} delay={index * 70}>
                                        <article className="rounded-[1.4rem] border border-slate-100 bg-white p-6 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.35)] sm:rounded-[1.7rem] sm:p-7">
                                            <feature.icon className="size-7 text-[#a38fc9] sm:size-8" />
                                            <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-2xl">{feature.title}</h3>
                                            <p className="mt-3 text-base leading-7 text-slate-500 sm:text-lg">{feature.body}</p>
                                        </article>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-18">
                        <ScrollReveal className="mx-auto max-w-3xl rounded-[1.4rem] border-l-4 border-[#67d2c3] bg-slate-50 px-6 py-8 text-center shadow-[0_20px_55px_-45px_rgba(15,23,42,0.4)] sm:rounded-[1.8rem] sm:px-10 sm:py-10">
                            <p className="text-xl leading-[1.6] italic text-slate-600 sm:text-[2rem]">
                                &quot;Finally, one app that handles our crazy schedule. Three kids, two sports each, plus school stuff and I can
                                actually see it all without losing my mind.&quot;
                            </p>
                            <p className="mt-4 text-lg font-black text-[#67d2c3] sm:mt-6 sm:text-xl">Michelle R., mom of 3</p>
                        </ScrollReveal>
                    </section>

                    <section id="pricing" className="bg-slate-50/80 py-12 sm:py-16 md:py-18">
                        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
                            <ScrollReveal>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Simple, affordable plans</h2>
                                <p className="mt-3 text-lg text-slate-500 sm:mt-4 sm:text-xl">Start free for 60 days. Cancel anytime.</p>
                            </ScrollReveal>

                            <ScrollReveal delay={90} className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1.5 sm:mt-8">
                                <button
                                    type="button"
                                    onClick={() => setBillingMode('parent')}
                                    className={`rounded-xl px-5 py-2.5 text-sm font-black transition sm:px-6 sm:py-3 ${
                                        billingMode === 'parent' ? 'bg-[#67d2c3] text-white shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Per Parent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingMode('family')}
                                    className={`rounded-xl px-5 py-2.5 text-sm font-black transition sm:px-6 sm:py-3 ${
                                        billingMode === 'family' ? 'bg-[#67d2c3] text-white shadow-sm' : 'text-slate-500'
                                    }`}
                                >
                                    Full Family
                                </button>
                            </ScrollReveal>

                            <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 xl:grid-cols-3">
                                {plansToRender.map((plan, index) => (
                                    <ScrollReveal key={`${billingMode}-${plan.name}`} delay={index * 90}>
                                        <article
                                            className={`relative rounded-[1.6rem] border p-6 text-left shadow-[0_28px_65px_-52px_rgba(15,23,42,0.45)] sm:rounded-[1.8rem] sm:p-8 ${
                                                plan.featured ? 'border-transparent bg-[#63cfc0] text-white' : 'border-slate-200 bg-white text-slate-900'
                                            }`}
                                        >
                                            {plan.badge && (
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb21a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white sm:px-4 sm:py-2">
                                                    {plan.badge}
                                                </div>
                                            )}

                                            <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{plan.name}</h3>
                                            <p className={`mt-1 text-base sm:mt-2 sm:text-lg ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>{plan.subtitle}</p>
                                            <div className="mt-6 flex items-end gap-2 sm:mt-8">
                                                <span className="text-5xl font-black tracking-tight sm:text-6xl">{plan.price}</span>
                                                <span className={`pb-1 text-lg sm:pb-2 sm:text-xl ${plan.featured ? 'text-white/85' : 'text-slate-500'}`}>/month</span>
                                            </div>

                                            <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-3 text-base leading-7 sm:text-lg sm:leading-8">
                                                        <Check className={`mt-1 size-5 shrink-0 ${plan.featured ? 'text-white' : 'text-slate-400'}`} />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Link
                                                href={buildPlanHref(plan.name)}
                                                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-black transition sm:mt-10 sm:px-6 sm:py-4 sm:text-base ${
                                                    plan.featured
                                                        ? 'bg-white text-[#55bfae] hover:bg-slate-50'
                                                        : 'bg-[#67d2c3] text-white hover:bg-[#59c8b7]'
                                                }`}
                                            >
                                                Start Free Trial
                                            </Link>
                                        </article>
                                    </ScrollReveal>
                                ))}
                            </div>

                            <p className="mt-6 text-sm text-slate-500 sm:mt-8 sm:text-base">
                                Per parent pricing shown. Toggle to Full Family to include both parents. Cancel anytime.
                            </p>
                        </div>
                    </section>

                    <section id="blog" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-18">
                        <ScrollReveal className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                From Our Blog
                            </h2>
                            <p className="mx-auto mt-3 max-w-3xl text-lg text-slate-500 sm:mt-4 sm:text-xl">
                                Expert tips, guides, and insights for co-parenting success.
                            </p>
                            <Link
                                href={route('blog.index')}
                                className="mt-6 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(90deg,#67d2c3_0%,#58c9b7_100%)] px-6 py-4 text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.8)] transition hover:translate-y-[-1px] sm:mt-10 sm:px-8 sm:py-5"
                            >
                                Visit Our Blog
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </ScrollReveal>
                    </section>

                    <section id="pta" className="bg-[#1d273a] pt-16 text-white sm:pt-20">
                        <div className="border-b border-white/5 pb-12 sm:pb-18">
                            <ScrollReveal className="mx-auto max-w-5xl px-4 text-center sm:px-6">
                                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Ready to get organized?</h2>
                                <p className="mx-auto mt-4 max-w-3xl text-xl leading-9 text-slate-300 sm:mt-6 sm:text-2xl sm:leading-10">
                                    Join thousands of families who finally have one place for everything.
                                </p>
                                <p className="mt-8 text-2xl font-black sm:mt-12 sm:text-3xl">Start Your Free 60-Day Trial</p>
                                <p className="mt-3 text-base text-slate-400 sm:mt-5 sm:text-lg">Setup takes 2 minutes. Cancel anytime.</p>
                            </ScrollReveal>
                        </div>

                        <footer className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
                                <ScrollReveal variant="left">
                                    <div>
                                        <p className="text-2xl font-black tracking-tight sm:text-[2.4rem]">KidSchedule</p>
                                        <p className="mt-4 text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8">Built for co-parents, by co-parents.</p>
                                        <div className="mt-6 flex items-center gap-3 text-slate-400 sm:mt-8 sm:gap-4">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 sm:h-11 sm:w-11">
                                                <Shield className="size-5" />
                                            </span>
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 sm:h-11 sm:w-11">
                                                <Users className="size-5" />
                                            </span>
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 sm:h-11 sm:w-11">
                                                <GraduationCap className="size-5" />
                                            </span>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                {footerColumns.map((column, index) => (
                                    <ScrollReveal key={column.title} delay={index * 90} variant="right">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white sm:text-sm">{column.title}</p>
                                            <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                                                {column.links.map((link) => (
                                                    <li key={link} className="text-base text-slate-400 sm:text-lg">
                                                        {link}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>

                            <div className="mt-10 border-t border-white/8 pt-8 text-sm text-slate-500 sm:mt-14 sm:pt-10">
                                © 2026 KidSchedule. Terms and Privacy
                            </div>
                        </footer>
                    </section>
                </main>

                <div className="fixed right-4 bottom-4 left-4 z-30 hidden justify-center lg:flex">
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
                            href={primaryHref}
                            className="rounded-xl bg-[#67d2c3] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#55c8b7]"
                        >
                            Install
                        </a>
                    </div>
                </div>

                <a
                    href={primaryHref}
                    className="fixed right-4 bottom-4 left-4 z-30 inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#63d3c4_0%,#5bcbb8_100%)] px-5 py-3.5 text-sm font-black text-white shadow-[0_20px_45px_-20px_rgba(77,191,174,0.8)] transition hover:translate-y-[-1px] sm:left-auto sm:right-6 sm:bottom-6 sm:gap-3 sm:px-6 sm:py-4 lg:hidden"
                >
                    <CalendarDays className="size-4" />
                    Start Free Trial
                </a>
            </div>
        </>
    );
}
