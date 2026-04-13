import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CalendarSync,
    Check,
    Drum,
    Globe,
    Laptop,
    Lock,
    Menu,
    Monitor,
    MonitorSmartphone,
    MoveRight,
    ShieldCheck,
    Tent,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const heroTags = ['Youth Soccer', 'Little League', 'Swim Team', 'Dance Studio', 'Scout Troop'];

const featureCards = [
    {
        icon: Globe,
        title: 'Public Portal',
        body: 'Share a beautiful calendar page with parents. No login required. Just send the link.',
    },
    {
        icon: Lock,
        title: 'Private Member View',
        body: "Team members see more details, contact info, notes, and locations. Control what's public vs. private.",
    },
    {
        icon: CalendarSync,
        title: 'Webcal/ICS Feeds',
        body: 'Parents subscribe in Google, Apple, or Outlook. Events auto-update when you make changes.',
    },
    {
        icon: Users,
        title: 'Roster Management',
        body: "Invite by email, SMS, or share link. Track who's joined. Manage roles for coaches, parents, and players.",
    },
    {
        icon: CalendarDays,
        title: 'Bulk Scheduling',
        body: 'Add entire seasons at once. Recurring practices, games, and tournaments are all set in minutes.',
    },
    {
        icon: ShieldCheck,
        title: 'RSVP & Attendance',
        body: "Track who's coming to practice, who can drive, and who has replied in one place.",
    },
    {
        icon: Bell,
        title: 'Change Notifications',
        body: 'Practice moved? Game cancelled? Everyone gets notified instantly by email or push.',
    },
    {
        icon: MoveRight,
        title: 'Venue Management',
        body: 'Save locations with addresses and map links. Reuse them across events and give parents directions.',
    },
    {
        icon: CalendarSync,
        title: 'Family Integration',
        body: "Team events flow into parents' family calendars. One view of all kid activities.",
    },
] as const;

const setupSteps = [
    {
        number: '1',
        title: 'Create your team',
        body: 'Name it, add your logo, set your timezone. Done in 30 seconds.',
    },
    {
        number: '2',
        title: 'Add your schedule',
        body: 'Enter events manually, paste from a spreadsheet, or import from another calendar.',
    },
    {
        number: '3',
        title: 'Share with parents',
        body: 'Send the link. They subscribe. Everyone stays in sync automatically.',
    },
] as const;

const calendarApps = [
    {
        title: 'Google Calendar',
        body: 'Subscribe via URL. Events appear alongside work and family calendars.',
    },
    {
        title: 'Apple Calendar',
        body: 'One-tap subscribe on iPhone. Syncs to Mac and iPad automatically.',
    },
    {
        title: 'Outlook',
        body: 'Works with Outlook.com and desktop Outlook. Personal and work accounts.',
    },
    {
        title: 'Any ICS-compatible app',
        body: 'Standard webcal feeds work everywhere. No proprietary lock-in.',
    },
] as const;

const groupTypes = [
    {
        icon: Trophy,
        title: 'Sports Teams',
        body: 'Soccer, baseball, basketball, hockey, swim...',
    },
    {
        icon: Drum,
        title: 'Dance & Music',
        body: 'Studios, recitals, competitions, lessons',
    },
    {
        icon: Tent,
        title: 'Scout Troops',
        body: 'Meetings, campouts, badge events',
    },
    {
        icon: Users,
        title: 'Clubs & Activities',
        body: 'Theater, robotics, academic teams',
    },
] as const;

