import { Head, Link } from '@inertiajs/react';

type Props = {
    sessions: Array<{
        id: number;
        workspace_name: string;
        subject: string;
        reason: string | null;
        created_by: string;
        closed_at: string | null;
        session_url: string;
    }>;
};

export default function AdminMediationEscalationsPage({ sessions }: Props) {
    return (
        <>
            <Head title="Mediation Escalations" />

            <main className="min-h-screen bg-[#f5f7fb] px-6 py-10 text-slate-900">
                <div className="mx-auto max-w-[72rem]">
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-[#8f8bff]">Internal Tooling</p>
                    <h1 className="mt-2 text-[2.5rem] font-black tracking-tight">Escalated Mediation Sessions</h1>
                    <p className="mt-3 max-w-[42rem] text-[1rem] leading-7 text-slate-500">
                        Sessions closed with “Need More Help” appear here so internal staff can review the stated reason and follow up if the business process requires it.
                    </p>

                    <section className="mt-8 rounded-[1.8rem] border border-[#e7edf4] bg-white p-6 shadow-sm">
                        {sessions.length === 0 ? (
                            <div className="rounded-[1.2rem] border border-dashed border-[#d8dfea] px-6 py-10 text-center text-slate-500">
                                No escalated mediation sessions yet.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {sessions.map((session) => (
                                    <article key={session.id} className="rounded-[1.2rem] border border-[#edf1f4] px-5 py-5">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">{session.workspace_name}</p>
                                                <h2 className="mt-2 text-[1.2rem] font-black text-slate-900">{session.subject}</h2>
                                                <p className="mt-2 text-sm text-slate-500">
                                                    Closed by {session.created_by} {session.closed_at ? `on ${session.closed_at}` : ''}
                                                </p>
                                                <p className="mt-4 text-[1rem] leading-7 text-slate-600">{session.reason ?? 'No reason recorded.'}</p>
                                            </div>

                                            <Link
                                                href={session.session_url}
                                                className="inline-flex min-h-[2.9rem] items-center rounded-[1rem] bg-[linear-gradient(90deg,#9a6cff_0%,#6f8cff_100%)] px-4 text-sm font-black text-white"
                                            >
                                                View Session
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
