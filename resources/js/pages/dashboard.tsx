import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, LoaderCircle, Repeat, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Family Calendar',
        href: '/dashboard',
    },
];

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

type WorkspaceChild = {
    id: number;
    name: string;
    color: string;
    birthdate: string | null;
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
    occurrences: CalendarOccurrence[];
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

type WorkspacePayload = {
    id: number;
    name: string;
    type: string;
    timezone: string;
    children_count: number;
    members_count: number;
    events_count: number;
    children: WorkspaceChild[];
};

interface DashboardProps {
    workspace: WorkspacePayload;
    workspaces: WorkspaceSummary[];
    calendar: CalendarPayload;
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

export default function Dashboard({ workspace, workspaces, calendar }: DashboardProps) {
    const { flash } = usePage<SharedData>().props;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Family Calendar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(140deg,#effcf7_0%,#edf7ff_54%,#fff5ea_100%)] p-6 shadow-[0_35px_80px_-45px_rgba(34,71,110,0.45)] md:p-8">
                    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <p className="text-xs font-extrabold tracking-[0.24em] text-teal-700 uppercase">Family workspace</p>
                            <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-black tracking-tight text-slate-950 md:text-5xl">
                                {workspace.name} keeps school, sports, and everyone&apos;s stuff in one place.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                                This is now the real household calendar: children, recurring events, and a monthly planning view that already works
                                like a product instead of a starter kit.
                            </p>

                            {flash.status && (
                                <div className="mt-5 inline-flex rounded-full border border-teal-200 bg-white/85 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm">
                                    {flash.status}
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                {workspace.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                                    >
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: child.color }} />
                                        {child.name}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link
                                    href={route('dashboard', { workspace: workspace.id, month: calendar.previous_month })}
                                    className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
                                >
                                    <ChevronLeft className="size-4" />
                                    Previous month
                                </Link>
                                <div className="inline-flex h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm">
                                    {calendar.month_label}
                                </div>
                                <Link
                                    href={route('dashboard', { workspace: workspace.id, month: calendar.next_month })}
                                    className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
                                >
                                    Next month
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">This month</p>
                                <p className="mt-3 text-4xl font-black text-slate-950">{calendar.summary.occurrences_count}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Scheduled occurrences already visible in the month grid.</p>
                            </article>
                            <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">Recurring series</p>
                                <p className="mt-3 text-4xl font-black text-slate-950">{calendar.summary.series_count}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Templates-like recurring schedules powering the base calendar.</p>
                            </article>
                            <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">Children in plan</p>
                                <p className="mt-3 text-4xl font-black text-slate-950">{workspace.children_count}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Color-coded profiles that keep the calendar readable.</p>
                            </article>
                            <article className="rounded-[1.5rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">Members</p>
                                <p className="mt-3 text-4xl font-black text-slate-950">{workspace.members_count}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Adults and caregivers that will eventually share this plan.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
                    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_80px_-50px_rgba(27,53,87,0.55)] md:p-6">
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">Monthly view</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Family calendar</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                    Click any day cell to prefill the event form. Recurring items are expanded server-side so the month stays
                                    trustworthy.
                                </p>
                            </div>

                            {workspaces.length > 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {workspaces.map((item) => {
                                        const isActive = item.id === workspace.id;

                                        return (
                                            <Link
                                                key={item.id}
                                                href={route('dashboard', { workspace: item.id, month: calendar.month })}
                                                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                    isActive
                                                        ? 'bg-slate-950 text-white shadow-sm'
                                                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-200 hover:text-teal-800'
                                                }`}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-7 gap-2 text-center">
                            {calendar.weekday_labels.map((label) => (
                                <div key={label} className="px-1 py-2 text-xs font-extrabold tracking-[0.18em] text-slate-400 uppercase">
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 space-y-2">
                            {calendar.weeks.map((week, weekIndex) => (
                                <div key={`${calendar.month}-${weekIndex}`} className="grid grid-cols-7 gap-2">
                                    {week.map((day) => (
                                        <button
                                            key={day.date}
                                            type="button"
                                            onClick={() => selectDay(day.date)}
                                            className={`min-h-36 rounded-[1.35rem] border p-3 text-left transition md:min-h-40 ${
                                                day.is_current_month
                                                    ? 'border-slate-200 bg-slate-50/60 hover:border-teal-200 hover:bg-white'
                                                    : 'border-slate-100 bg-slate-50/30 text-slate-400'
                                            } ${day.is_today ? 'ring-2 ring-teal-200 ring-offset-2 ring-offset-white' : ''}`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
                                                        day.is_today ? 'bg-slate-950 text-white' : 'text-slate-700'
                                                    }`}
                                                >
                                                    {day.label}
                                                </span>
                                                <span className="text-[0.7rem] font-semibold text-slate-400 uppercase">Add</span>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                {day.occurrences.slice(0, 3).map((occurrence) => (
                                                    <div
                                                        key={occurrence.occurrence_key}
                                                        className="rounded-[1rem] border px-2.5 py-2 shadow-sm"
                                                        style={{
                                                            backgroundColor: applyAlpha(occurrence.color, '14'),
                                                            borderColor: applyAlpha(occurrence.color, '30'),
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span
                                                                className="mt-1 h-2.5 w-2.5 rounded-full"
                                                                style={{ backgroundColor: occurrence.color }}
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-xs font-extrabold text-slate-900">{occurrence.title}</p>
                                                                <p className="mt-1 truncate text-[0.7rem] font-medium text-slate-600">
                                                                    {occurrence.display_time}
                                                                </p>
                                                                {occurrence.children.length > 0 && (
                                                                    <p className="mt-1 truncate text-[0.7rem] text-slate-500">
                                                                        {occurrence.children.map((child) => child.name).join(', ')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {day.occurrences.length > 3 && (
                                                    <div className="px-1 text-xs font-semibold text-slate-500">
                                                        +{day.occurrences.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_80px_-50px_rgba(27,53,87,0.55)] md:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">New event</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Add to calendar</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Start with manual events and recurrence. Custody templates will build on top of this exact foundation.
                                    </p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-3 text-teal-700">
                                    <CalendarDays className="size-5" />
                                </div>
                            </div>

                            <form className="mt-6 space-y-5" onSubmit={submit}>
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(event) => setData('title', event.target.value)}
                                        placeholder="Soccer practice"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        placeholder="Pickup is by the south gate."
                                        disabled={processing}
                                        className="min-h-24 rounded-[1rem] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="starts_at">Starts</Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(event) => setData('starts_at', event.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.starts_at} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="ends_at">Ends</Label>
                                        <Input
                                            id="ends_at"
                                            type="datetime-local"
                                            value={data.ends_at}
                                            onChange={(event) => setData('ends_at', event.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.ends_at} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(event) => setData('location', event.target.value)}
                                            placeholder="Lincoln Elementary"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.location} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Input
                                            id="timezone"
                                            value={data.timezone}
                                            onChange={(event) => setData('timezone', event.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.timezone} />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_all_day}
                                        onChange={(event) => setData('is_all_day', event.target.checked)}
                                        disabled={processing}
                                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
                                    />
                                    Mark as all-day event
                                </label>
                                <InputError message={errors.is_all_day} />

                                <div className="grid gap-2">
                                    <Label>Children</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {workspace.children.map((child) => {
                                            const isSelected = data.child_ids.includes(child.id);

                                            return (
                                                <button
                                                    key={child.id}
                                                    type="button"
                                                    onClick={() => toggleChild(child.id)}
                                                    disabled={processing}
                                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                                        isSelected
                                                            ? 'border-slate-900 bg-slate-950 text-white'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-200 hover:text-teal-800'
                                                    }`}
                                                >
                                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: child.color }} />
                                                    {child.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.child_ids} />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Event color</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {childColors.map((color) => {
                                            const isActive = data.color === color;

                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setData('color', color)}
                                                    className={`h-9 w-9 rounded-full border-4 transition ${isActive ? 'scale-105 border-slate-950' : 'border-white shadow-sm hover:border-slate-200'}`}
                                                    style={{ backgroundColor: color }}
                                                    aria-label={`Use ${color} as event color`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.color} />
                                </div>

                                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex items-center gap-2">
                                        <Repeat className="size-4 text-teal-700" />
                                        <p className="text-sm font-extrabold text-slate-900">Recurrence</p>
                                    </div>

                                    <div className="mt-4 grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="recurrence_type">Repeat pattern</Label>
                                            <select
                                                id="recurrence_type"
                                                value={data.recurrence_type}
                                                onChange={(event) =>
                                                    handleRecurrenceTypeChange(event.target.value as CalendarEventForm['recurrence_type'])
                                                }
                                                disabled={processing}
                                                className="h-11 rounded-[1rem] border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100"
                                            >
                                                {recurrenceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.recurrence_type} />
                                        </div>

                                        {data.recurrence_type !== 'none' && (
                                            <>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="recurrence_interval">Interval</Label>
                                                        <Input
                                                            id="recurrence_interval"
                                                            type="number"
                                                            min={1}
                                                            max={12}
                                                            value={data.recurrence_interval}
                                                            onChange={(event) => setData('recurrence_interval', Number(event.target.value) || 1)}
                                                            disabled={processing}
                                                        />
                                                        <InputError message={errors.recurrence_interval} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="recurrence_until">Repeat until</Label>
                                                        <Input
                                                            id="recurrence_until"
                                                            type="date"
                                                            value={data.recurrence_until}
                                                            onChange={(event) => setData('recurrence_until', event.target.value)}
                                                            disabled={processing}
                                                        />
                                                        <InputError message={errors.recurrence_until} />
                                                    </div>
                                                </div>

                                                {data.recurrence_type === 'weekly' && (
                                                    <div className="grid gap-2">
                                                        <Label>Days of week</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {weekdayOptions.map((day) => {
                                                                const isActive = data.recurrence_days_of_week.includes(day.value);

                                                                return (
                                                                    <button
                                                                        key={day.value}
                                                                        type="button"
                                                                        onClick={() => toggleWeekday(day.value)}
                                                                        disabled={processing}
                                                                        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                                                                            isActive
                                                                                ? 'bg-slate-950 text-white'
                                                                                : 'border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-800'
                                                                        }`}
                                                                    >
                                                                        {day.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <InputError message={errors.recurrence_days_of_week} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full rounded-full" disabled={processing}>
                                    {processing && <LoaderCircle className="animate-spin" />}
                                    Save event
                                </Button>
                            </form>
                        </section>

                        <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_80px_-50px_rgba(27,53,87,0.55)] md:p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-extrabold tracking-[0.2em] text-slate-500 uppercase">Upcoming</p>
                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">What&apos;s next</h2>
                                </div>
                                <div className="rounded-full bg-slate-100 p-3 text-slate-700">
                                    <Users className="size-5" />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {calendar.upcoming.length > 0 ? (
                                    calendar.upcoming.map((occurrence) => (
                                        <article key={occurrence.occurrence_key} className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: occurrence.color }} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-extrabold text-slate-950">{occurrence.title}</p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {new Date(occurrence.starts_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}{' '}
                                                        - {occurrence.display_time}
                                                    </p>
                                                    {occurrence.children.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {occurrence.children.map((child) => (
                                                                <span
                                                                    key={`${occurrence.occurrence_key}-${child.id}`}
                                                                    className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
                                                                >
                                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: child.color }} />
                                                                    {child.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {occurrence.recurrence_label && (
                                                        <p className="mt-2 text-xs font-semibold text-teal-700">{occurrence.recurrence_label}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600">
                                        No upcoming items yet. Add the first school, custody, or activity event from the form above.
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