function Header({ authUser }: { authUser: SharedData['auth']['user'] | undefined }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-[#ff6b08] text-white">
            <div className="mx-auto flex max-w-[1140px] items-center justify-between px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
                <Link href={route('home')} className="text-2xl font-black tracking-tight text-white sm:text-[1.95rem]">
                    KidSchedule
                </Link>

                {/* Desktop navigation */}
                <div className="hidden items-center gap-8 text-base font-bold md:flex">
                    {authUser ? (
                        <Link
                            href={route('dashboard')}
                            className="min-h-[44px] min-w-[44px] text-white/90 transition hover:text-white"
                        >
                            Open App
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="min-h-[44px] min-w-[44px] text-white/90 transition hover:text-white"
                        >
                            Log In
                        </Link>
                    )}
                    <Link
                        href={route('home')}
                        className="min-h-[44px] min-w-[44px] text-white/90 transition hover:text-white"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-white md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-t border-white/20 px-4 py-4 md:hidden">
                    <nav className="flex flex-col gap-2 text-base font-bold">
                        {authUser ? (
                            <Link
                                href={route('dashboard')}
                                className="min-h-[44px] rounded-md px-4 py-3 text-white/90 transition hover:bg-white/10 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Open App
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="min-h-[44px] rounded-md px-4 py-3 text-white/90 transition hover:bg-white/10 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log In
                            </Link>
                        )}
                        <Link
                            href={route('home')}
                            className="min-h-[44px] rounded-md px-4 py-3 text-white/90 transition hover:bg-white/10 hover:text-white"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Back to Home
                        </Link>
                    </nav>
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
    icon: typeof Globe;
    title: string;
    body: string;
}) {
    return (
        <article className="rounded-[1.7rem] border border-[#eef2f6] bg-[#fbfcfe] p-6 shadow-[0_22px_45px_-42px_rgba(15,23,42,0.3)] sm:p-7 lg:p-8">
            <div className="inline-flex rounded-[1rem] bg-[#ff6b08] p-3 text-white sm:p-4">
                <Icon className="size-5 sm:size-6" />
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-[1.95rem]">{title}</h3>
            <p className="mt-2 text-base leading-7 text-slate-500 sm:mt-3 sm:text-[1.08rem] sm:leading-8">{body}</p>
        </article>
    );
}

