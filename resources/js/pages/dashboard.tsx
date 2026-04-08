import FamilyLayout from '@/components/family-layout';
import { type SharedData } from '@/types';
import type { ActivityItem, WorkspacePayload, WorkspaceSummary } from '@/types/family';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Check, ClipboardList, Palette, Pencil, Settings2, Sparkles, Users, UserPlus } from 'lucide-react';

interface DashboardProps {
    workspace: WorkspacePayload;
    workspaces: WorkspaceSummary[];
    recentActivity: ActivityItem[];
}

const appearanceCards = [
    { title: 'Warm & Friendly', subtitle: 'Soft, rounded, inviting', active: true },
    { title: 'Modern', subtitle: 'Dense, compact, dashboard', active: false },
    { title: 'Minimal', subtitle: 'Flat, no cards, ultra-compact', active: false },
] as const;

function SectionCard({
    id,
    title,
    icon: Icon,
    action,
    children,
}: {
    id?: string;
    title: string;
    icon: typeof CalendarDays;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="rounded-[2rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] md:p-7"
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#f6fbfb] p-2.5 text-[#a38fc9]">
                        <Icon className="size-5" />
                    </div>
                    <h2 className="text-[2rem] font-black tracking-tight text-slate-900">{title}</h2>
                </div>
                {action}
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
}

function QuickActionCard({
    href,
    title,
    icon: Icon,
}: {
    href: string;
    title: string;
    icon: typeof CalendarDays;
}) {
    return (
        <a
            href={href}
            className="group flex min-h-40 flex-col items-center justify-center rounded-[1.7rem] border border-[#dceceb] bg-[#eaf8f7] px-6 py-8 text-center transition hover:border-[#8ed7ca] hover:bg-[#effaf8]"
        >
            <div className="rounded-full bg-white/80 p-3 text-[#9b8fd0] shadow-sm transition group-hover:scale-105">
                <Icon className="size-6" />
            </div>
            <p className="mt-5 text-[1.85rem] font-black tracking-tight text-slate-900">{title}</p>
        </a>
    );
}

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-3">
            <p className="text-base font-bold text-slate-400">{label}</p>
            <div className="rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 py-4 text-[1.15rem] font-semibold text-slate-800">
                {value}
            </div>
        </div>
    );
}

