import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CheckCheck,
    ClipboardList,
    Clock3,
    Link2,
    Lock,
    Menu,
    Paperclip,
    Scale,
    Shield,
    Sparkles,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';

const heroBullets = [
    { icon: Link2, label: 'SHA256 Hash Chains' },
    { icon: ClipboardList, label: 'Court-Ready Exports' },
    { icon: Lock, label: 'Immutable Messages' },
] as const;

const featureCards = [
    {
        icon: Lock,
        title: 'Tamper-Proof Messaging',
        body: "Messages can't be edited or deleted. SHA256 hash chains prove nothing was changed. Read receipts included.",
    },
    {
        icon: ClipboardList,
        title: 'Court-Ready PDF Exports',
        body: 'Generate custody reports with overnight counts. Message exports with hash verification. Ready for your attorney.',
    },
    {
        icon: Shield,
        title: 'Audit Trail',
        body: 'Every action logged with timestamps, IP addresses, and cryptographic proof. Verify integrity anytime.',
    },
    {
        icon: CalendarDays,
        title: 'Custody Calendar',
        body: '7-7, 2-2-3, 2-2-5-5, and EOW patterns are built in with visual color coding for custody time.',
    },
    {
        icon: Scale,
        title: 'Change Requests',
        body: 'Formal workflow for schedule changes. Propose, counter-propose, accept, or decline with full history.',
    },
    {
        icon: Wallet,
        title: 'Expense Tracking',
        body: 'Log shared expenses with receipts for medical, school, and activities. Running balances show who owes what.',
    },
    {
        icon: Sparkles,
        title: 'SMS Relay',
        body: 'Text through a proxy number. Messages stay logged, searchable, and court-ready without direct contact.',
    },
    {
        icon: CheckCheck,
        title: 'Professional Access',
        body: 'Invite mediators, lawyers, or therapists with read-only access, time limits, and a full audit trail.',
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        body: 'Email, SMS, and push alerts for transitions, messages, and expenses, with quiet hours support.',
    },
] as const;

const evidenceItems = [
    {
        icon: Link2,
        title: 'Cryptographic hash chains',
        body: 'Each message links to the previous one. Any tampering breaks the chain and is immediately detectable.',
    },
    {
        icon: Clock3,
        title: 'Server-side timestamps',
        body: 'No backdating possible. Timestamps come from our servers, not devices.',
    },
    {
        icon: Paperclip,
        title: 'Attachment verification',
        body: "Receipts and documents are hashed. Prove the file hasn't been modified.",
    },
    {
        icon: Shield,
        title: 'Export verification',
        body: 'Every PDF export includes a verification page with hashes. Third parties can confirm authenticity.',
    },
] as const;

const aiCards = [
    {
        icon: Sparkles,
        title: 'Tone Analysis',
        body: 'Before you send, AI checks for hostile language, accusations, and passive-aggression. Get a neutral rewrite suggestion with one click.',
    },
    {
        icon: Scale,
        title: 'AI Mediation',
        body: 'When conversations escalate, AI jumps in with de-escalation prompts. Conflict warnings alert you before things go south.',
    },
] as const;