export default function ForTeams() {
    const { auth } = usePage<SharedData>().props;
    const primaryHref = auth.user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="For Teams" />

            <div className="min-h-screen bg-white text-slate-900">
                <Header authUser={auth.user} />

                <main>
                    <section className="bg-[#ff6b08] text-white">
                        <div className="mx-auto max-w-[1100px] px-4 pb-12 pt-12 text-center sm:px-6 sm:pb-16 sm:pt-16 md:px-8 md:pb-18 md:pt-18">
                            <div className="mx-auto inline-flex rounded-full bg-white/16 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white sm:px-6 sm:py-3 sm:text-[0.92rem]">
                                For teams & groups
                            </div>

                            <h1 className="mx-auto mt-6 max-w-[760px] text-4xl leading-[1.08] font-black tracking-[-0.04em] sm:mt-8 sm:text-5xl md:mt-8 md:text-6xl lg:text-7xl">
                                One calendar.
                                <br />
                                Everyone in sync.
                            </h1>

                            <p className="mx-auto mt-4 max-w-[820px] text-base leading-7 text-white/88 sm:mt-7 sm:text-[1.2rem] sm:leading-10">
                                For sports teams, clubs, and groups that need everyone on the same page. Share schedules, track RSVPs, and keep parents informed.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href={primaryHref}
                                    className="min-h-[44px] rounded-[1.1rem] bg-white px-6 py-4 text-base font-black text-[#ff6b08] shadow-[0_18px_38px_-20px_rgba(15,23,42,0.3)] transition hover:translate-y-[-1px] sm:px-9 sm:py-5 sm:text-[1.08rem]"
                                >
                                    Create Your Team Calendar
                                </a>
                                <a
                                    href="#teams-features"
                                    className="min-h-[44px] rounded-[1.1rem] border border-white/40 bg-transparent px-6 py-4 text-base font-black text-white transition hover:bg-white/6 sm:px-9 sm:py-5 sm:text-[1.08rem]"
                                >
                                    See All Features
                                </a>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
                                {heroTags.map((tag) => (
                                    <div key={tag} className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white sm:px-5 sm:py-3 sm:text-[0.98rem]">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="teams-features" className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-18">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">
                                Everything coaches and team managers need
                            </h2>
                            <p className="mx-auto mt-3 max-w-[760px] text-base text-slate-500 sm:text-[1.18rem]">
                                Stop the group text chaos. Get everyone on the same calendar.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#fdf4e7] py-12 sm:py-16">
                        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 md:px-8">
                            <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">
                                Get your team set up in 5 minutes
                            </h2>
                            <div className="mt-8 grid gap-8 sm:mt-10 sm:gap-10 md:grid-cols-3">
                                {setupSteps.map((step) => (
                                    <div key={step.number} className="text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ff6b08] text-xl font-black text-white sm:h-16 sm:w-16 sm:text-[2rem]">
                                            {step.number}
                                        </div>
                                        <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:mt-7 sm:text-[1.9rem]">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-base leading-7 text-slate-500 sm:mt-3 sm:text-[1.08rem] sm:leading-8">
                                            {step.body}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-18">
                        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">
                                    Works with every calendar app
                                </h2>
                                <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-8">
                                    {calendarApps.map((app) => (
                                        <div key={app.title} className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
                                            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff7a1b] text-white sm:h-9 sm:w-9">
                                                <Check className="size-3.5 sm:size-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-[1.55rem]">
                                                    {app.title}
                                                </h3>
                                                <p className="mt-1 text-sm leading-7 text-slate-500 sm:mt-2 sm:text-[1.05rem] sm:leading-8">
                                                    {app.body}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.9rem] bg-[#ff6b08] px-6 py-8 text-center text-white shadow-[0_28px_60px_-40px_rgba(255,107,8,0.55)] sm:px-8 sm:py-10">
                                <div className="flex items-center justify-center gap-4 sm:gap-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/18 sm:h-16 sm:w-16">
                                        <MonitorSmartphone className="size-6 sm:size-8" />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/18 sm:h-16 sm:w-16">
                                        <Laptop className="size-6 sm:size-8" />
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/18 sm:h-16 sm:w-16">
                                        <Monitor className="size-6 sm:size-8" />
                                    </div>
                                </div>
                                <p className="mt-6 text-2xl font-black tracking-tight sm:mt-8 sm:text-[2rem]">One source of truth.</p>
                                <p className="mt-2 text-lg leading-8 text-white/92 sm:text-[1.35rem] sm:leading-9">
                                    Every device stays in sync.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-12 md:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">
                                Built for groups like yours
                            </h2>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 xl:grid-cols-4">
                            {groupTypes.map((group) => (
                                <article
                                    key={group.title}
                                    className="rounded-[1.7rem] border border-[#eef2f6] bg-white p-6 text-center shadow-[0_22px_45px_-42px_rgba(15,23,42,0.26)] sm:p-8"
                                >
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.1rem] bg-[#fff1e7] text-[#ff6b08] sm:h-16 sm:w-16">
                                        <group.icon className="size-7 sm:size-8" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-[1.75rem]">
                                        {group.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-slate-500 sm:mt-3 sm:text-[1.03rem] sm:leading-8">
                                        {group.body}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 bg-[#1d223a] py-12 text-white sm:py-18">
                        <div className="mx-auto max-w-[900px] px-4 text-center sm:px-6 md:px-8">
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-[3.15rem]">
                                Stop the &quot;what time is practice?&quot; texts
                            </h2>
                            <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-white/82 sm:mt-5 sm:text-[1.18rem] sm:leading-9">
                                Give your team one calendar that everyone can actually find and use.
                            </p>
                            <a
                                href={primaryHref}
                                className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-[1.1rem] bg-[#ff7a1b] px-6 py-4 text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(255,122,27,0.5)] transition hover:translate-y-[-1px] sm:mt-10 sm:px-9 sm:py-5 sm:text-[1.08rem]"
                            >
                                Create Your Team Calendar Free
                            </a>
                            <p className="mt-4 text-sm text-white/56 sm:mt-5 sm:text-[0.98rem]">Free for basic teams. Upgrade anytime.</p>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#1d223a] py-6 text-center text-xs text-white/62 sm:py-8 sm:text-sm">
                    © 2026 KidSchedule. Terms · Privacy
                </footer>
            </div>
        </>
    );
}
