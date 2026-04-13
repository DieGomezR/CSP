import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, Lock, LogOut, Mail, Phone } from 'lucide-react';

type ActiveTab = 'dashboard' | 'calendar' | 'billing' | 'expenses' | 'moments' | 'mediation';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard', requiresAbility: null, requiresFeature: null },
    { key: 'calendar', label: 'Calendar', href: '/calendar', requiresAbility: null, requiresFeature: null },
    { key: 'billing', label: 'Billing', href: '/billing', requiresAbility: 'billing.manage', requiresFeature: null },
    { key: 'expenses', label: 'Expenses', href: '/expenses', requiresAbility: 'expenses.view', requiresFeature: 'expense_tracking' },
    { key: 'messages', label: 'Messages', href: '#', requiresAbility: null, requiresFeature: 'secure_messaging' },
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
    const { workspaceAccess } = usePage<SharedData>().props;
    const dashboardHref = workspaceId ? route('dashboard', { workspace: workspaceId }) : route('dashboard');
    const calendarHref = workspaceId ? route('calendar', { workspace: workspaceId }) : route('calendar');
    const billingHref = route('billing');
    const expensesHref = workspaceId ? route('expenses.index', { workspace: workspaceId }) : route('expenses.index');
    const momentsHref = workspaceId ? route('moments.index', { workspace: workspaceId }) : route('moments.index');
    const mediationHref = workspaceId ? route('mediation.index', { workspace: workspaceId }) : route('mediation.index');
    const canUseExpenses = (workspaceAccess?.abilities?.['expenses.view'] ?? false) && (workspaceAccess?.features?.['expense_tracking'] ?? false);
    const canUseMediation = workspaceAccess?.features?.['ai_tone_analysis'] ?? false;

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
                                      : item.key === 'moments'
                                        ? momentsHref
                                      : item.key === 'mediation'
                                        ? mediationHref
                                      : item.href;

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

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#67d2c3] text-white shadow-sm"
                        >
                            <Bell className="size-5" />
                        </button>
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
                                <Link href={calendarHref} className="transition hover:text-white">
                                    Calendar
                                </Link>
                                <Link href={billingHref} className="transition hover:text-white">
                                    Billing
                                </Link>
                                <span>Messages</span>
                                <Link href={momentsHref} className="transition hover:text-white">
                                    Moments
                                </Link>
                                <Link
                                    href={canUseMediation ? mediationHref : route('billing', { plan: 'complete', mode: 'family' })}
                                    className="transition hover:text-white"
                                >
                                    Mediation
                                </Link>
                                <Link
                                    href={canUseExpenses ? expensesHref : route('billing', { plan: 'plus', mode: 'family' })}
                                    className="transition hover:text-white"
                                >
                                    Expenses
                                </Link>
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