function AppearanceCard({ title, subtitle, active }: { title: string; subtitle: string; active: boolean }) {
    return (
        <div
            className={`rounded-[1.45rem] border px-6 py-5 transition ${
                active ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dcecec] bg-white'
            }`}
        >
            <div className="rounded-[1rem] border border-slate-200 bg-[#f9fbfc] p-3">
                <div className="space-y-2">
                    <div className="h-2 w-18 rounded-full bg-[#76d4c8]" />
                    <div className="h-2 w-26 rounded-full bg-slate-200" />
                </div>
            </div>
            <p className="mt-4 text-xl font-black tracking-tight text-slate-900">{title}</p>
            <p className="mt-2 text-base text-slate-400">{subtitle}</p>
        </div>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className={`grid grid-cols-[auto_1fr] gap-4 px-4 py-4 ${item.highlighted ? 'bg-[#eef8f7]' : 'bg-white'}`}>
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e9ff] text-[#5b8def]">
                <ClipboardList className="size-4" />
            </div>
            <div className="min-w-0 border-b border-[#e7f0ef] pb-4 last:border-b-0 last:pb-0">
                <p className="text-xl font-semibold text-slate-900">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-base text-slate-400">
                    <span>{item.detail}</span>
                    <span>{item.relative_time}</span>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ workspace, workspaces, recentActivity }: DashboardProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const workspaceTitle = workspace.name.replace(/family$/i, '').trim() || workspace.name;
    const custodyWizardHref = route('calendar.schedule-wizard', { workspace: workspace.id });
    const calendarHref = route('calendar', { workspace: workspace.id });
    const quickActions = [
        { title: 'View Calendar', href: calendarHref, icon: CalendarDays },
        {
            title: workspace.setup.custody_schedule_completed ? 'View Schedule' : 'Setup Schedule',
            href: workspace.setup.custody_schedule_completed ? calendarHref : custodyWizardHref,
            icon: Settings2,
        },
        { title: 'Add Child', href: '#children', icon: Sparkles },
        { title: 'Add Parent', href: '#family-members', icon: UserPlus },
        { title: 'Caregivers', href: '#family-members', icon: Users },
        { title: 'Log Transfer', href: '#recent-activity', icon: ClipboardList },
    ] as const;

    return (
        <>
            <Head title="Family Dashboard" />

            <FamilyLayout activeTab="dashboard" workspaceId={workspace.id}>
                <section className="flex flex-col gap-5 border-b border-[#dceceb] pb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-[2.8rem] font-black tracking-tight text-slate-900">{workspaceTitle}</h1>
                        <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#67d2c3] text-white shadow-sm"
                        >
                            <Pencil className="size-4" />
                        </button>
                    </div>

                    <div className="inline-flex rounded-full bg-white p-1.5 shadow-sm">
                        <button type="button" className="rounded-full bg-[#67d2c3] px-6 py-3 text-[1.05rem] font-black text-slate-900">
                            Dashboard
                        </button>
                        <Link href={calendarHref} className="rounded-full px-6 py-3 text-[1.05rem] font-black text-slate-400">
                            Calendar
                        </Link>
                    </div>
                </section>

                {flash.status && (
                    <div className="mt-6 rounded-[1.35rem] border border-[#caece6] bg-white px-5 py-4 text-[1.05rem] font-semibold text-[#3da999] shadow-sm">
                        {flash.status}
                    </div>
                )}

                <section className="mt-6 grid gap-4 md:grid-cols-2">
                    {quickActions.map((action) => (
                        <QuickActionCard key={action.title} href={action.href} title={action.title} icon={action.icon} />
                    ))}
                </section>

                <div className="mt-6 space-y-6">
                    <SectionCard
                        id="children"
                        title="Children"
                        icon={Sparkles}
                        action={
                            <button type="button" className="rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.1rem] font-black text-white shadow-sm">
                                + Add
                            </button>
                        }
                    >
                        {workspace.children.length > 0 ? (
                            <div className="space-y-4">
                                {workspace.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] bg-[#eef8f7] px-5 py-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-white"
                                                style={{ backgroundColor: child.color }}
                                            >
                                                {child.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.45rem] font-black tracking-tight text-slate-900">{child.name}</p>
                                                <p className="text-base text-slate-400">
                                                    {child.birthdate ? new Date(child.birthdate).toLocaleDateString() : 'Birthdate not added yet'}
                                                </p>
                                            </div>
                                        </div>
                                        <button type="button" className="rounded-2xl bg-[#67d2c3] px-5 py-3 text-base font-black text-white">
                                            Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.4rem] bg-[#fbfefe] px-5 py-12 text-center text-[1.2rem] text-slate-400">
                                No children added yet
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        id="family-members"
                        title="Family Members"
                        icon={Users}
                        action={
                            <button type="button" className="rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.1rem] font-black text-white shadow-sm">
                                + Add
                            </button>
                        }
                    >
                        <div className="space-y-4">
                            {workspace.members.map((member, index) => {
                                const isCurrentUser = member.user_id === auth.user.id;
                                const avatarPalette = ['#5B8DEF', '#FF7D7D', '#67D2C3', '#9B6BFF'];
                                const avatarColor = avatarPalette[index % avatarPalette.length];

                                return (
                                    <div
                                        key={member.id}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] bg-[#eef8f7] px-5 py-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-white"
                                                style={{ backgroundColor: avatarColor }}
                                            >
                                                {(member.name ?? '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.45rem] font-black tracking-tight text-slate-900">
                                                    {member.name ?? 'Unknown member'}{' '}
                                                    <span className="text-base font-semibold text-slate-400">{isCurrentUser ? 'You' : member.role}</span>
                                                </p>
                                                <p className="text-base text-slate-400">{member.email ?? 'No email on file'}</p>
                                            </div>
                                        </div>

                                        {!isCurrentUser && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    className="rounded-2xl bg-[#67d2c3] px-5 py-3 text-base font-black text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded-2xl bg-[#67d2c3] px-5 py-3 text-base font-black text-white"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    <SectionCard id="settings" title="Settings" icon={Settings2}>
                        <div className="grid gap-5 md:grid-cols-2">
                            <DetailField label="Timezone" value={workspace.timezone} />
                            <DetailField label="Transition Day" value="Sunday" />
                            <DetailField label="Transition Time" value="06:00 p. m." />
                            <DetailField label="Week Starts On" value="Sunday" />
                            <DetailField label="Workspaces" value={`${workspaces.length} active`} />
                        </div>

                        {!workspace.setup.custody_schedule_completed && (
                            <div className="mt-6">
                                <Link
                                    href={custodyWizardHref}
                                    className="inline-flex items-center rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.05rem] font-black text-white shadow-sm"
                                >
                                    Complete custody setup wizard
                                </Link>
                            </div>
                        )}

                        <div className="mt-6 space-y-4 text-[1.15rem] font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#67d2c3] text-white">
                                    <Check className="size-4" />
                                </span>
                                Email me when the schedule changes
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#67d2c3] text-white">
                                    <Check className="size-4" />
                                </span>
                                Remind me the day before custody changes
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard id="appearance" title="Appearance" icon={Palette}>
                        <div className="grid gap-4 md:grid-cols-3">
                            {appearanceCards.map((card) => (
                                <AppearanceCard key={card.title} title={card.title} subtitle={card.subtitle} active={card.active} />
                            ))}
                        </div>
                        <p className="mt-4 text-base text-slate-400">Auto-saves on click.</p>
                    </SectionCard>

                    <SectionCard id="recent-activity" title="Recent Activity" icon={ClipboardList}>
                        <div className="max-h-[27rem] overflow-y-auto rounded-[1.4rem] border border-[#edf3f2]">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item) => <ActivityRow key={item.id} item={item} />)
                            ) : (
                                <div className="px-5 py-10 text-center text-lg text-slate-400">No recent activity yet.</div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </FamilyLayout>
        </>
    );
}
