import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CalendarDays,
    Check,
    CheckSquare,
    Lock,
    Menu,
    Megaphone,
    MessageCircle,
    Smartphone,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const featureCards = [
    {
        icon: Users,
        title: 'Member Directory',
        body: 'Searchable directory with parent profiles, contact info, and children details. Know your community.',
    },
    {
        icon: Building2,
        title: 'Committees & Groups',
        body: 'Organize volunteers into committees with roles, leads, and dedicated communication channels.',
    },
    {
        icon: Megaphone,
        title: 'Announcements',
        body: 'Send beautiful announcements to your entire membership or specific groups with one click.',
    },
    {
        icon: MessageCircle,
        title: 'In-App Messaging',
        body: 'Direct messaging between members. No need to share personal phone numbers or emails.',
    },
    {
        icon: CalendarDays,
        title: 'Event Management',
        body: 'Create events, track RSVPs, send reminders, and coordinate volunteers all in one place.',
    },
    {
        icon: CheckSquare,
        title: 'Member Approvals',
        body: 'Control who joins your PTA with approval workflows. Verify parents belong to your school.',
    },
    {
        icon: Bell,
        title: 'Push Notifications',
        body: 'Instant notifications for announcements, messages, and events. Parents never miss important updates.',
    },
    {
        icon: Smartphone,
        title: 'Mobile-First Design',
        body: 'Works beautifully on phones, tablets, and desktops. Manage your PTA from anywhere.',
    },
    {
        icon: Lock,
        title: 'Privacy & Security',
        body: 'Your member data stays private. Role-based access controls keep sensitive info protected.',
    },
] as const;

const valueBullets = [
    {
        title: 'Stop juggling spreadsheets',
        body: 'All your member data, committees, and communications in one organized place.',
    },
    {
        title: 'Increase parent engagement',
        body: 'Easy-to-use app means more parents actually participate and stay informed.',
    },
    {
        title: 'Save volunteer hours',
        body: 'Automate repetitive tasks like reminders, sign-ups, and member onboarding.',
    },
    {
        title: 'Year-over-year continuity',
        body: 'New board members inherit organized history, not chaos. Easy transitions.',
    },
] as const;

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-[linear-gradient(135deg,#6c7bf3_0%,#7860cb_100%)] text-white">
            <div className="mx-auto flex max-w-[1140px] items-center justify-between px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
                <Link href={route('home')} className="text-2xl font-black tracking-tight text-white sm:text-[1.95rem]">
                    KidSchedule
                </Link>

                {/* Desktop back link */}
                <Link
                    href={route('home')}
                    className="hidden min-h-[44px] items-center text-base font-bold text-white/92 transition hover:text-white md:flex"
                >
                    ← Back to Home
                </Link>

                {/* Mobile hamburger button */}
                <button
                    type="button"
                    aria-label="Toggle menu"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && (
                <div className="border-t border-white/20 px-4 py-4 sm:px-6 md:hidden">
                    <Link
                        href={route('home')}
                        className="flex min-h-[44px] items-center text-base font-bold text-white/92 transition hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        ← Back to Home
                    </Link>
                </div>
            )}
        </header>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    body,
}: {
    icon: typeof Users;
    title: string;
    body: string;
}) {
    return (
        <article className="rounded-[1.7rem] border border-[#eef2f6] bg-[#fbfcfe] p-6 shadow-[0_22px_45px_-42px_rgba(15,23,42,0.28)] sm:p-7 lg:p-8">
            <div className="inline-flex rounded-[1rem] bg-[linear-gradient(180deg,#6e7cf0_0%,#7c5fca_100%)] p-3 text-white sm:p-4">
                <Icon className="size-5 sm:size-6" />
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-[1.9rem]">{title}</h3>
            <p className="mt-2 text-base leading-7 text-slate-500 sm:mt-3 sm:text-[1.08rem] sm:leading-8">{body}</p>
        </article>
    );
}

