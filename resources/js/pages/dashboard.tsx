import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Cog,
    Link2,
    LoaderCircle,
    LogOut,
    Palette,
    Pencil,
    Repeat,
    Settings2,
    Sparkles,
    Users,
    UserPlus,
} from 'lucide-react';

type WorkspaceChild = {
    id: number;
    name: string;
    color: string;
    birthdate: string | null;
};

type WorkspaceMember = {
    id: number;
    user_id: number;
    name: string | null;
    email: string | null;
    role: string;
    joined_at: string | null;
};

type WorkspaceSummary = {
    id: number;
    name: string;
    type: string;
    timezone: string;
    children_count: number;
    members_count: number;
    calendar_events_count: number;
};

type CalendarOccurrence = {
    id: number;
    occurrence_key: string;
    title: string;
    description: string | null;
    location: string | null;
    date: string;
    starts_at: string;
    ends_at: string | null;
    display_time: string;
    color: string;
    is_recurring: boolean;
    recurrence_label: string | null;
    children: Array<{
        id: number;
        name: string;
        color: string;
    }>;
};

type CalendarDay = {
    date: string;
    label: number;
    is_current_month: boolean;
    is_today: boolean;
    occurrences: CalendarOccurrence[];
};

type CalendarPayload = {
    month: string;
    month_label: string;
    previous_month: string;
    next_month: string;
    weekday_labels: string[];
    weeks: CalendarDay[][];
    upcoming: CalendarOccurrence[];
    summary: {
        occurrences_count: number;
        series_count: number;
        children_count: number;
    };
    form_defaults: {
        starts_at: string;
        ends_at: string;
        color: string;
    };
};

type ActivityItem = {
    id: string;
    icon: 'workspace' | 'member' | 'child' | 'calendar';
    title: string;
    detail: string;
    relative_time: string;
    timestamp_iso: string;
    highlighted: boolean;
};

type WorkspacePayload = {
    id: number;
    name: string;
    type: string;
    timezone: string;
    children_count: number;
    members_count: number;
    events_count: number;
    children: WorkspaceChild[];
    members: WorkspaceMember[];
};

interface DashboardProps {
    workspace: WorkspacePayload;
    workspaces: WorkspaceSummary[];
    calendar: CalendarPayload;
    recentActivity: ActivityItem[];
}

interface CalendarEventForm {
    title: string;
    description: string;
    location: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    is_all_day: boolean;
    color: string;
    child_ids: number[];
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly';
    recurrence_interval: number;
    recurrence_until: string;
    recurrence_days_of_week: number[];
}

const topNavigation = [
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Calendar', href: '#calendar-view' },
    { label: 'Expenses', href: '#calendar-export' },
    { label: 'Messages', href: '#family-members' },
    { label: 'Moments', href: '#children' },
    { label: 'Mediation', href: '#settings' },
    { label: 'Requests', href: '#recent-activity' },
] as const;

const quickActions = [
    { title: 'View Calendar', href: '#calendar-view', icon: CalendarDays },
    { title: 'Setup Schedule', href: '#settings', icon: Cog },
    { title: 'Add Child', href: '#children', icon: Sparkles },
    { title: 'Add Parent', href: '#family-members', icon: UserPlus },
    { title: 'Caregivers', href: '#family-members', icon: Users },
    { title: 'Log Transfer', href: '#recent-activity', icon: ClipboardList },
] as const;

const recurrenceOptions = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'daily', label: 'Repeats daily' },
    { value: 'weekly', label: 'Repeats weekly' },
    { value: 'monthly', label: 'Repeats monthly' },
] as const;

const weekdayOptions = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

const appearanceCards = [
    {
        title: 'Warm & Friendly',
        subtitle: 'Soft, rounded, inviting',
        active: true,
    },
    {
        title: 'Modern',
        subtitle: 'Dense, compact, dashboard',
        active: false,
    },
    {
        title: 'Minimal',
        subtitle: 'Flat, no cards, ultra-compact',
        active: false,
    },
] as const;

