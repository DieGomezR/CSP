import FamilyLayout from '@/components/family-layout';
import InputError from '@/components/input-error';
import { useUserRealtimeSync } from '@/hooks/use-user-realtime-sync';
import { type SharedData } from '@/types';
import { type MessageParticipant, type MessageThreadDetail, type MessageThreadItem, type MessageWorkspace } from '@/types/messages';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Loader2, MessageSquareMore, Plus, Send, ShieldCheck, Smartphone } from 'lucide-react';
import { useCallback, useState } from 'react';

type Props = {
    workspace: MessageWorkspace;
    threads: MessageThreadItem[];
    selectedThread: MessageThreadDetail | null;
    participants: MessageParticipant[];
    composer: {
        workspace_id: number;
        thread_id: number | null;
    };
};

export default function MessagesIndexPage({ workspace, threads, selectedThread, participants, composer }: Props) {
    const { flash, auth } = usePage<SharedData>().props;
    const [showThreadForm, setShowThreadForm] = useState(false);

    const threadForm = useForm({
        workspace_id: workspace.id,
        subject: '',
    });

    const messageForm = useForm({
        workspace_id: composer.workspace_id,
        thread_id: composer.thread_id,
        message: '',
        client_request_id: '',
    });

    const createConversation = () => {
        if (threadForm.processing) {
            return;
        }

        threadForm.post(route('messages.threads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                threadForm.reset('subject');
                setShowThreadForm(false);
            },
        });
    };

    const submitMessage = () => {
        if (messageForm.processing || messageForm.data.thread_id === null) {
            return;
        }

        messageForm.transform((data) => ({
            ...data,
            client_request_id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        }));

        messageForm.post(route('messages.store'), {
            preserveScroll: true,
            onSuccess: () => messageForm.reset('message', 'client_request_id'),
        });
    };

    const handleRealtimeSync = useCallback(
        (payload: { domain: string; workspace_id: number; actor_user_id?: number | null }) => {
            if (payload.domain !== 'messages' || payload.workspace_id !== workspace.id || payload.actor_user_id === auth.user.id) {
                return;
            }

            router.reload({
                only: ['threads', 'selectedThread', 'composer'],
                preserveScroll: true,
                preserveState: true,
            });
        },
        [auth.user.id, workspace.id],
    );

    useUserRealtimeSync(handleRealtimeSync);

    return (
        <>
            <Head title="Messages" />

            <FamilyLayout activeTab="messages" workspaceId={workspace.id}>
                {flash.status && (
                    <div className="mb-5 rounded-[1.35rem] border border-[#8ad7bd] bg-[#e7faf2] px-4 py-4 text-sm font-semibold text-[#4aa17f] shadow-sm sm:text-[1.05rem]">
                        {flash.status}
                    </div>
                )}

                {flash.error && (
                    <div className="mb-5 rounded-[1.35rem] border border-[#f2b7b7] bg-[#fff3f3] px-4 py-4 text-sm font-semibold text-[#bf5d5d] shadow-sm sm:text-[1.05rem]">
                        {flash.error}
                    </div>
                )}

                <section className="mx-auto grid max-w-[88rem] gap-6 xl:grid-cols-[0.8fr_1.45fr_0.8fr]">
                    <aside className="rounded-[2rem] border border-[#dfeeed] bg-white p-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.45)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#67d2c3]">Conversations</p>
                                <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-900">Threads</h1>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowThreadForm((current) => !current)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#67d2c3] text-white transition hover:bg-[#58c5b6]"
                            >
                                <Plus className="size-4" />
                            </button>
                        </div>

                        {showThreadForm && (
                            <div className="mt-5 rounded-[1.4rem] border border-[#e2efed] bg-[#fbfefd] p-4">
                                <input
                                    value={threadForm.data.subject}
                                    onChange={(event) => threadForm.setData('subject', event.target.value)}
                                    placeholder="Topic, handoff, school, expenses..."
                                    className="h-12 w-full rounded-[1rem] border border-[#cfe9e4] bg-white px-4 text-[1rem] text-slate-700 outline-none transition focus:border-[#67d2c3] focus:ring-2 focus:ring-[#67d2c3]/20"
                                />
                                <InputError className="mt-2" message={threadForm.errors.subject} />

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={createConversation}
                                        disabled={threadForm.processing || threadForm.data.subject.trim() === ''}
                                        className="inline-flex min-h-[2.9rem] items-center gap-2 rounded-[0.95rem] bg-slate-900 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        {threadForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                        {threadForm.processing ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 grid gap-3">
                            {threads.length === 0 ? (
                                <div className="rounded-[1.4rem] border-2 border-dashed border-[#78d6c8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(239,251,249,0.98))] px-5 py-8 text-center">
                                    <MessageSquareMore className="mx-auto size-8 text-[#67d2c3]" />
                                    <p className="mt-3 font-black text-slate-900">No conversations yet</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">Open the first conversation to keep family coordination organized by topic.</p>
                                </div>
                            ) : (
                                threads.map((thread) => {
                                    const isSelected = selectedThread?.id === thread.id;

                                    return (
                                        <Link
                                            key={thread.id}
                                            href={thread.href}
                                            className={`rounded-[1.35rem] border px-4 py-4 transition ${
                                                isSelected
                                                    ? 'border-[#67d2c3] bg-[#eef9f7] shadow-sm'
                                                    : 'border-[#e2efed] bg-[#fbfefd] hover:border-[#c6e7e1]'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-black text-slate-900">{thread.subject}</p>
                                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{thread.preview}</p>
                                                </div>

                                                {thread.unread_count > 0 && (
                                                    <span className="inline-flex min-w-[1.65rem] items-center justify-center rounded-full bg-[#ff8a8a] px-2 py-1 text-xs font-black text-white">
                                                        {thread.unread_count}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                                <span>{thread.messages_count} messages</span>
                                                <span>{thread.last_message_at_label ?? 'New'}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    <div className="rounded-[2rem] border border-[#dfeeed] bg-white p-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.45)]">
                        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#edf4f3] pb-5">
                            <div>
                                <p className="text-sm font-black uppercase tracking-[0.24em] text-[#67d2c3]">Messages</p>
                                <h2 className="mt-3 text-[2.4rem] font-black tracking-tight text-slate-900 sm:text-[2.8rem]">
                                    {selectedThread?.subject ?? 'Select a conversation'}
                                </h2>
                                <p className="mt-3 max-w-[38rem] text-[1.02rem] leading-7 text-slate-500">
                                    Secure in-app messaging for family coordination. Messages are stored in KidSchedule and SMS delivery is not active yet.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef9f7] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#4fae9f]">
                                <ShieldCheck className="size-4" />
                                Secure Messaging
                            </div>
                        </div>

                        {selectedThread === null ? (
                            <div className="mt-6 rounded-[1.7rem] border-2 border-dashed border-[#78d6c8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(239,251,249,0.98))] px-6 py-12 text-center">
                                <MessageSquareMore className="mx-auto size-10 text-[#67d2c3]" />
                                <h3 className="mt-6 text-[2rem] font-black tracking-tight text-slate-900">Choose a thread</h3>
                                <p className="mx-auto mt-4 max-w-[32rem] text-[1rem] leading-8 text-slate-500">
                                    This version separates messages by conversation, so different topics can stay organized instead of living in one long thread.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mt-6 max-h-[38rem] space-y-4 overflow-y-auto pr-2">
                                    {selectedThread.messages.length === 0 ? (
                                        <div className="rounded-[1.5rem] bg-[#f8fbfb] px-6 py-8 text-center text-slate-500">
                                            No messages yet in this conversation.
                                        </div>
                                    ) : (
                                        selectedThread.messages.map((message) => (
                                            <article key={message.id} className={`flex ${message.is_viewer ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[44rem] rounded-[1.7rem] px-5 py-4 shadow-sm ${
                                                        message.is_viewer
                                                            ? 'bg-[linear-gradient(135deg,#67d2c3_0%,#5f8fff_100%)] text-white'
                                                            : 'border border-[#e2efed] bg-[#f8fbfb] text-slate-700'
                                                    }`}
                                                >
                                                    <div className={`flex items-center gap-3 text-sm font-black ${message.is_viewer ? 'text-white/90' : 'text-slate-500'}`}>
                                                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${message.is_viewer ? 'bg-white/20' : 'bg-white text-[#52b7aa]'}`}>
                                                            {message.author.initials}
                                                        </span>
                                                        <span>{message.author.name}</span>
                                                        <span className={message.is_viewer ? 'text-white/70' : 'text-slate-400'}>{message.author.role}</span>
                                                    </div>

                                                    <div className="mt-3 whitespace-pre-wrap text-[1rem] leading-7">{message.body}</div>

                                                    <p className={`mt-4 text-right text-xs font-semibold ${message.is_viewer ? 'text-white/75' : 'text-slate-400'}`}>
                                                        {message.created_at_label ?? message.created_at_relative ?? 'Just now'}
                                                    </p>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>

                                <div className="mt-6 rounded-[1.5rem] border border-[#e2efed] bg-[#fbfefd] p-4">
                                    <textarea
                                        value={messageForm.data.message}
                                        onChange={(event) => messageForm.setData('message', event.target.value)}
                                        rows={4}
                                        placeholder="Write a message for this conversation..."
                                        className="w-full resize-none rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 py-4 text-[1rem] text-slate-700 outline-none transition focus:border-[#67d2c3] focus:ring-2 focus:ring-[#67d2c3]/20"
                                    />
                                    <InputError className="mt-2" message={messageForm.errors.message} />

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm text-slate-500">
                                            Stored in-app. SMS notifications are not enabled yet.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={submitMessage}
                                            disabled={messageForm.processing || messageForm.data.message.trim() === '' || messageForm.data.thread_id === null}
                                            className="inline-flex min-h-[3.2rem] items-center gap-2 rounded-[1rem] bg-[#67d2c3] px-5 font-black text-white transition hover:bg-[#58c5b6] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {messageForm.processing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                            {messageForm.processing ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <aside className="grid gap-6 self-start">
                        <section className="rounded-[2rem] border border-[#dfeeed] bg-white p-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.45)]">
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#67d2c3]">Participants</p>
                            <div className="mt-5 grid gap-3">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center gap-3 rounded-[1.2rem] bg-[#f7fbfb] px-4 py-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dff6f1] text-sm font-black text-[#52b7aa]">
                                            {participant.initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-black text-slate-900">{participant.name}</p>
                                            <p className="text-sm text-slate-400">{participant.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-[#dfeeed] bg-white p-6 shadow-[0_28px_70px_-56px_rgba(15,23,42,0.45)]">
                            <div className="flex items-center gap-3 text-[#dd8f43]">
                                <Smartphone className="size-5" />
                                <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">Phone alerts</p>
                            </div>
                            <p className="mt-4 text-[0.98rem] leading-7 text-slate-500">
                                Phone numbers can still be collected later, but this version keeps family messaging fully inside KidSchedule. No SMS is sent from this module yet.
                            </p>
                        </section>
                    </aside>
                </section>
            </FamilyLayout>
        </>
    );
}
