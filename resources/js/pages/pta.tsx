import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CalendarDays,
    Check,
    CheckSquare,
    Lock,
    Megaphone,
    MessageCircle,
    Smartphone,
    Users,
} from 'lucide-react';

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
    return (
        <header className="bg-[linear-gradient(135deg,#6c7bf3_0%,#7860cb_100%)] text-white">
            <div className="mx-auto flex max-w-[1140px] items-center justify-between px-8 py-8">
                <Link href={route('home')} className="text-[1.95rem] font-black tracking-tight text-white">
                    KidSchedule
                </Link>

                <Link href={route('home')} className="text-base font-bold text-white/92 transition hover:text-white">
                    ← Back to Home
                </Link>
            </div>
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
        <article className="rounded-[1.7rem] border border-[#eef2f6] bg-[#fbfcfe] p-7 shadow-[0_22px_45px_-42px_rgba(15,23,42,0.28)]">
            <div className="inline-flex rounded-[1rem] bg-[linear-gradient(180deg,#6e7cf0_0%,#7c5fca_100%)] p-4 text-white">
                <Icon className="size-6" />
            </div>
            <h3 className="mt-6 text-[1.9rem] font-black tracking-tight text-slate-900">{title}</h3>
            <p className="mt-3 text-[1.08rem] leading-8 text-slate-500">{body}</p>
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
                    <section className="bg-[linear-gradient(135deg,#6c7bf3_0%,#7860cb_100%)] pb-18 text-white">
                        <div className="mx-auto max-w-[980px] px-8 pt-16 text-center">
                            <div className="mx-auto inline-flex rounded-full bg-white/15 px-6 py-3 text-[0.92rem] font-black uppercase tracking-[0.14em] text-white">
                                Now available
                            </div>

                            <h1 className="mx-auto mt-8 max-w-[760px] text-[4.25rem] leading-[1.05] font-black tracking-[-0.04em]">
                                The Complete PTA
                                <br />
                                Management Platform
                            </h1>

                            <p className="mx-auto mt-7 max-w-[760px] text-[1.2rem] leading-10 text-white/90">
                                Everything your PTA needs in one place. Member management, committees, announcements, messaging, and events designed for busy parent volunteers.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-14 w-full max-w-[320px] rounded-[1rem] border border-white/25 bg-white px-5 text-base font-medium text-slate-900 outline-none"
                                />
                                <a
                                    href={primaryHref}
                                    className="inline-flex h-14 items-center justify-center rounded-[1rem] bg-[#ffb114] px-8 text-base font-black text-white shadow-[0_16px_35px_-20px_rgba(255,177,20,0.7)] transition hover:translate-y-[-1px]"
                                >
                                    Get Early Access
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1180px] px-8 py-18">
                        <div className="text-center">
                            <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Everything Your PTA Needs</h2>
                            <p className="mx-auto mt-3 max-w-[760px] text-[1.18rem] text-slate-500">
                                Built by parents who understand the challenges of running a PTA
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto grid max-w-[1180px] gap-12 px-8 py-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
                        <div>
                            <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Why PTAs Love KidSchedule</h2>
                            <div className="mt-8 grid gap-7">
                                {valueBullets.map((item) => (
                                    <div key={item.title} className="grid grid-cols-[auto_1fr] gap-4">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#19be82] text-white">
                                            <Check className="size-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-[1.4rem] font-black tracking-tight text-slate-900">{item.title}</h3>
                                            <p className="mt-2 text-[1.04rem] leading-8 text-slate-500">{item.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mx-auto flex aspect-square w-full max-w-[520px] flex-col items-center justify-center rounded-full bg-[linear-gradient(135deg,#6c7bf3_0%,#7b58c6_100%)] px-12 text-center text-white shadow-[0_30px_70px_-45px_rgba(108,123,243,0.7)]">
                            <div>
                                <p className="text-7xl font-black tracking-tight">75%</p>
                                <p className="mt-2 text-[1.35rem] text-white/92">Less time on admin tasks</p>
                            </div>
                            <div className="mt-10">
                                <p className="text-6xl font-black tracking-tight">3x</p>
                                <p className="mt-2 text-[1.35rem] text-white/92">More parent participation</p>
                            </div>
                            <div className="mt-10">
                                <p className="text-6xl font-black tracking-tight">100%</p>
                                <p className="mt-2 text-[1.35rem] text-white/92">Free for PTAs</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-10 bg-[linear-gradient(135deg,#6c7bf3_0%,#7b58c6_100%)] py-18 text-white">
                        <div className="mx-auto max-w-[860px] px-8 text-center">
                            <h2 className="text-[3.15rem] font-black tracking-tight">Ready to modernize your PTA?</h2>
                            <p className="mx-auto mt-5 max-w-[680px] text-[1.18rem] leading-9 text-white/88">
                                Join hundreds of PTAs already using KidSchedule to engage their parent community.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-14 w-full max-w-[320px] rounded-[1rem] border border-white/25 bg-white px-5 text-base font-medium text-slate-900 outline-none"
                                />
                                <a
                                    href={primaryHref}
                                    className="inline-flex h-14 items-center justify-center rounded-[1rem] bg-[#ffb114] px-8 text-base font-black text-white shadow-[0_16px_35px_-20px_rgba(255,177,20,0.7)] transition hover:translate-y-[-1px]"
                                >
                                    Get Started Free
                                </a>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#1d273a] py-8 text-center text-sm text-white/62">© 2026 KidSchedule. Terms · Privacy</footer>
            </div>
        </>
    );
}
