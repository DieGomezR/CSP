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
    Paperclip,
    Scale,
    Shield,
    Sparkles,
    Wallet,
} from 'lucide-react';

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
    return (
        <header className="bg-[#2d4f7a] text-white">
            <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-8">
                <Link href={route('home')} className="text-[1.95rem] font-black tracking-tight text-white">
                    KidSchedule
                </Link>

                <div className="flex items-center gap-8 text-base font-bold">
                    {authUser ? (
                        <Link href={route('dashboard')} className="text-white/88 transition hover:text-white">
                            Open App
                        </Link>
                    ) : (
                        <Link href={route('login')} className="text-white/88 transition hover:text-white">
                            Log In
                        </Link>
                    )}
                    <Link href={route('home')} className="text-white/88 transition hover:text-white">
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
    icon: typeof Lock;
    title: string;
    body: string;
}) {
    return (
        <article className="rounded-[1.75rem] border border-[#d8f0ef] bg-[#fbfcfe] p-7 shadow-[0_24px_45px_-40px_rgba(15,23,42,0.28)]">
            <div className="inline-flex rounded-[1rem] bg-[#274d7c] p-4 text-white">
                <Icon className="size-6" />
            </div>
            <h3 className="mt-6 text-[1.95rem] font-black tracking-tight text-slate-900">{title}</h3>
            <p className="mt-3 text-[1.08rem] leading-8 text-slate-500">{body}</p>
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
                    <section className="bg-[#2d4f7a] pb-22 text-white">
                        <div className="mx-auto max-w-[1180px] px-8 pt-18 text-center">
                            <div className="mx-auto inline-flex rounded-full border border-white/18 bg-white/9 px-6 py-3 text-[0.92rem] font-black uppercase tracking-[0.14em] text-white/92">
                                For separated & divorced parents
                            </div>

                            <h1 className="mx-auto mt-8 max-w-[760px] text-[4.35rem] leading-[1.05] font-black tracking-[-0.04em] text-white">
                                Co-parenting made peaceful.
                                <br />
                                Court-ready when it&apos;s not.
                            </h1>

                            <p className="mx-auto mt-7 max-w-[720px] text-[1.2rem] leading-10 text-white/84">
                                Tamper-proof messaging. Documented everything. Built for your sanity and your lawyer&apos;s.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href={primaryHref}
                                    className="rounded-[1.15rem] bg-[linear-gradient(180deg,#72d7ca_0%,#61cec0_100%)] px-10 py-5 text-[1.08rem] font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.72)] transition hover:translate-y-[-1px]"
                                >
                                    Start 60-Day Free Trial
                                </a>
                                <a
                                    href="#coparent-features"
                                    className="rounded-[1.15rem] border border-white/38 bg-transparent px-10 py-5 text-[1.08rem] font-black text-white transition hover:bg-white/6"
                                >
                                    See All Features
                                </a>
                            </div>

                            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[1rem] font-bold text-white/88">
                                {heroBullets.map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <item.icon className="size-4 text-[#f4c063]" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="coparent-features" className="mx-auto max-w-[1280px] px-8 py-18">
                        <div className="text-center">
                            <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Built for high-conflict situations</h2>
                            <p className="mx-auto mt-3 max-w-[760px] text-[1.18rem] text-slate-500">
                                Every feature designed with documentation and evidence in mind
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {featureCards.map((feature) => (
                                <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} body={feature.body} />
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1180px] px-8 py-14">
                        <div className="grid gap-12 lg:grid-cols-[1fr_0.94fr] lg:items-start">
                            <div>
                                <h2 className="text-[3rem] font-black tracking-tight text-slate-900">Evidence that holds up</h2>
                                <div className="mt-8 grid gap-6">
                                    {evidenceItems.map((item, index) => (
                                        <div key={item.title} className="grid grid-cols-[auto_1fr] gap-4">
                                            <div
                                                className={`mt-1 flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                                                    index === 3 ? 'bg-[#3fba8d]' : 'bg-[#274d7c]'
                                                }`}
                                            >
                                                <item.icon className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[1.6rem] font-black tracking-tight text-slate-900">{item.title}</h3>
                                                <p className="mt-2 text-[1.08rem] leading-8 text-slate-500">{item.body}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.9rem] bg-[#2d4f7a] px-8 py-8 text-white shadow-[0_30px_65px_-44px_rgba(15,23,42,0.5)]">
                                <h3 className="text-center text-[2rem] font-black tracking-tight">How hash chains work</h3>
                                <div className="mt-8 rounded-[1.35rem] bg-[#233f63] px-6 py-6 font-mono text-[0.92rem] text-white/88">
                                    <p className="text-[#74d6ca]">Message #1</p>
                                    <p className="mt-2">hash: a7f3c...</p>
                                    <p className="mt-5 text-center text-white/65">v</p>
                                    <p className="mt-5 text-[#74d6ca]">Message #2</p>
                                    <p className="mt-2">prev_hash: a7f3c... hash: b82d...</p>
                                    <p className="mt-5 text-center text-white/65">v</p>
                                    <p className="mt-5 text-[#74d6ca]">Message #3</p>
                                    <p className="mt-2">prev_hash: b82d... hash: c9f1a...</p>
                                </div>
                                <p className="mt-8 text-center text-[1.05rem] leading-8 text-white/84">
                                    Change any message and the entire chain breaks.
                                    <br />
                                    Instantly detectable.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[980px] px-8 py-16 text-center">
                        <h2 className="text-[3rem] font-black tracking-tight text-slate-900">AI that keeps the peace</h2>
                        <p className="mx-auto mt-3 max-w-[720px] text-[1.14rem] text-slate-500">
                            Reduce conflict before it starts with intelligent communication tools
                        </p>

                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            {aiCards.map((card) => (
                                <article key={card.title} className="rounded-[1.55rem] border border-[#bfe4ff] bg-[#e8f4ff] px-7 py-6 text-left shadow-[0_20px_40px_-35px_rgba(15,23,42,0.25)]">
                                    <div className="flex items-center gap-3 text-slate-900">
                                        <card.icon className="size-5 text-[#d768cc]" />
                                        <p className="text-[1.35rem] font-black tracking-tight">{card.title}</p>
                                    </div>
                                    <p className="mt-3 text-[1.03rem] leading-8 text-slate-500">{card.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-4 bg-[#2d4f7a] py-18 text-white">
                        <div className="mx-auto max-w-[840px] px-8 text-center">
                            <h2 className="text-[3.2rem] font-black tracking-tight">Document everything. Stress less.</h2>
                            <p className="mx-auto mt-5 max-w-[760px] text-[1.18rem] leading-9 text-white/84">
                                Join thousands of co-parents who&apos;ve traded anxiety for clarity. Every message saved. Every exchange documented. Every expense tracked.
                            </p>
                            <a
                                href={primaryHref}
                                className="mt-10 inline-flex rounded-[1.1rem] bg-[linear-gradient(180deg,#72d7ca_0%,#61cec0_100%)] px-9 py-5 text-[1.08rem] font-black text-white shadow-[0_18px_40px_-20px_rgba(77,191,174,0.72)] transition hover:translate-y-[-1px]"
                            >
                                Start Your 60-Day Free Trial
                            </a>
                            <p className="mt-5 text-[0.98rem] text-white/58">Setup takes 2 minutes. Cancel anytime.</p>
                        </div>
                    </section>
                </main>

                <footer className="bg-[#131d2f] py-8 text-center text-sm text-white/62">© 2026 KidSchedule. Terms · Privacy</footer>
            </div>
        </>
    );
}