export default function PtaLanding() {
    const { auth } = usePage<SharedData>().props;
    const primaryHref = auth.user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="For PTAs" />

            <div className="min-h-screen bg-white text-slate-900">
                <Header />

                <main>
                    <section className="bg-[linear-gradient(135deg,#6c7bf3_0%,#7860cb_100%)] pb-12 text-white sm:pb-16 md:pb-18">
                        <div className="mx-auto max-w-[980px] px-4 pt-12 text-center sm:px-6 sm:pt-16 md:px-8">
                            <div className="mx-auto inline-flex min-h-[44px] items-center rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white sm:px-6 sm:py-3 sm:text-[0.92rem]">
                                Now available
                            </div>

                            <h1 className="mx-auto mt-6 max-w-[760px] text-4xl leading-[1.1] font-black tracking-[-0.04em] sm:mt-8 sm:text-5xl md:mt-8 md:text-6xl md:leading-[1.05] lg:text-7xl">
                                The Complete PTA
                                <br />
                                Management Platform
                            </h1>

                            <p className="mx-auto mt-4 max-w-[760px] text-base leading-7 text-white/90 sm:mt-7 sm:text-[1.2rem] sm:leading-10">
                                Everything your PTA needs in one place. Member management, committees, announcements, messaging, and events designed for busy parent volunteers.
                            </p>

                            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="min-h-[44px] w-full max-w-[320px] rounded-[1rem] border border-white/25 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none sm:h-14 sm:px-5"
                                />
                                <a
                                    href={primaryHref}
                                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[1rem] bg-[#ffb114] px-6 py-3 text-base font-black text-white shadow-[0_16px_35px_-20px_rgba(255,177,20,0.7)] transition hover:translate-y-[-1px] sm:h-14 sm:w-auto sm:px-8"
                                >
                                    Get Early Access
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-18">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">Everything Your PTA Needs</h2>
                            <p className="mx-auto mt-2 max-w-[760px] text-base text-slate-500 sm:mt-3 sm:text-[1.18rem]">
                                Built by parents who understand the challenges of running a PTA
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-8 lg:grid lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">Why PTAs Love KidSchedule</h2>
                            <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-7">
                                {valueBullets.map((item) => (
                                    <div key={item.title} className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
                                        <div className="mt-1 flex min-h-[44px] h-8 w-8 items-center justify-center rounded-full bg-[#19be82] text-white sm:h-8 sm:w-8">
                                            <Check className="size-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-[1.4rem]">{item.title}</h3>
                                            <p className="mt-1 text-base leading-7 text-slate-500 sm:mt-2 sm:text-[1.04rem] sm:leading-8">{item.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mx-auto mt-8 flex aspect-square w-full max-w-[520px] flex-col items-center justify-center rounded-full bg-[linear-gradient(135deg,#6c7bf3_0%,#7b58c6_100%)] px-8 py-12 text-center text-white shadow-[0_30px_70px_-45px_rgba(108,123,243,0.7)] sm:px-10 sm:py-14 lg:mt-0 lg:px-12">
                            <div>
                                <p className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl">75%</p>
                                <p className="mt-1 text-base text-white/92 sm:mt-2 sm:text-[1.35rem]">Less time on admin tasks</p>
                            </div>
                            <div className="mt-6 sm:mt-10">
                                <p className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">3x</p>
                                <p className="mt-1 text-base text-white/92 sm:mt-2 sm:text-[1.35rem]">More parent participation</p>
                            </div>
                            <div className="mt-6 sm:mt-10">
                                <p className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">100%</p>
                                <p className="mt-1 text-base text-white/92 sm:mt-2 sm:text-[1.35rem]">Free for PTAs</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 bg-[linear-gradient(135deg,#6c7bf3_0%,#7b58c6_100%)] py-12 text-white sm:mt-10 sm:py-16 md:py-18">
                        <div className="mx-auto max-w-[860px] px-4 text-center sm:px-6 md:px-8">
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-[3.15rem]">Ready to modernize your PTA?</h2>
                            <p className="mx-auto mt-3 max-w-[680px] text-base leading-7 text-white/88 sm:mt-5 sm:text-[1.18rem] sm:leading-9">
                                Join hundreds of PTAs already using KidSchedule to engage their parent community.
                            </p>

                            <div className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="min-h-[44px] w-full max-w-[320px] rounded-[1rem] border border-white/25 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none sm:h-14 sm:px-5"
                                />
                                <a
                                    href={primaryHref}
                                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[1rem] bg-[#ffb114] px-6 py-3 text-base font-black text-white shadow-[0_16px_35px_-20px_rgba(255,177,20,0.7)] transition hover:translate-y-[-1px] sm:h-14 sm:w-auto sm:px-8"
                                >
                                    Get Started Free
                                </a>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#1d273a] py-6 text-center text-sm text-white/62 sm:py-8">© 2026 KidSchedule. Terms · Privacy</footer>
            </div>
        </>
    );
}
