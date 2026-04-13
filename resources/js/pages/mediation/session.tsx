import FamilyLayout from '@/components/family-layout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type SharedData } from '@/types';
import { type MediationSessionDetail, type MediationWorkspace } from '@/types/mediation';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Bot, Loader2, Sparkles, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

type Props = {
    workspace: MediationWorkspace;
    session: MediationSessionDetail;
};

function createClientRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function MediationSessionPage({ workspace, session }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [resolveOpen, setResolveOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const messageForm = useForm({
        message: '',
        client_request_id: '',
    });
    const resolveForm = useForm({ reason: '' });
    const cancelForm = useForm({ reason: '' });

    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(
            route('mediation.messages.store', { mediationSession: session.id, workspace: workspace.id }),
            {
                message: messageForm.data.message,
                client_request_id: createClientRequestId(),
            },
            {
                preserveScroll: true,
                onStart: () => {
                    setSending(true);
                    messageForm.clearErrors();
                },
                onSuccess: () => messageForm.reset('message', 'client_request_id'),
                onError: (errors) =>
                    messageForm.setError(
                        'message',
                        errors.message ?? errors.client_request_id ?? 'Unable to send the mediation message.',
                    ),
                onFinish: () => setSending(false),
            },
        );
    };

    const askAiForHelp = () => {
        router.post(
            route('mediation.help', { mediationSession: session.id, workspace: workspace.id }),
            { client_request_id: createClientRequestId() },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Mediation Session" />

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

                <section className="mx-auto max-w-[56rem]">
                    <div className="rounded-[1.6rem] border border-[#dcd8ff] bg-[linear-gradient(135deg,rgba(247,243,255,0.96),rgba(245,249,255,0.96))] px-5 py-5 shadow-sm">
                        <Link href={route('mediation.index', { workspace: workspace.id })} className="text-sm font-semibold text-[#8f8bff]">
                            ← Back to Mediation Center
                        </Link>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h1 className="text-[1.8rem] font-black text-slate-900">{session.subject}</h1>
                                <p className="mt-2 text-sm text-slate-500">Started {session.started_at_label}</p>
                            </div>
                            <span className="rounded-full bg-[#edf2ff] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5874f4]">
                                {session.status_label}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] border border-[#e7eef0] bg-white p-6 shadow-sm">
                        <div className="grid gap-5">
                            {session.messages.map((message) => {
                                const isUser = message.role === 'user';

                                return (
                                    <article
                                        key={message.id}
                                        className={`max-w-[85%] rounded-[1.35rem] border px-5 py-4 ${
                                            isUser
                                                ? 'ml-auto border-[#cfd4ff] bg-[linear-gradient(135deg,#7993ff_0%,#667cff_100%)] text-white'
                                                : 'border-[#d9d0ff] bg-[#f7f2ff] text-[#6d53bf]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
                                            {message.role === 'assistant' ? <Bot className="size-4" /> : null}
                                            <span>{message.author_name}</span>
                                        </div>
                                        <div className="mt-3 whitespace-pre-wrap text-[1rem] leading-7">{message.body}</div>

                                        {message.analysis.warnings.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {message.analysis.warnings.map((warning, index) => (
                                                    <span key={`${message.id}-${index}`} className="rounded-full bg-white/85 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#d06b55]">
                                                        {warning.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {message.tag && (
                                            <div className="mt-4">
                                                <span className="rounded-full bg-[#c8b5ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white">
                                                    {message.tag.replaceAll('_', ' ')}
                                                </span>
                                            </div>
                                        )}

                                        <p className={`mt-4 text-right text-xs font-semibold ${isUser ? 'text-white/80' : 'text-current/60'}`}>{message.created_at_label}</p>
                                    </article>
                                );
                            })}
                        </div>

                        {session.warnings.length > 0 && (
                            <div className="mt-6 rounded-[1.2rem] border border-[#ffe4da] bg-[#fff7f4] px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <TriangleAlert className="size-4 text-[#d06b55]" />
                                    <p className="text-sm font-black text-slate-900">Communication warnings in this session</p>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {session.warnings.map((warning, index) => (
                                        <span key={`${warning.message_id}-${index}`} className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#d06b55]">
                                            {warning.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {session.can_reply ? (
                        <div className="mt-6 rounded-[1.6rem] border border-[#e2e7ef] bg-white p-5 shadow-sm">
                            <form onSubmit={sendMessage} className="flex flex-col gap-3 md:flex-row">
                                <input
                                    value={messageForm.data.message}
                                    onChange={(event) => messageForm.setData('message', event.target.value)}
                                    placeholder="Share your thoughts... Remember: focus on the issue, not the person."
                                    className="min-h-[3.4rem] flex-1 rounded-[1rem] border border-[#d9dee8] px-4 text-sm outline-none transition focus:border-[#8f8bff]"
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="inline-flex min-h-[3.4rem] items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(90deg,#9a6cff_0%,#6f8cff_100%)] px-6 text-sm font-black text-white disabled:opacity-60"
                                >
                                    {sending ? <Loader2 className="size-4 animate-spin" /> : null}
                                    Send
                                </button>
                            </form>
                            {messageForm.errors.message && <p className="mt-2 text-sm font-semibold text-[#c35b5b]">{messageForm.errors.message}</p>}

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setResolveOpen(true)}
                                    className="inline-flex min-h-[2.9rem] items-center rounded-[1rem] border border-[#93ddb3] bg-[#ecfff3] px-4 text-sm font-black text-[#3ea66b]"
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    type="button"
                                    onClick={askAiForHelp}
                                    className="inline-flex min-h-[2.9rem] items-center gap-2 rounded-[1rem] border border-[#d9d1ff] bg-[#f4f1ff] px-4 text-sm font-black text-[#7255da]"
                                >
                                    <Sparkles className="size-4" />
                                    Ask AI for Help
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCancelOpen(true)}
                                    className="inline-flex min-h-[2.9rem] items-center rounded-[1rem] border border-[#ffc7b8] bg-[#fff2ee] px-4 text-sm font-black text-[#d06b55]"
                                >
                                    Need More Help
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-[1.5rem] border border-[#e1e7ec] bg-[#f9fbfc] px-5 py-5 text-center">
                            <p className="text-sm font-black text-slate-600">This session was {session.status_label.toLowerCase()}.</p>
                            {session.resolution_reason && <p className="mt-2 text-[1rem] text-slate-500">Summary: {session.resolution_reason}</p>}
                            {session.cancellation_reason && <p className="mt-2 text-[1rem] text-slate-500">Reason: {session.cancellation_reason}</p>}
                            <Link href={route('mediation.index', { workspace: workspace.id })} className="mt-4 inline-flex text-sm font-semibold text-[#55bfae]">
                                Return to Mediation Center
                            </Link>
                        </div>
                    )}
                </section>

                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                    <DialogContent className="max-w-[34rem] rounded-[1.6rem] border border-[#e2f0ee] bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-[1.5rem] font-black text-slate-900">Mark Session as Resolved</DialogTitle>
                            <DialogDescription className="mt-2 text-[1rem] leading-7 text-slate-500">
                                Summarize what was agreed. This reason is required and becomes part of the archived record.
                            </DialogDescription>
                        </DialogHeader>

                        <textarea
                            value={resolveForm.data.reason}
                            onChange={(event) => resolveForm.setData('reason', event.target.value)}
                            placeholder="e.g. We agreed to alternate weekends and communicate schedule changes 48 hours in advance."
                            className="mt-5 min-h-[9rem] w-full rounded-[1rem] border border-[#d9dee8] px-4 py-3 text-sm outline-none transition focus:border-[#67d2c3]"
                        />
                        {resolveForm.errors.reason && <p className="mt-2 text-sm font-semibold text-[#c35b5b]">{resolveForm.errors.reason}</p>}

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setResolveOpen(false)}
                                className="inline-flex min-h-[3rem] items-center rounded-[1rem] border border-[#d9e8e5] px-4 font-black text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={resolveForm.processing}
                                onClick={() =>
                                    resolveForm.post(route('mediation.resolve', { mediationSession: session.id, workspace: workspace.id }), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setResolveOpen(false);
                                            resolveForm.reset();
                                        },
                                    })
                                }
                                className="inline-flex min-h-[3rem] items-center gap-2 rounded-[1rem] bg-[#67d2c3] px-5 font-black text-white disabled:opacity-60"
                            >
                                {resolveForm.processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                Save & Close
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <DialogContent className="max-w-[34rem] rounded-[1.6rem] border border-[#e2f0ee] bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-[1.5rem] font-black text-slate-900">Request Additional Support</DialogTitle>
                            <DialogDescription className="mt-2 text-[1rem] leading-7 text-slate-500">
                                Explain why this discussion needs more help. This reason is required and becomes part of the archived record.
                            </DialogDescription>
                        </DialogHeader>

                        <textarea
                            value={cancelForm.data.reason}
                            onChange={(event) => cancelForm.setData('reason', event.target.value)}
                            placeholder="Describe why the conversation needs more support."
                            className="mt-5 min-h-[9rem] w-full rounded-[1rem] border border-[#d9dee8] px-4 py-3 text-sm outline-none transition focus:border-[#f3a087]"
                        />
                        {cancelForm.errors.reason && <p className="mt-2 text-sm font-semibold text-[#c35b5b]">{cancelForm.errors.reason}</p>}

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCancelOpen(false)}
                                className="inline-flex min-h-[3rem] items-center rounded-[1rem] border border-[#d9e8e5] px-4 font-black text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={cancelForm.processing}
                                onClick={() =>
                                    cancelForm.post(route('mediation.cancel', { mediationSession: session.id, workspace: workspace.id }), {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setCancelOpen(false);
                                            cancelForm.reset();
                                        },
                                    })
                                }
                                className="inline-flex min-h-[3rem] items-center gap-2 rounded-[1rem] bg-[#67d2c3] px-5 font-black text-white disabled:opacity-60"
                            >
                                {cancelForm.processing ? <Loader2 className="size-4 animate-spin" /> : null}
                                Escalate Session
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </FamilyLayout>
        </>
    );
}
