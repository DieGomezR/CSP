import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, Lock, LogOut, Mail, Phone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ActiveTab = 'dashboard' | 'calendar' | 'billing' | 'expenses' | 'messages' | 'moments' | 'mediation';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', requiresAbility: null, requiresFeature: null },
    { key: 'calendar', label: 'Calendar', href: '/calendar', requiresAbility: null, requiresFeature: null },
    { key: 'billing', label: 'Billing', href: '/billing', requiresAbility: 'billing.manage', requiresFeature: null },
    { key: 'expenses', label: 'Expenses', href: '/expenses', requiresAbility: 'expenses.view', requiresFeature: 'expense_tracking' },
    { key: 'messages', label: 'Messages', href: '/messages', requiresAbility: null, requiresFeature: 'secure_messaging' },
    { key: 'moments', label: 'Moments', href: '/moments', requiresAbility: null, requiresFeature: null },
    { key: 'mediation', label: 'Mediation', href: '/mediation', requiresAbility: null, requiresFeature: 'ai_tone_analysis' },
    { key: 'requests', label: 'Requests', href: '#', requiresAbility: null, requiresFeature: 'change_request_workflow' },
] as const;

export default function FamilyLayout({
    activeTab,
    workspaceId,
    children,
}: {
    activeTab: ActiveTab;
    workspaceId?: number;
    children: React.ReactNode;
}) {
    const { workspaceAccess, auth, notifications } = usePage<SharedData>().props;
    const dashboardHref = workspaceId ? route('dashboard', { workspace: workspaceId }) : route('dashboard');
    const calendarHref = workspaceId ? route('calendar', { workspace: workspaceId }) : route('calendar');
    const billingHref = route('billing');
    const expensesHref = workspaceId ? route('expenses.index', { workspace: workspaceId }) : route('expenses.index');
    const messagesHref = workspaceId ? route('messages.index', { workspace: workspaceId }) : route('messages.index');
    const momentsHref = workspaceId ? route('moments.index', { workspace: workspaceId }) : route('moments.index');
    const mediationHref = workspaceId ? route('mediation.index', { workspace: workspaceId }) : route('mediation.index');
    const canUseExpenses = (workspaceAccess?.abilities?.['expenses.view'] ?? false) && (workspaceAccess?.features?.['expense_tracking'] ?? false);
    const canUseMessages = workspaceAccess?.features?.['secure_messaging'] ?? false;
    const canUseMediation = workspaceAccess?.features?.['ai_tone_analysis'] ?? false;
    const canManageBilling = workspaceAccess?.abilities?.['billing.manage'] ?? false;
    const hasActiveSubscription = workspaceAccess?.subscription?.active ?? false;
    const shouldLockForBillingSetup = workspaceAccess !== null && !hasActiveSubscription;
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationState, setNotificationState] = useState(notifications ?? { unread_count: 0, items: [] });

    useEffect(() => {
        setNotificationState(notifications ?? { unread_count: 0, items: [] });
    }, [notifications]);

    useEffect(() => {
        const channelName = auth.user ? `App.Models.User.${auth.user.id}` : null;

        if (channelName === null || window.Echo === undefined) {
            return;
        }

        const channel = window.Echo.private(channelName);

        channel.notification((payload: Record<string, unknown>) => {
            setNotificationState((current) => {
                const nextItem = {
                    id: String(payload.id ?? `${Date.now()}`),
                    kind: String(payload.kind ?? 'general'),
                    title: String(payload.title ?? 'Notification'),
                    body: String(payload.body ?? ''),
                    href: typeof payload.href === 'string' ? payload.href : null,
                    workspace_id: typeof payload.workspace_id === 'number' ? payload.workspace_id : null,
                    read_at: null,
                    created_at: typeof payload.created_at === 'string' ? payload.created_at : new Date().toISOString(),
                    created_at_label: 'Just now',
                };

                const deduped = current.items.filter((item) => item.id !== nextItem.id);

                return {
                    unread_count: current.unread_count + 1,
                    items: [nextItem, ...deduped].slice(0, 8),
                };
            });
        });

        channel.listen('.workspace.ui.sync', (payload: { domain?: string; workspace_id?: number | null }) => {
            if ((payload.domain ?? '') === 'billing' && workspaceId !== undefined && payload.workspace_id === workspaceId) {
                router.reload({
                    only: ['workspaceAccess', 'notifications'],
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        });

        return () => {
            channel.stopListening('.workspace.ui.sync');
            window.Echo?.leave(channelName);
        };
    }, [auth.user, workspaceId]);

    const unreadCountLabel = useMemo(() => {
        if (notificationState.unread_count <= 0) {
            return null;
        }

        return notificationState.unread_count > 99 ? '99+' : String(notificationState.unread_count);
    }, [notificationState.unread_count]);

    return (
        <div className="min-h-screen bg-[#eef8f6] text-slate-900">
            <header className="border-b border-[#dceceb] bg-white">
                <div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-8 gap-y-5 px-6 py-7">
                    <Link
                        href={dashboardHref}
                        className="text-[2.8rem] font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text"
                    >
                        KidSchedule
                    </Link>

                    <nav className="flex flex-1 flex-wrap items-center gap-4 text-[1.2rem] font-black text-[#55c2b5] lg:gap-6">
                        {navigation.map((item) => {
                            const isActive = item.key === activeTab;
                            const actualHref =
                                item.key === 'dashboard'
                                    ? dashboardHref
                                    : item.key === 'calendar'
                                      ? calendarHref
                                      : item.key === 'billing'
                                        ? billingHref
                                      : item.key === 'expenses'
                                        ? expensesHref
                                      : item.key === 'messages'
                                        ? messagesHref
                                      : item.key === 'moments'
                                        ? momentsHref
                                      : item.key === 'mediation'
                                        ? mediationHref
                                      : item.href;

                            if (shouldLockForBillingSetup && item.key !== 'billing') {
                                if (canManageBilling) {
                                    return (
                                        <Link
                                            key={item.key}
                                            href={billingHref}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#ffb21a] bg-[#fff8e6] px-3 py-2 text-sm font-bold text-[#b07c1a] transition hover:bg-[#fff4d6]"
                                        >
                                            <Lock className="size-3.5" />
                                            {item.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <span
                                        key={item.key}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#d7d8ef] bg-[#f7f9fc] px-3 py-2 text-sm font-bold text-slate-400"
                                    >
                                        <Lock className="size-3.5" />
                                        {item.label}
                                    </span>
                                );
                            }

                            // Check if this item is enabled based on abilities and features
                            const hasAbility = item.requiresAbility ? (workspaceAccess?.abilities?.[item.requiresAbility] ?? false) : true;
                            const hasFeature = item.requiresFeature ? (workspaceAccess?.features?.[item.requiresFeature] ?? false) : true;
                            const isEnabled = hasAbility && hasFeature && actualHref !== '#';
                            const isComingSoon = hasAbility && hasFeature && actualHref === '#';

                            if (isComingSoon) {
                                return (
                                    <span
                                        key={item.key}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#d7d8ef] bg-[#f7f7fd] px-3 py-2 text-sm font-bold text-[#7c80a4]"
                                    >
                                        {item.label}
                                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8f8bff]">Soon</span>
                                    </span>
                                );
                            }

                            // If disabled, show with lock icon
                            if (!isEnabled) {
                                return (
                                    <Link
                                        key={item.key}
                                        href={route('billing', { plan: 'plus', mode: 'family' })}
                                        className="inline-flex items-center gap-1.5 cursor-default rounded-lg border border-dashed border-[#ffb21a] bg-[#fff8e6] px-3 py-2 text-sm font-bold text-[#b07c1a] transition hover:bg-[#fff4d6]"
                                    >
                                        <Lock className="size-3.5" />
                                        {item.label}
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={item.key}
                                    href={actualHref}
                                    className={isActive ? 'text-[#46b8aa]' : 'transition hover:text-[#46b8aa]'}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="relative flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setNotificationOpen((current) => !current)}
                            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#67d2c3] text-white shadow-sm"
                        >
                            <Bell className="size-5" />
                            {unreadCountLabel && (
                                <span className="absolute -right-1 -top-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[#ff8a8a] px-1.5 py-1 text-[10px] font-black text-white">
                                    {unreadCountLabel}
                                </span>
                            )}
                        </button>

                        {notificationOpen && (
                            <div className="absolute right-[5.5rem] top-[4.1rem] z-30 w-[24rem] overflow-hidden rounded-[1.5rem] border border-[#dfeeed] bg-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.45)]">
                                <div className="flex items-center justify-between gap-3 border-b border-[#edf4f3] px-5 py-4">
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#67d2c3]">Notifications</p>
                                        <p className="mt-1 text-sm text-slate-500">{notificationState.unread_count} unread</p>
                                    </div>

                                    <Link
                                        href={route('notifications.read-all')}
                                        method="post"
                                        as="button"
                                        onSuccess={() => {
                                            setNotificationState((current) => ({
                                                unread_count: 0,
                                                items: current.items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
                                            }));
                                        }}
                                        className="text-xs font-black uppercase tracking-[0.14em] text-[#67d2c3]"
                                    >
                                        Mark all read
                                    </Link>
                                </div>

                                <div className="max-h-[24rem] overflow-y-auto">
                                    {notificationState.items.length === 0 ? (
                                        <div className="px-5 py-8 text-center text-sm text-slate-500">No notifications yet.</div>
                                    ) : (
                                        notificationState.items.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={route('notifications.read', { notification: item.id })}
                                                method="post"
                                                data={{ redirect_to: item.href ?? route('dashboard') }}
                                                as="button"
                                                className={`block w-full border-b border-[#edf4f3] px-5 py-4 text-left transition hover:bg-[#f8fbfb] ${
                                                    item.read_at ? 'bg-white' : 'bg-[#f4fbf9]'
                                                }`}
                                                onSuccess={() => {
                                                    setNotificationState((current) => ({
                                                        unread_count: item.read_at ? current.unread_count : Math.max(current.unread_count - 1, 0),
                                                        items: current.items.map((entry) => (entry.id === item.id ? { ...entry, read_at: entry.read_at ?? new Date().toISOString() } : entry)),
                                                    }));
                                                    setNotificationOpen(false);
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-black text-slate-900">{item.title}</p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p>
                                                    </div>
                                                    {!item.read_at && <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#67d2c3]" />}
                                                </div>
                                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.created_at_label ?? 'Now'}</p>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.1rem] font-black text-white shadow-sm"
                        >
                            <LogOut className="size-4" />
                            Logout
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[110rem] px-6 py-6">{children}</main>

            <footer className="mt-12 bg-[#172033] text-white">
                <div className="mx-auto max-w-[110rem] px-6 py-14">
                    <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
                        <div>
                            <p className="text-[2.3rem] font-black tracking-tight">KidSchedule</p>
                            <p className="mt-5 text-lg text-white/70">Co-parenting made simple.</p>
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#67d2c3]">Product</p>
                            <div className="mt-4 grid gap-3 text-lg text-white/70">
                                {hasActiveSubscription ? (
                                    <Link href={calendarHref} className="transition hover:text-white">
                                        Calendar
                                    </Link>
                                ) : (
                                    <span className="text-white/40">Calendar</span>
                                )}
                                <Link href={billingHref} className="transition hover:text-white">
                                    Billing
                                </Link>
                                {hasActiveSubscription ? (
                                    <Link
                                        href={canUseMessages ? messagesHref : route('billing', { plan: 'plus', mode: 'family' })}
                                        className="transition hover:text-white"
                                    >
                                        Messages
                                    </Link>
                                ) : (
                                    <span className="text-white/40">Messages</span>
                                )}
                                {hasActiveSubscription ? (
                                    <Link href={momentsHref} className="transition hover:text-white">
                                        Moments
                                    </Link>
                                ) : (
                                    <span className="text-white/40">Moments</span>
                                )}
                                {hasActiveSubscription ? (
                                    <Link
                                        href={canUseMediation ? mediationHref : route('billing', { plan: 'complete', mode: 'family' })}
                                        className="transition hover:text-white"
                                    >
                                        Mediation
                                    </Link>
                                ) : (
                                    <span className="text-white/40">Mediation</span>
                                )}
                                {hasActiveSubscription ? (
                                    <Link
                                        href={canUseExpenses ? expensesHref : route('billing', { plan: 'plus', mode: 'family' })}
                                        className="transition hover:text-white"
                                    >
                                        Expenses
                                    </Link>
                                ) : (
                                    <span className="text-white/40">Expenses</span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#67d2c3]">Support</p>
                            <div className="mt-4 grid gap-3 text-lg text-white/70">
                                <span>Email Support</span>
                                <span>Send Feedback</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#67d2c3]">Legal</p>
                            <div className="mt-4 grid gap-3 text-lg text-white/70">
                                <span>Terms of Service</span>
                                <span>Privacy Policy</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#67d2c3]">Contact</p>
                            <div className="mt-4 grid gap-3 text-lg text-white/70">
                                <span className="inline-flex items-center gap-2">
                                    <Mail className="size-4 text-[#67d2c3]" />
                                    support@kidschedule.com
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CalendarDays className="size-4 text-[#67d2c3]" />
                                    kidschedule.com
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <button
                type="button"
                className="fixed bottom-5 left-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,#4c67ff_0%,#6a4df3_100%)] text-[#83f6d0] shadow-[0_24px_40px_-20px_rgba(70,79,216,0.8)]"
            >
                <Phone className="size-6" />
            </button>
        </div>
    );
}
