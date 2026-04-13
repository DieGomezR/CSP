import FamilyLayout from '@/components/family-layout';
import { type MediationWorkspace } from '@/types/mediation';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type Props = {
    workspace: MediationWorkspace;
    defaults: {
        start: string;
        end: string;
    };
};

export default function MediationReportPage({ workspace, defaults }: Props) {
    const [start, setStart] = useState(defaults.start);
    const [end, setEnd] = useState(defaults.end);

    const printHref = `${route('mediation.report.print', { workspace: workspace.id })}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

    return (
        <>
            <Head title="Communication Climate Report" />

            <FamilyLayout activeTab="mediation" workspaceId={workspace.id}>
                <section className="mx-auto max-w-[42rem]">
                    <a href={route('mediation.index', { workspace: workspace.id })} className="text-sm font-semibold text-[#8f8bff]">
                        ← Back to Mediation Center
                    </a>

                    <div className="mt-4 text-center">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8f8bff]">Communication Climate Report</p>
                        <h1 className="mt-2 text-[2.4rem] font-black tracking-tight text-slate-900">Printable documentation</h1>
                        <p className="mt-3 text-[1rem] leading-7 text-slate-500">
                            Generate a print-friendly report summarizing mediation sessions, warnings, communication patterns, and AI intervention history.
                        </p>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-[#bfe0ff] bg-[#eef8ff] px-5 py-4 text-sm leading-7 text-[#4b76a6]">
                        This report focuses on factual platform records. It summarizes stored sessions, detected communication warnings, and mediation activity for the selected period.
                    </div>

                    <div className="mt-6 rounded-[1.6rem] border border-[#e4eeec] bg-white p-6 shadow-sm">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Report Period</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2">
                                <span className="text-sm font-black text-slate-700">Start Date</span>
                                <input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="min-h-[3.2rem] rounded-[1rem] border border-[#d9dee8] px-4 text-sm outline-none transition focus:border-[#8f8bff]" />
                            </label>
                            <label className="grid gap-2">
                                <span className="text-sm font-black text-slate-700">End Date</span>
                                <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} className="min-h-[3.2rem] rounded-[1rem] border border-[#d9dee8] px-4 text-sm outline-none transition focus:border-[#8f8bff]" />
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.6rem] border border-[#e4eeec] bg-white p-6 shadow-sm">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Report Contents</p>
                        <div className="mt-4 grid gap-4 text-sm text-slate-600">
                            <p>Executive summary with communication health and session totals</p>
                            <p>Warning history with severity and evidence markers</p>
                            <p>Mediation sessions and archived outcomes</p>
                            <p>Communication patterns derived from stored messages</p>
                            <p>AI intervention log for mediation support responses</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.4rem] border border-[#ffd68f] bg-[#fff7df] px-5 py-4 text-sm leading-7 text-[#a17512]">
                        Legal disclaimer: this report is generated automatically from platform records and rule-based communication analysis. It is not legal advice, not a forensic opinion, and should be reviewed by qualified counsel before any formal use.
                    </div>

                    <a
                        href={printHref}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex min-h-[3.4rem] w-full items-center justify-center rounded-[1rem] bg-[linear-gradient(90deg,#9a6cff_0%,#6f8cff_100%)] px-6 text-sm font-black text-white"
                    >
                        Generate Server PDF
                    </a>
                </section>
            </FamilyLayout>
        </>
    );
}