function Header({ authUser }: { authUser: SharedData['auth']['user'] | undefined }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-[#2d4f7a] text-white">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-8">
                <Link href={route('home')} className="text-2xl font-black tracking-tight text-white sm:text-[1.95rem]">
                    KidSchedule
                </Link>

                <div className="flex items-center gap-6 text-sm font-bold sm:text-base md:gap-8 md:text-base">
                    {authUser ? (
                        <Link href={route('dashboard')} className="hidden text-white/88 transition hover:text-white md:inline-block">
                            Open App
                        </Link>
                    ) : (
                        <Link href={route('login')} className="hidden text-white/88 transition hover:text-white md:inline-block">
                            Log In
                        </Link>
                    )}
                    <Link href={route('home')} className="hidden text-white/88 transition hover:text-white md:inline-block">
                        Back to Home
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-white/88 transition hover:bg-white/10 md:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-t border-white/15 bg-[#264a6f] px-4 py-4 shadow-lg md:hidden">
                    <nav className="space-y-3">
                        {authUser ? (
                            <Link
                                href={route('dashboard')}
                                className="block rounded-lg px-4 py-3 text-base font-bold text-white/88 transition hover:bg-white/10 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Open App
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="block rounded-lg px-4 py-3 text-base font-bold text-white/88 transition hover:bg-white/10 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log In
                            </Link>
                        )}
                        <Link
                            href={route('home')}
                            className="block rounded-lg px-4 py-3 text-base font-bold text-white/88 transition hover:bg-white/10 hover:text-white"
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
    icon: typeof Lock;
    title: string;
    body: string;
}) {
    return (
        <article className="rounded-[1.35rem] border border-[#d8f0ef] bg-[#fbfcfe] p-6 shadow-[0_24px_45px_-40px_rgba(15,23,42,0.28)] sm:rounded-[1.75rem] sm:p-8">
            <div className="inline-flex rounded-[0.85rem] bg-[#274d7c] p-3.5 text-white sm:rounded-[1rem] sm:p-4">
                <Icon className="size-5 sm:size-6" />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 sm:mt-6 sm:text-2xl md:text-[1.95rem]">{title}</h3>
            <p className="mt-2.5 text-base leading-7 text-slate-500 sm:mt-3 sm:text-[1.08rem] sm:leading-8">{body}</p>
        </article>
    );
}

export default function ForCoParents() {
    const { auth } = usePage<SharedData>().props;
    const primaryHref = auth.user ? route('dashboard') : route('register');

    return (
        <>
            <Head title="For Co-Parents" />

            <div className="min-h-screen bg-white text-slate-900">
                <Header authUser={auth.user} />

                <main>
                    <section className="bg-[#2d4f7a] pb-20 text-white sm:pb-22 md:pb-22">
                        <div className="mx-auto max-w-[1180px] px-4 pt-14 text-center sm:px-6 sm:pt-16 md:px-8 md:pt-18">
                            <div className="mx-auto inline-flex rounded-full border border-white/18 bg-white/9 px-4 py-2.5 text-[0.8rem] font-black uppercase tracking-[0.12em] text-white/92 sm:px-6 sm:py-3 sm:text-[0.92rem]">
                                For separated & divorced parents
                            </div>

                            <h1 className="mx-auto mt-5 max-w-[760px] text-4xl leading-[1.05] font-black tracking-[-0.04em] text-white sm:mt-7 sm:text-5xl md:mt-8 md:text-6xl lg:text-7xl">
                                Co-parenting made peaceful.
                                <br />
                                Court-ready when it&apos;s not.
                            </h1>

                            <p className="mx-auto mt-5 max-w-[720px] text-base leading-7 text-white/84 sm:mt-7 sm:text-[1.2rem] sm:leading-10">
                                Tamper-proof messaging. Documented everything. Built for your sanity and your lawyer&apos;s.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                                <a
                                    href={primaryHref}
                                    className="min-h-[44px] items-center justify-center rounded-[1.15rem] bg-[linear-gradient(180deg,#72d7ca_0%,#61cec0_100%)] px-7 py-4 text-center text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.72)] transition hover:translate-y-[-1px] sm:flex sm:px-10 sm:py-5 sm:text-[1.08rem]"
                                >
                                    Start 60-Day Free Trial
                                </a>
                                <a
                                    href="#coparent-features"
                                    className="min-h-[44px] items-center justify-center rounded-[1.15rem] border border-white/38 bg-transparent px-7 py-4 text-center text-base font-black text-white transition hover:bg-white/6 sm:flex sm:px-10 sm:py-5 sm:text-[1.08rem]"
                                >
                                    See All Features
                                </a>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm font-bold text-white/88 sm:mt-12 sm:gap-8 sm:text-[1rem]">
                                {heroBullets.map((item) => (
                                    <div key={item.label} className="flex items-center gap-2.5">
                                        <item.icon className="size-4 text-[#f4c063]" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="coparent-features" className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-18">
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">Built for high-conflict situations</h2>
                            <p className="mx-auto mt-3 max-w-[760px] text-base text-slate-500 sm:text-[1.18rem]">
                                Every feature designed with documentation and evidence in mind
                            </p>
                        </div>

                        <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-14">
                        <div className="grid gap-10 lg:grid-cols-[1fr_0.94fr] lg:items-start">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">Evidence that holds up</h2>
                                <div className="mt-6 grid gap-5 sm:mt-8">
                                    {evidenceItems.map((item, index) => (
                                        <div key={item.title} className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4">
                                            <div
                                                className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11 ${
                                                    index === 3 ? 'bg-[#3fba8d]' : 'bg-[#274d7c]'
                                                }`}
                                            >
                                                <item.icon className="size-4 sm:size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-[1.6rem]">{item.title}</h3>
                                                <p className="mt-1.5 text-base leading-7 text-slate-500 sm:mt-2 sm:text-[1.08rem] sm:leading-8">{item.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.5rem] bg-[#2d4f7a] px-5 py-6 text-white shadow-[0_30px_65px_-44px_rgba(15,23,42,0.5)] sm:rounded-[1.9rem] sm:px-8 sm:py-8">
                                <h3 className="text-center text-xl font-black tracking-tight sm:text-2xl md:text-[2rem]">How hash chains work</h3>
                                <div className="mt-6 rounded-[1.15rem] bg-[#233f63] px-4 py-5 font-mono text-[0.82rem] text-white/88 sm:mt-8 sm:rounded-[1.35rem] sm:px-6 sm:py-6 sm:text-[0.92rem]">
                                    <p className="text-[#74d6ca]">Message #1</p>
                                    <p className="mt-2">hash: a7f3c...</p>
                                    <p className="mt-5 text-center text-white/65">v</p>
                                    <p className="mt-5 text-[#74d6ca]">Message #2</p>
                                    <p className="mt-2">prev_hash: a7f3c... hash: b82d...</p>
                                    <p className="mt-5 text-center text-white/65">v</p>
                                    <p className="mt-5 text-[#74d6ca]">Message #3</p>
                                    <p className="mt-2">prev_hash: b82d... hash: c9f1a...</p>
                                </div>
                                <p className="mt-6 text-center text-sm leading-7 text-white/84 sm:mt-8 sm:text-[1.05rem] sm:leading-8">
                                    Change any message and the entire chain breaks.
                                    <br />
                                    Instantly detectable.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[980px] px-4 py-12 text-center sm:px-6 sm:py-16 md:px-8 md:py-16">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-[3rem]">AI that keeps the peace</h2>
                        <p className="mx-auto mt-3 max-w-[720px] text-base text-slate-500 sm:text-[1.14rem]">
                            Reduce conflict before it starts with intelligent communication tools
                        </p>

                        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
                            {aiCards.map((card) => (
                                <article key={card.title} className="rounded-[1.35rem] border border-[#bfe4ff] bg-[#e8f4ff] p-6 text-left shadow-[0_20px_40px_-35px_rgba(15,23,42,0.25)] sm:rounded-[1.55rem] sm:p-7">
                                    <div className="flex items-center gap-3 text-slate-900">
                                        <card.icon className="size-5 text-[#d768cc]" />
                                        <p className="text-lg font-black tracking-tight sm:text-xl md:text-[1.35rem]">{card.title}</p>
                                    </div>
                                    <p className="mt-2.5 text-base leading-7 text-slate-500 sm:mt-3 sm:text-[1.03rem] sm:leading-8">{card.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-4 bg-[#2d4f7a] py-14 text-white sm:py-16 md:py-18">
                        <div className="mx-auto max-w-[840px] px-4 text-center sm:px-6 md:px-8">
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-[3.2rem]">Document everything. Stress less.</h2>
                            <p className="mx-auto mt-4 max-w-[760px] text-base leading-8 text-white/84 sm:mt-5 sm:text-[1.18rem] sm:leading-9">
                                Join thousands of co-parents who&apos;ve traded anxiety for clarity. Every message saved. Every exchange documented. Every expense tracked.
                            </p>
                            <a
                                href={primaryHref}
                                className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-[1.1rem] bg-[linear-gradient(180deg,#72d7ca_0%,#61cec0_100%)] px-7 py-4 text-base font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.72)] transition hover:translate-y-[-1px] sm:mt-10 sm:px-9 sm:py-5 sm:text-[1.08rem]"
                            >
                                Start Your 60-Day Free Trial
                            </a>
                            <p className="mt-4 text-sm text-white/58 sm:mt-5 sm:text-[0.98rem]">Setup takes 2 minutes. Cancel anytime.</p>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#131d2f] py-6 text-center text-xs text-white/62 sm:py-8 sm:text-sm">© 2026 KidSchedule. Terms · Privacy</footer>
            </div>
        </>
    );
}
