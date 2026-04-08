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
    Monitor,
    MonitorSmartphone,
    MoveRight,
    ShieldCheck,
    Tent,
    Trophy,
    Users,
} from 'lucide-react';

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
    return (
        <header className="bg-[#ff6b08] text-white">
            <div className="mx-auto flex max-w-[1140px] items-center justify-between px-8 py-8">
                <Link href={route('home')} className="text-[1.95rem] font-black tracking-tight text-white">
                    KidSchedule
                </Link>

                <div className="flex items-center gap-8 text-base font-bold">
                    {authUser ? (
                        <Link href={route('dashboard')} className="text-white/90 transition hover:text-white">
                            Open App
                        </Link>
                    ) : (
                        <Link href={route('login')} className="text-white/90 transition hover:text-white">
                            Log In
                        </Link>
                    )}
                    <Link href={route('home')} className="text-white/90 transition hover:text-white">
                        Back to Home
                    </Link>
                </div>
            </div>
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
        <article className="rounded-[1.7rem] border border-[#eef2f6] bg-[#fbfcfe] p-7 shadow-[0_22px_45px_-42px_rgba(15,23,42,0.3)]">
            <div className="inline-flex rounded-[1rem] bg-[#ff6b08] p-4 text-white">
                <Icon className="size-6" />
            </div>
            <h3 className="mt-6 text-[1.95rem] font-black tracking-tight text-slate-900">{title}</h3>
            <p className="mt-3 text-[1.08rem] leading-8 text-slate-500">{body}</p>
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
                    <section className="bg-[#ff6b08] pb-18 text-white">
                        <div className="mx-auto max-w-[1100px] px-8 pt-18 text-center">
                            <div className="mx-auto inline-flex rounded-full bg-white/16 px-6 py-3 text-[0.92rem] font-black uppercase tracking-[0.14em] text-white">
                                For teams & groups
                            </div>

                            <h1 className="mx-auto mt-8 max-w-[760px] text-[4.45rem] leading-[1.04] font-black tracking-[-0.04em]">
                                One calendar.
                                <br />
                                Everyone in sync.
                            </h1>

                            <p className="mx-auto mt-7 max-w-[820px] text-[1.2rem] leading-10 text-white/88">
                                For sports teams, clubs, and groups that need everyone on the same page. Share schedules, track RSVPs, and keep parents informed.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href={primaryHref}
                                    className="rounded-[1.1rem] bg-white px-9 py-5 text-[1.08rem] font-black text-[#ff6b08] shadow-[0_18px_38px_-20px_rgba(15,23,42,0.3)] transition hover:translate-y-[-1px]"
                                >
                                    Create Your Team Calendar
                                </a>
                                <a
                                    href="#teams-features"
                                    className="rounded-[1.1rem] border border-white/40 bg-transparent px-9 py-5 text-[1.08rem] font-black text-white transition hover:bg-white/6"
                                >
                                    See All Features
                                </a>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                {heroTags.map((tag) => (
                                    <div key={tag} className="rounded-full bg-white/15 px-5 py-3 text-[0.98rem] font-bold text-white">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="teams-features" className="mx-auto max-w-[1180px] px-8 py-18">
                        <div className="text-center">
                            <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Everything coaches and team managers need</h2>
                            <p className="mx-auto mt-3 max-w-[760px] text-[1.18rem] text-slate-500">
                                Stop the group text chaos. Get everyone on the same calendar.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#fdf4e7] py-16">
                        <div className="mx-auto max-w-[1080px] px-8">
                            <h2 className="text-center text-[3rem] font-black tracking-tight text-slate-900">Get your team set up in 5 minutes</h2>
                            <div className="mt-10 grid gap-10 md:grid-cols-3">
                                {setupSteps.map((step) => (
                                    <div key={step.number} className="text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b08] text-[2rem] font-black text-white">
                                            {step.number}
                                        </div>
                                        <h3 className="mt-7 text-[1.9rem] font-black tracking-tight text-slate-900">{step.title}</h3>
                                        <p className="mt-3 text-[1.08rem] leading-8 text-slate-500">{step.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1080px] px-8 py-18">
                        <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
                            <div>
                                <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Works with every calendar app</h2>
                                <div className="mt-10 grid gap-8">
                                    {calendarApps.map((app) => (
                                        <div key={app.title} className="grid grid-cols-[auto_1fr] gap-4">
                                            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff7a1b] text-white">
                                                <Check className="size-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-[1.55rem] font-black tracking-tight text-slate-900">{app.title}</h3>
                                                <p className="mt-2 text-[1.05rem] leading-8 text-slate-500">{app.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.9rem] bg-[#ff6b08] px-8 py-10 text-center text-white shadow-[0_28px_60px_-40px_rgba(255,107,8,0.55)]">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white/18">
                                        <MonitorSmartphone className="size-8" />
                                    </div>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white/18">
                                        <Laptop className="size-8" />
                                    </div>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white/18">
                                        <Monitor className="size-8" />
                                    </div>
                                </div>
                                <p className="mt-8 text-[2rem] font-black tracking-tight">One source of truth.</p>
                                <p className="mt-2 text-[1.35rem] leading-9 text-white/92">Every device stays in sync.</p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1100px] px-8 py-10">
                        <div className="text-center">
                            <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Built for groups like yours</h2>
                        </div>

                        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            {groupTypes.map((group) => (
                                <article key={group.title} className="rounded-[1.7rem] border border-[#eef2f6] bg-white p-8 text-center shadow-[0_22px_45px_-42px_rgba(15,23,42,0.26)]">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.1rem] bg-[#fff1e7] text-[#ff6b08]">
                                        <group.icon className="size-8" />
                                    </div>
                                    <h3 className="mt-6 text-[1.75rem] font-black tracking-tight text-slate-900">{group.title}</h3>
                                    <p className="mt-3 text-[1.03rem] leading-8 text-slate-500">{group.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 bg-[#1d223a] py-18 text-white">
                        <div className="mx-auto max-w-[900px] px-8 text-center">
                            <h2 className="text-[3.15rem] font-black tracking-tight">Stop the &quot;what time is practice?&quot; texts</h2>
                            <p className="mx-auto mt-5 max-w-[760px] text-[1.18rem] leading-9 text-white/82">
                                Give your team one calendar that everyone can actually find and use.
                            </p>
                            <a
                                href={primaryHref}
                                className="mt-10 inline-flex rounded-[1.1rem] bg-[#ff7a1b] px-9 py-5 text-[1.08rem] font-black text-white shadow-[0_18px_40px_-20px_rgba(255,122,27,0.5)] transition hover:translate-y-[-1px]"
                            >
                                Create Your Team Calendar Free
                            </a>
                            <p className="mt-5 text-[0.98rem] text-white/56">Free for basic teams. Upgrade anytime.</p>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#1d223a] py-8 text-center text-sm text-white/62">© 2026 KidSchedule. Terms · Privacy</footer>
            </div>
        </>
    );
}
