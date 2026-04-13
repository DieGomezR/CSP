import FamilyLayout from '@/components/family-layout';
import { type SharedData } from '@/types';
import { type MediationSessionCard, type MediationWarning, type MediationWorkspace } from '@/types/mediation';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, FileText, Loader2, MessageSquareHeart, ShieldCheck } from 'lucide-react';

type Props = {
    workspace: MediationWorkspace;
    stats: {
        criticalHighWarnings: number;
        totalActiveWarnings: number;
        sessionsCount: number;
        resolutionRate: number;
    };
    activeWarnings: MediationWarning[];
    activeSession: MediationSessionCard | null;
    history: MediationSessionCard[];
    reportDefaults: {
        start: string;
        end: string;
    };
};

const statusStyles: Record<string, string> = {
    active: 'bg-[#edf2ff] text-[#5874f4]',
    resolved: 'bg-[#e7faf0] text-[#34a56c]',
    canceled: 'bg-[#fff1ee] text-[#d06b55]',
};

export default function MediationIndexPage({ workspace, stats, activeWarnings, activeSession, history }: Props) {
    const { flash } = usePage<SharedData>().props;
    const form = useForm({
        subject: '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(route('mediation.store', { workspace: workspace.id }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Mediation" />

            <FamilyLayout activeTab="mediation" workspaceId={workspace.id}>
                {flash.status && (
                    <div className="mb-5 rounded-[1.25rem] border border-[#8ad7bd] bg-[#e7faf2] px-4 py-4 text-sm font-semibold text-[#4aa17f] shadow-sm sm:text-[1.05rem]">
                        {flash.status}
                    </div>
                )}

                {flash.error && (
                    <div className="mb-5 rounded-[1.25rem] border border-[#f2b7b7] bg-[#fff3f3] px-4 py-4 text-sm font-semibold text-[#bf5d5d] shadow-sm sm:text-[1.05rem]">
                        {flash.error}
                    </div>
                )}

                <section className="mx-auto max-w-[72rem]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8f8bff]">Mediation Center</p>
                            <h1 className="mt-2 text-[2.5rem] font-black tracking-tight text-slate-900">AI-assisted conflict resolution</h1>
                            <p className="mt-3 max-w-[40rem] text-[1rem] leading-7 text-slate-500">
                                Keep difficult co-parenting conversations grounded, documented, and tied to practical next steps.
                            </p>
                        </div>

                        <Link
                            href={route('mediation.report', { workspace: workspace.id })}
                            className="inline-flex min-h-[3.2rem] items-center gap-2 rounded-[1rem] border border-[#e6e4ff] bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#cfc9ff]"
                        >
                            <FileText className="size-4 text-[#8f8bff]" />
                            Communication Report
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            { label: 'Critical / High warnings', value: stats.criticalHighWarnings, border: 'border-[#ff6678]' },
                            { label: 'Total active warnings', value: stats.totalActiveWarnings, border: 'border-[#ffb455]' },
                            { label: 'Mediation sessions', value: stats.sessionsCount, border: 'border-[#788cff]' },
                            { label: 'Resolution rate', value: `${stats.resolutionRate}%`, border: 'border-[#50c878]' },
                        ].map((card) => (
                            <article key={card.label} className={`rounded-[1.4rem] border ${card.border} bg-white px-5 py-5 shadow-sm`}>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                                <p className="mt-3 text-[2rem] font-black tracking-tight text-slate-900">{card.value}</p>
                            </article>
                        ))}
                    </div>

                    {activeSession ? (
                        <div className="mt-6 rounded-[1.2rem] border border-[#cdddff] bg-[#edf3ff] px-4 py-4 text-sm font-semibold text-[#5b72db]">
                            You have an active mediation session:{' '}
                            <Link href={activeSession.href} className="underline underline-offset-4">
                                {activeSession.subject}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-6 rounded-[1.6rem] border border-[#eadfff] bg-[linear-gradient(135deg,rgba(247,241,255,0.95),rgba(240,249,255,0.95))] p-5 shadow-sm">
                            <p className="text-sm font-black text-[#9567ff]">Start a mediated discussion</p>
                            <div className="mt-3 flex flex-col gap-3 md:flex-row">
                                <input
                                    value={form.data.subject}
                                    onChange={(event) => form.setData('subject', event.target.value)}
                                    placeholder="What would you like to discuss? e.g. schedule changes for summer"
                                    className="min-h-[3.4rem] flex-1 rounded-[1rem] border border-[#d7d8ef] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#8f8bff]"
                                />
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex min-h-[3.4rem] items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(90deg,#9a6cff_0%,#6f8cff_100%)] px-6 text-sm font-black text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                                >
                                    {form.processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                    Start Session
                                </button>
                            </div>
                            {form.errors.subject && <p className="mt-2 text-sm font-semibold text-[#c35b5b]">{form.errors.subject}</p>}
                        </form>
                    )}

                    <section className="mt-6 rounded-[1.6rem] border border-[#e4eeec] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-[#ffb455]" />
                            <h2 className="text-[1.3rem] font-black text-slate-900">Active Warnings</h2>
                        </div>

                        {activeWarnings.length === 0 ? (
                            <div className="mt-8 rounded-[1.4rem] border border-dashed border-[#dcebe8] px-6 py-10 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f6fbfa] text-[#9ab8b1]">
                                    <ShieldCheck className="size-8" />
                                </div>
                                <p className="mt-5 text-[1.8rem] font-black text-slate-900">All Clear</p>
                                <p className="mt-3 text-[1rem] text-slate-500">No active warnings. Communication is looking healthy.</p>
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3">
                                {activeWarnings.map((warning, index) => (
                                    <div key={`${warning.message_id}-${index}`} className="rounded-[1rem] border border-[#f4e4db] bg-[#fff8f5] px-4 py-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-black text-slate-900">{warning.label}</p>
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#d06b55]">
                                                {warning.severity}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-500">Detected evidence: “{warning.evidence}”</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="mt-6 rounded-[1.6rem] border border-[#e4eeec] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-2">
                            <MessageSquareHeart className="size-5 text-[#8f8bff]" />
                            <h2 className="text-[1.3rem] font-black text-slate-900">Mediation History</h2>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {history.map((session) => (
                                <article key={session.id} className="rounded-[1.2rem] border border-[#edf1f4] px-4 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[1rem] font-black text-slate-900">{session.subject}</p>
                                            <p className="mt-1 text-sm text-slate-400">
                                                {session.started_at_label} · {session.messages_count} messages
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${statusStyles[session.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {session.status_label}
                                            </span>
                                            <Link
                                                href={session.href}
                                                className="inline-flex min-h-[2.7rem] items-center rounded-[0.9rem] bg-[linear-gradient(90deg,#9a6cff_0%,#6f8cff_100%)] px-4 text-sm font-black text-white"
                                            >
                                                {session.cta_label}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>
            </FamilyLayout>
        </>
    );
}
