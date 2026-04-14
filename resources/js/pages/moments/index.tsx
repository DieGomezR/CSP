import FamilyLayout from '@/components/family-layout';
import { useUserRealtimeSync } from '@/hooks/use-user-realtime-sync';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type SharedData } from '@/types';
import { type MomentItem, type MomentWorkspace } from '@/types/moments';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Camera, Loader2, Lock, Plus, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Props = {
    workspace: MomentWorkspace;
    moments: MomentItem[];
};

const visibilityIcons: Record<string, typeof Users> = {
    family: Users,
    private: Lock,
};

export default function MomentsIndexPage({ workspace, moments }: Props) {
    const { flash, auth } = usePage<SharedData>().props;
    const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
    const [momentToDelete, setMomentToDelete] = useState<MomentItem | null>(null);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const shareHref = route('moments.create', { workspace: workspace.id });

    const reactToMoment = (momentId: number, reaction: string) => {
        setPendingAction(`react-${momentId}-${reaction}`);

        router.post(
            route('moments.reactions.store', { moment: momentId }),
            { reaction },
            {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const deleteMoment = () => {
        if (momentToDelete === null) {
            return;
        }

        setPendingAction(`delete-${momentToDelete.id}`);

        router.delete(route('moments.destroy', { moment: momentToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => setMomentToDelete(null),
            onFinish: () => setPendingAction(null),
        });
    };

    useEffect(() => {
        if (selectedMoment !== null) {
            setSelectedMoment(moments.find((moment) => moment.id === selectedMoment.id) ?? null);
        }

        if (momentToDelete !== null) {
            setMomentToDelete(moments.find((moment) => moment.id === momentToDelete.id) ?? null);
        }
    }, [momentToDelete, moments, selectedMoment]);

    const handleRealtimeSync = useCallback(
        (payload: { domain: string; workspace_id: number; actor_user_id?: number | null }) => {
            if (payload.domain !== 'moments' || payload.workspace_id !== workspace.id || payload.actor_user_id === auth.user.id) {
                return;
            }

            router.reload({
                only: ['moments'],
                preserveScroll: true,
                preserveState: true,
            });
        },
        [auth.user.id, workspace.id],
    );

    useUserRealtimeSync(handleRealtimeSync);

    return (
        <>
            <Head title="Moments" />

            <FamilyLayout activeTab="moments" workspaceId={workspace.id}>
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

                <section className="mx-auto max-w-[76rem]">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#67d2c3]">Moments</p>
                            <h1 className="mt-3 text-[2.7rem] font-black tracking-tight text-slate-900 sm:text-[3.2rem]">Shared Memories</h1>
                            <p className="mt-3 max-w-[42rem] text-[1.05rem] leading-7 text-slate-500">
                                Photos shared with the family appear here. Private moments stay visible only to the person who uploaded them.
                            </p>
                        </div>

                        <Link
                            href={shareHref}
                            className="inline-flex min-h-[3.6rem] items-center gap-2 rounded-[1.35rem] bg-[#67d2c3] px-6 text-[1rem] font-black text-white shadow-sm transition hover:bg-[#5dc9ba]"
                        >
                            <Plus className="size-4" />
                            Share Moment
                        </Link>
                    </div>

                    {moments.length === 0 ? (
                        <div className="mt-8 rounded-[2.1rem] border-2 border-dashed border-[#78d6c8] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(239,251,249,0.98))] px-6 py-12 text-center shadow-[0_32px_90px_-70px_rgba(15,23,42,0.55)] sm:px-10 sm:py-16">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#67d2c3] shadow-[0_20px_50px_-30px_rgba(103,210,195,0.9)]">
                                <Camera className="size-9" />
                            </div>
                            <h2 className="mt-6 text-[2.4rem] font-black tracking-tight text-slate-900">No moments yet</h2>
                            <p className="mx-auto mt-4 max-w-[36rem] text-[1.05rem] leading-8 text-slate-500">
                                Capture and share precious memories with your co-parent and family members. Private uploads remain visible only to their creator.
                            </p>
                            <Link
                                href={shareHref}
                                className="mt-8 inline-flex min-h-[3.7rem] items-center rounded-[1.35rem] bg-[#67d2c3] px-7 text-[1rem] font-black text-white shadow-sm transition hover:bg-[#5dc9ba]"
                            >
                                Share Your First Moment
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {moments.map((moment) => {
                                const VisibilityIcon = visibilityIcons[moment.visibility] ?? Users;

                                return (
                                    <article
                                        key={moment.id}
                                        className="overflow-hidden rounded-[1.9rem] border border-[#dfeeed] bg-white shadow-[0_28px_70px_-56px_rgba(15,23,42,0.45)]"
                                    >
                                        <button type="button" onClick={() => setSelectedMoment(moment)} className="block w-full">
                                            <img
                                                src={moment.image_url}
                                                alt={moment.caption ?? `Moment shared by ${moment.author.name}`}
                                                className="h-[19rem] w-full object-cover transition duration-300 hover:scale-[1.02]"
                                            />
                                        </button>

                                        <div className="grid gap-4 p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dff6f1] text-sm font-black text-[#52b7aa]">
                                                        {moment.author.initials}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[1rem] font-black text-slate-900">{moment.author.name}</p>
                                                        <p className="text-sm text-slate-400">{moment.created_at_label ?? 'Just now'}</p>
                                                    </div>
                                                </div>

                                                {moment.can_delete && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMomentToDelete(moment)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#67d2c3] text-white transition hover:bg-[#5dc9ba]"
                                                        title="Delete moment"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef9f7] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4fae9f]">
                                                    <VisibilityIcon className="size-3.5" />
                                                    {moment.visibility_label}
                                                </span>

                                                {moment.taken_on_label && (
                                                    <span className="rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                                                        {moment.taken_on_label}
                                                    </span>
                                                )}
                                            </div>

                                            {moment.caption && <p className="text-[1rem] leading-7 text-slate-600">{moment.caption}</p>}

                                            <div className="flex flex-wrap gap-2 border-t border-[#ecf4f3] pt-4">
                                                {moment.reactions.map((reaction) => {
                                                    const reactionKey = `react-${moment.id}-${reaction.value}`;

                                                    return (
                                                        <button
                                                            key={reaction.value}
                                                            type="button"
                                                            disabled={pendingAction === reactionKey || !moment.can_react}
                                                            onClick={() => reactToMoment(moment.id, reaction.value)}
                                                            className={`inline-flex min-h-[2.8rem] items-center gap-2 rounded-[1rem] border px-4 text-sm font-black transition ${
                                                                reaction.active
                                                                    ? 'border-[#ffb5c4] bg-[#fff2f5] text-[#dc5d83]'
                                                                    : 'border-[#dbeae8] bg-white text-slate-600 hover:border-[#67d2c3] hover:text-slate-900'
                                                            } disabled:cursor-not-allowed disabled:opacity-60`}
                                                        >
                                                            {pendingAction === reactionKey ? <Loader2 className="size-4 animate-spin" /> : <span className="text-base">{reaction.emoji}</span>}
                                                            <span>{reaction.count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <Dialog open={selectedMoment !== null} onOpenChange={(open) => !open && setSelectedMoment(null)}>
                    <DialogContent className="max-w-[58rem] border-0 bg-transparent p-0 shadow-none" hideCloseButton>
                        {selectedMoment && (
                            <div className="relative overflow-hidden rounded-[2rem] bg-transparent">
                                <img
                                    src={selectedMoment.image_url}
                                    alt={selectedMoment.caption ?? `Moment shared by ${selectedMoment.author.name}`}
                                    className="max-h-[82vh] w-full rounded-[2rem] object-contain"
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={momentToDelete !== null} onOpenChange={(open) => !open && setMomentToDelete(null)}>
                    <DialogContent className="max-w-md rounded-[1.8rem] border border-[#e2f0ee] bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-[1.6rem] font-black text-slate-900">Delete this moment?</DialogTitle>
                            <DialogDescription className="mt-2 text-[1rem] leading-7 text-slate-500">
                                This removes the photo and its reactions from the family timeline. Private moments are deleted permanently.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setMomentToDelete(null)}
                                disabled={momentToDelete !== null && pendingAction === `delete-${momentToDelete.id}`}
                                className="inline-flex min-h-[3.2rem] items-center justify-center rounded-[1rem] border border-[#d7e7e4] px-5 font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteMoment}
                                disabled={momentToDelete !== null && pendingAction === `delete-${momentToDelete.id}`}
                                className="inline-flex min-h-[3.2rem] items-center justify-center gap-2 rounded-[1rem] bg-slate-900 px-5 font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                            >
                                {momentToDelete !== null && pendingAction === `delete-${momentToDelete.id}` ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Moment'
                                )}
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </FamilyLayout>
        </>
    );
}