const colorPalette = ['#4DBFAE', '#FF8A5B', '#5B8DEF', '#9B6BFF', '#F2C94C', '#EB5757'];

function applyAlpha(hex: string, alpha: string) {
    return `${hex}${alpha}`;
}

function replaceDateInDateTime(value: string, nextDate: string, fallbackTime: string) {
    if (!value) {
        return `${nextDate}T${fallbackTime}`;
    }

    const [, time = fallbackTime] = value.split('T');

    return `${nextDate}T${time}`;
}

function SectionCard({
    id,
    title,
    description,
    icon: Icon,
    action,
    children,
    className = '',
}: {
    id?: string;
    title: string;
    description?: string;
    icon: typeof CalendarDays;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            id={id}
            className={`rounded-[2rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] md:p-7 ${className}`}
        >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#f6fbfb] p-2.5 text-[#a38fc9]">
                            <Icon className="size-5" />
                        </div>
                        <h2 className="text-[2rem] font-black tracking-tight text-slate-900">{title}</h2>
                    </div>
                    {description && <p className="mt-4 text-lg leading-8 text-slate-400">{description}</p>}
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
            <div className="rounded-full bg-white/70 p-3 text-[#9b8fd0] shadow-sm transition group-hover:scale-105">
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
    const iconMap = {
        workspace: ClipboardList,
        member: Users,
        child: Sparkles,
        calendar: CalendarDays,
    } as const;

    const Icon = iconMap[item.icon];

    return (
        <div className={`grid grid-cols-[auto_1fr] gap-4 px-4 py-4 ${item.highlighted ? 'bg-[#eef8f7]' : 'bg-white'}`}>
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e9ff] text-[#5b8def]">
                <Icon className="size-4" />
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

export default function Dashboard({ workspace, workspaces, calendar, recentActivity }: DashboardProps) {
    const { auth, flash } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm<CalendarEventForm>({
        title: '',
        description: '',
        location: '',
        starts_at: calendar.form_defaults.starts_at,
        ends_at: calendar.form_defaults.ends_at,
        timezone: workspace.timezone,
        is_all_day: false,
        color: calendar.form_defaults.color,
        child_ids: [],
        recurrence_type: 'none',
        recurrence_interval: 1,
        recurrence_until: '',
        recurrence_days_of_week: [],
    });

    const childColors = Array.from(new Set([...workspace.children.map((child) => child.color), ...colorPalette]));

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('workspaces.events.store', workspace.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('title', 'description', 'location', 'child_ids', 'recurrence_until', 'recurrence_days_of_week');
                setData('starts_at', calendar.form_defaults.starts_at);
                setData('ends_at', calendar.form_defaults.ends_at);
                setData('timezone', workspace.timezone);
                setData('is_all_day', false);
                setData('color', calendar.form_defaults.color);
                setData('recurrence_type', 'none');
                setData('recurrence_interval', 1);
            },
        });
    };

    const toggleChild = (childId: number) => {
        setData(
            'child_ids',
            data.child_ids.includes(childId) ? data.child_ids.filter((id) => id !== childId) : [...data.child_ids, childId],
        );
    };

    const toggleWeekday = (day: number) => {
        setData(
            'recurrence_days_of_week',
            data.recurrence_days_of_week.includes(day)
                ? data.recurrence_days_of_week.filter((currentDay) => currentDay !== day)
                : [...data.recurrence_days_of_week, day].sort(),
        );
    };

    const handleRecurrenceTypeChange = (value: CalendarEventForm['recurrence_type']) => {
        setData('recurrence_type', value);

        if (value !== 'weekly') {
            setData('recurrence_days_of_week', []);
        }

        if (value === 'none') {
            setData('recurrence_interval', 1);
            setData('recurrence_until', '');
        }
    };

    const selectDay = (date: string) => {
        setData('starts_at', replaceDateInDateTime(data.starts_at, date, '09:00'));
        setData('ends_at', replaceDateInDateTime(data.ends_at, date, '10:00'));
    };

    const workspaceTitle = workspace.name.replace(/family$/i, '').trim() || workspace.name;
    const activeWorkspaceCount = workspaces.length;

    return (
        <>
            <Head title="Family Dashboard" />

            <div className="min-h-screen bg-[#eef8f6] text-slate-900">
                <header className="border-b border-[#dceceb] bg-white">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-5 px-6 py-7">
                        <Link
                            href={route('dashboard')}
                            className="text-[2.8rem] font-black tracking-tight text-transparent bg-[linear-gradient(90deg,#68d2c1_0%,#69a7ff_100%)] bg-clip-text"
                        >
                            KidSchedule
                        </Link>

                        <nav className="flex flex-1 flex-wrap items-center gap-6 text-[1.2rem] font-black text-[#55c2b5]">
                            {topNavigation.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={item.active ? 'text-[#46b8aa]' : 'text-[#55c2b5]/95 transition hover:text-[#46b8aa]'}
                                >
                                    {item.label}
                                </a>
                            ))}
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

                <main className="mx-auto max-w-5xl px-6 py-6">
                    <section className="flex flex-col gap-5 border-b border-[#dceceb] pb-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-[2.8rem] font-black tracking-tight text-slate-900">{workspaceTitle}</h1>
                            <button
                                type="button"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#67d2c3] text-white shadow-sm"
                            >
                                <Pencil className="size-4" />
                            </button>
                            <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-500 shadow-sm">
                                {activeWorkspaceCount} workspace{activeWorkspaceCount === 1 ? '' : 's'}
                            </div>
                        </div>

                        <div className="inline-flex rounded-full bg-white p-1.5 shadow-sm">
                            <button type="button" className="rounded-full bg-[#67d2c3] px-6 py-3 text-[1.05rem] font-black text-slate-900">
                                Calendar
                            </button>
                            <button type="button" className="rounded-full px-6 py-3 text-[1.05rem] font-black text-slate-400">
                                Setup Schedule
                            </button>
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
                                <button
                                    type="button"
                                    className="rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.1rem] font-black text-white shadow-sm"
                                >
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
                                            <div className="flex items-center gap-3">
                                                <button type="button" className="rounded-2xl bg-[#67d2c3] px-5 py-3 text-base font-black text-white">
                                                    Edit
                                                </button>
                                            </div>
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
                                <button
                                    type="button"
                                    className="rounded-2xl bg-[#67d2c3] px-6 py-3 text-[1.1rem] font-black text-white shadow-sm"
                                >
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

                                            <div className="flex items-center gap-3">
                                                {!isCurrentUser && (
                                                    <>
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
                                                    </>
                                                )}
                                            </div>
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
                                <DetailField label="Time Format" value="12 hour (6 PM)" />
                            </div>

                            <div className="mt-6 space-y-4 text-[1.15rem] font-semibold text-slate-900">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#67d2c3] text-white">✓</span>
                                    Email me when the schedule changes
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#67d2c3] text-white">✓</span>
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

                        <SectionCard
                            id="calendar-export"
                            title="Calendar Export Preferences"
                            icon={CalendarDays}
                            description="Control how events appear when synced to Google Calendar, Outlook, etc."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <DetailField label="Transition Event Duration" value="15 min" />
                                <DetailField label="Transitions Show As" value="Free" />
                                <DetailField label="Child Events Show As" value="Always Busy" />
                            </div>
                            <p className="mt-4 text-base text-slate-400">
                                School events always show as "free". Caregiver calendars always show as "free".
                            </p>
                        </SectionCard>

                        <SectionCard
                            id="sync-phone"
                            title="Sync to Phone"
                            icon={Link2}
                            description="Subscribe to your calendar in iPhone, Google Calendar, or Outlook. Updates sync automatically."
                        >
                            <button
                                type="button"
                                className="rounded-2xl bg-[#67d2c3] px-7 py-4 text-[1.1rem] font-black text-white shadow-sm"
                            >
                                + Create Sync Link
                            </button>
                        </SectionCard>

                        <SectionCard
                            id="calendar-view"
                            title="Calendar View"
                            icon={CalendarDays}
                            description="This is the real calendar engine underneath the setup screens. Recurring items already expand across the month."
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={route('dashboard', { workspace: workspace.id, month: calendar.previous_month })}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#d5e8e3] bg-white px-4 py-3 text-base font-black text-slate-600"
                                    >
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </Link>
                                    <div className="rounded-2xl bg-[#67d2c3] px-5 py-3 text-base font-black text-slate-900">
                                        {calendar.month_label}
                                    </div>
                                    <Link
                                        href={route('dashboard', { workspace: workspace.id, month: calendar.next_month })}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#d5e8e3] bg-white px-4 py-3 text-base font-black text-slate-600"
                                    >
                                        Next
                                        <ChevronRight className="size-4" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center">
                                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Events</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900">{calendar.summary.occurrences_count}</p>
                                    </div>
                                    <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center">
                                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Series</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900">{calendar.summary.series_count}</p>
                                    </div>
                                    <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center">
                                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Kids</p>
                                        <p className="mt-2 text-3xl font-black text-slate-900">{calendar.summary.children_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-7 gap-2 text-center">
                                {calendar.weekday_labels.map((label) => (
                                    <div key={label} className="py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                                        {label}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {calendar.weeks.map((week, weekIndex) => (
                                    <div key={`${calendar.month}-${weekIndex}`} className="grid grid-cols-7 gap-2">
                                        {week.map((day) => (
                                            <button
                                                key={day.date}
                                                type="button"
                                                onClick={() => selectDay(day.date)}
                                                className={`min-h-30 rounded-[1.3rem] border p-3 text-left transition ${
                                                    day.is_current_month
                                                        ? 'border-[#dceceb] bg-[#fbfefe] hover:border-[#91dacc] hover:bg-white'
                                                        : 'border-[#eef3f3] bg-[#f8fbfb] text-slate-300'
                                                } ${day.is_today ? 'ring-2 ring-[#9bdbd0] ring-offset-2 ring-offset-[#eef8f6]' : ''}`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-sm font-black ${day.is_today ? 'text-[#43b6a8]' : 'text-slate-700'}`}>{day.label}</span>
                                                    <span className="text-[0.7rem] font-semibold uppercase text-slate-300">Add</span>
                                                </div>

                                                <div className="mt-3 space-y-2">
                                                    {day.occurrences.slice(0, 2).map((occurrence) => (
                                                        <div
                                                            key={occurrence.occurrence_key}
                                                            className="rounded-[1rem] border px-2.5 py-2"
                                                            style={{
                                                                backgroundColor: applyAlpha(occurrence.color, '14'),
                                                                borderColor: applyAlpha(occurrence.color, '30'),
                                                            }}
                                                        >
                                                            <p className="truncate text-xs font-black text-slate-900">{occurrence.title}</p>
                                                            <p className="mt-1 truncate text-[0.7rem] font-medium text-slate-500">
                                                                {occurrence.display_time}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {day.occurrences.length > 2 && (
                                                        <p className="text-[0.7rem] font-semibold text-slate-400">+{day.occurrences.length - 2} more</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            id="quick-add-event"
                            title="Quick Add Event"
                            icon={Repeat}
                            description="Keep the schedule moving without leaving the dashboard. This still writes to the real recurring calendar backend."
                        >
                            <form className="space-y-5" onSubmit={submit}>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label htmlFor="title" className="text-base font-bold text-slate-400">
                                            Title
                                        </label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(event) => setData('title', event.target.value)}
                                            placeholder="Soccer practice"
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                        <InputError message={errors.title} />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="location" className="text-base font-bold text-slate-400">
                                            Location
                                        </label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(event) => setData('location', event.target.value)}
                                            placeholder="Community field"
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                        <InputError message={errors.location} />
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label htmlFor="starts_at" className="text-base font-bold text-slate-400">
                                            Starts
                                        </label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(event) => setData('starts_at', event.target.value)}
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                        <InputError message={errors.starts_at} />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="ends_at" className="text-base font-bold text-slate-400">
                                            Ends
                                        </label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            value={data.ends_at}
                                            onChange={(event) => setData('ends_at', event.target.value)}
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                        <InputError message={errors.ends_at} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="description" className="text-base font-bold text-slate-400">
                                        Notes
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        disabled={processing}
                                        placeholder="Pickup is by the south gate."
                                        className="min-h-28 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 py-4 text-[1.05rem] text-slate-900 outline-none focus:border-[#8fd6ca]"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="grid gap-2">
                                    <p className="text-base font-bold text-slate-400">Children</p>
                                    <div className="flex flex-wrap gap-2">
                                        {workspace.children.map((child) => {
                                            const isSelected = data.child_ids.includes(child.id);

                                            return (
                                                <button
                                                    key={child.id}
                                                    type="button"
                                                    onClick={() => toggleChild(child.id)}
                                                    disabled={processing}
                                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-black transition ${
                                                        isSelected
                                                            ? 'border-[#172033] bg-[#172033] text-white'
                                                            : 'border-[#dceceb] bg-white text-slate-700'
                                                    }`}
                                                >
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: child.color }} />
                                                    {child.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-[1fr_auto_auto]">
                                    <div className="grid gap-2">
                                        <label htmlFor="recurrence_type" className="text-base font-bold text-slate-400">
                                            Repeat pattern
                                        </label>
                                        <select
                                            id="recurrence_type"
                                            value={data.recurrence_type}
                                            onChange={(event) =>
                                                handleRecurrenceTypeChange(event.target.value as CalendarEventForm['recurrence_type'])
                                            }
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 text-[1.05rem] text-slate-900 outline-none"
                                        >
                                            {recurrenceOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="recurrence_interval" className="text-base font-bold text-slate-400">
                                            Interval
                                        </label>
                                        <Input
                                            id="recurrence_interval"
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={data.recurrence_interval}
                                            onChange={(event) => setData('recurrence_interval', Number(event.target.value) || 1)}
                                            disabled={processing}
                                            className="h-14 w-28 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="recurrence_until" className="text-base font-bold text-slate-400">
                                            Repeat until
                                        </label>
                                        <Input
                                            id="recurrence_until"
                                            type="date"
                                            value={data.recurrence_until}
                                            onChange={(event) => setData('recurrence_until', event.target.value)}
                                            disabled={processing}
                                            className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                        />
                                    </div>
                                </div>

                                {data.recurrence_type === 'weekly' && (
                                    <div className="grid gap-2">
                                        <p className="text-base font-bold text-slate-400">Days of week</p>
                                        <div className="flex flex-wrap gap-2">
                                            {weekdayOptions.map((day) => {
                                                const isActive = data.recurrence_days_of_week.includes(day.value);

                                                return (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() => toggleWeekday(day.value)}
                                                        disabled={processing}
                                                        className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                                                            isActive
                                                                ? 'bg-[#172033] text-white'
                                                                : 'border border-[#dceceb] bg-white text-slate-700'
                                                        }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <p className="text-base font-bold text-slate-400">Color</p>
                                    <div className="flex flex-wrap gap-3">
                                        {childColors.map((color) => {
                                            const isActive = data.color === color;

                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setData('color', color)}
                                                    className={`h-10 w-10 rounded-full border-4 transition ${
                                                        isActive ? 'scale-105 border-[#172033]' : 'border-white shadow-sm'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    aria-label={`Use ${color} as event color`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button type="submit" className="h-14 rounded-[1.2rem] bg-[#67d2c3] text-[1.05rem] font-black text-white" disabled={processing}>
                                    {processing && <LoaderCircle className="animate-spin" />}
                                    Save Event
                                </Button>
                            </form>
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
                </main>
            </div>
        </>
    );
}
