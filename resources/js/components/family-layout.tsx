import { Link } from '@inertiajs/react';
import { Bell, CalendarDays, LogOut, Mail, Phone } from 'lucide-react';

type ActiveTab = 'dashboard' | 'calendar';

const navigation = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'calendar', label: 'Calendar', href: '/calendar' },
    { key: 'expenses', label: 'Expenses', href: '#' },
    { key: 'messages', label: 'Messages', href: '#' },
    { key: 'moments', label: 'Moments', href: '#' },
    { key: 'mediation', label: 'Mediation', href: '#' },
    { key: 'requests', label: 'Requests', href: '#' },
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
    const dashboardHref = workspaceId ? route('dashboard', { workspace: workspaceId }) : route('dashboard');
    const calendarHref = workspaceId ? route('calendar', { workspace: workspaceId }) : route('calendar');

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

                    <nav className="flex flex-1 flex-wrap items-center gap-6 text-[1.2rem] font-black text-[#55c2b5]">
                        {navigation.map((item) => {
                            const isActive = item.key === activeTab;
                            const isEnabled = item.href !== '#';

                            if (!isEnabled) {
                                return (
                                    <span key={item.key} className="cursor-default text-[#55c2b5]/90">
                                        {item.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={item.key}
                                    href={
                                        item.key === 'dashboard'
                                            ? dashboardHref
                                            : item.key === 'calendar'
                                              ? calendarHref
                                              : item.href
                                    }
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
                                <span>Messages</span>
                                <span>Moments</span>
                                <span>Expenses</span>
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
