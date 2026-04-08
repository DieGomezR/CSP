import FamilyLayout from '@/components/family-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type SharedData } from '@/types';
import type { CalendarFeedPayload, CalendarPayload, WorkspacePayload, WorkspaceSummary } from '@/types/family';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Link2,
    LoaderCircle,
    Lock,
    Repeat,
    Shield,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface CalendarPageProps {
    workspace: WorkspacePayload;
    workspaces: WorkspaceSummary[];
    calendar: CalendarPayload;
    syncFeeds: CalendarFeedPayload[];
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
const colorPalette = ['#4DBFAE', '#FF8A5B', '#5B8DEF', '#9B6BFF', '#F2C94C', '#EB5757'];
const custodyPalette = ['#5B8DEF', '#FF7D7D', '#67D2C3', '#9B6BFF'];
const eventTypeOptions = ['Custody Time', 'School Event', 'Activity', 'Appointment', 'Other'];

function applyAlpha(hex: string, alpha: string) {
    return `${hex}${alpha}`;
}

function replaceDateInDateTime(value: string, nextDate: string, fallbackTime: string) {
    if (!value) return `${nextDate}T${fallbackTime}`;
    const [, time = fallbackTime] = value.split('T');
    return `${nextDate}T${time}`;
}

function formatWeekday(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function SectionCard({
    id,
    title,
    icon: Icon,
    description,
    children,
}: {
    id?: string;
    title: string;
    icon: typeof CalendarDays;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="rounded-[2rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] md:p-7">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#f6fbfb] p-2.5 text-[#a38fc9]">
                    <Icon className="size-5" />
                </div>
                <h2 className="text-[2rem] font-black tracking-tight text-slate-900">{title}</h2>
            </div>
            {description && <p className="mt-4 text-lg leading-8 text-slate-400">{description}</p>}
            <div className="mt-6">{children}</div>
        </section>
    );
}

function ToolbarButton({
    href,
    active = true,
    onClick,
    children,
}: {
    href?: string;
    active?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}) {
    const className = active
        ? 'inline-flex items-center gap-2 rounded-[1.25rem] bg-[#67d2c3] px-6 py-3 text-[1.05rem] font-black text-white shadow-sm'
        : 'inline-flex items-center gap-2 rounded-[1.25rem] border border-[#d5e8e3] bg-white px-6 py-3 text-[1.05rem] font-black text-slate-600 shadow-sm';
    if (href) return <a href={href} className={className}>{children}</a>;
    return <button type="button" className={className} onClick={onClick}>{children}</button>;
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-[2rem] border border-[#e4f1ef] bg-[#fbfdfd] p-6">
            <p className="text-[1.15rem] font-black uppercase tracking-[0.16em] text-[#67d2c3]">{title}</p>
            <div className="mt-5 border-t border-[#e4f1ef] pt-5">{children}</div>
        </section>
    );
}

export default function CalendarPage({ workspace, workspaces, calendar, syncFeeds }: CalendarPageProps) {
    const { flash } = usePage<SharedData>().props;
    const [isSyncOpen, setSyncOpen] = useState(true);
    const [isAddEventOpen, setAddEventOpen] = useState(false);
    const [visibility, setVisibility] = useState<'shared' | 'private'>('shared');
    const [eventType, setEventType] = useState('Custody Time');
    const dayRows = useMemo(() => calendar.weeks.flat().filter((day) => day.is_current_month), [calendar.weeks]);
    const activeFeed = syncFeeds[0] ?? null;
    const scheduleWizardHref = route('calendar.schedule-wizard', { workspace: workspace.id });
    const custodyHref = workspace.setup.custody_schedule_completed ? route('calendar', { workspace: workspace.id }) : scheduleWizardHref;
    const childColors = Array.from(new Set([...workspace.children.map((child) => child.color), ...colorPalette]));
    const todayMonth = calendar.form_defaults.starts_at.slice(0, 7);

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

    const resetForm = () => {
        reset('title', 'description', 'location', 'child_ids', 'recurrence_until', 'recurrence_days_of_week');
        setData('starts_at', calendar.form_defaults.starts_at);
        setData('ends_at', calendar.form_defaults.ends_at);
        setData('timezone', workspace.timezone);
        setData('is_all_day', false);
        setData('color', calendar.form_defaults.color);
        setData('recurrence_type', 'none');
        setData('recurrence_interval', 1);
        setVisibility('shared');
        setEventType('Custody Time');
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('workspaces.events.store', workspace.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
                setAddEventOpen(false);
            },
        });
    };

    const toggleChild = (childId: number) =>
        setData('child_ids', data.child_ids.includes(childId) ? data.child_ids.filter((id) => id !== childId) : [...data.child_ids, childId]);

    const toggleWeekday = (day: number) =>
        setData(
            'recurrence_days_of_week',
            data.recurrence_days_of_week.includes(day)
                ? data.recurrence_days_of_week.filter((currentDay) => currentDay !== day)
                : [...data.recurrence_days_of_week, day].sort(),
        );

    const handleRecurrenceTypeChange = (value: CalendarEventForm['recurrence_type']) => {
        setData('recurrence_type', value);
        if (value !== 'weekly') setData('recurrence_days_of_week', []);
        if (value === 'none') {
            setData('recurrence_interval', 1);
            setData('recurrence_until', '');
        }
    };

    const selectDay = (date: string) => {
        setData('starts_at', replaceDateInDateTime(data.starts_at, date, '09:00'));
        setData('ends_at', replaceDateInDateTime(data.ends_at, date, '17:00'));
        setAddEventOpen(true);
    };

    return (
        <>
            <Head title="Family Calendar" />
            <FamilyLayout activeTab="calendar" workspaceId={workspace.id}>
                <section className="border-b border-[#dceceb] pb-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h1 className="text-[2.8rem] font-black tracking-tight text-slate-900">Family Calendar</h1>
                            <p className="mt-2 text-lg text-slate-400">One source of truth for schedules, recurring custody, activities, and phone sync.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <ToolbarButton onClick={() => setAddEventOpen(true)}>+ Add Event</ToolbarButton>
                            <ToolbarButton href={custodyHref}>Set Custody</ToolbarButton>
                            <ToolbarButton><Upload className="size-4" />Import</ToolbarButton>
                            <ToolbarButton href={activeFeed?.subscription_url} active={false}>Export</ToolbarButton>
                            <ToolbarButton href="#sync-phone">Sync</ToolbarButton>
                            <ToolbarButton href={activeFeed?.subscription_url} active={false}>Share</ToolbarButton>
                            <ToolbarButton active={false}>Clear</ToolbarButton>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="mt-6 rounded-[1.35rem] border border-[#caece6] bg-white px-5 py-4 text-[1.05rem] font-semibold text-[#3da999] shadow-sm">{flash.status}</div>}

                {!workspace.setup.custody_schedule_completed && (
                    <div className="mt-6 rounded-[1.6rem] border border-[#caece6] bg-white px-6 py-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-[1.35rem] font-black text-slate-900">Custody setup is still pending</p>
                                <p className="mt-2 text-base text-slate-400">Before generating custody events, complete the setup wizard from the dashboard or the Set Custody button here.</p>
                            </div>
                            <Link href={scheduleWizardHref} className="inline-flex items-center justify-center rounded-[1.25rem] bg-[#67d2c3] px-6 py-3 text-[1.05rem] font-black text-white shadow-sm">
                                Open Setup Wizard
                            </Link>
                        </div>
                    </div>
                )}

                <section className="mt-6 rounded-[1.7rem] bg-white px-6 py-5 shadow-sm">
                    <div className="inline-flex flex-wrap items-center gap-4 rounded-full bg-[#f3f8ff] px-4 py-3 text-[1.05rem] font-bold text-slate-500">
                        <span className="text-slate-700">Custody:</span>
                        {workspace.members.slice(0, 4).map((member, index) => (
                            <span key={member.id} className="inline-flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: custodyPalette[index % custodyPalette.length] }} />
                                {member.name ?? member.email ?? `Member ${member.id}`}
                            </span>
                        ))}
                    </div>
                </section>

                <SectionCard id="calendar-view" title="Day View" icon={CalendarDays}>
                    <div className="flex flex-col gap-5 border-b border-[#edf3f2] pb-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <Link href={route('calendar', { workspace: workspace.id, month: calendar.previous_month })} className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#67d2c3] text-white shadow-sm"><ChevronLeft className="size-5" /></Link>
                            <Link href={route('calendar', { workspace: workspace.id, month: todayMonth })} className="rounded-[1.25rem] bg-[#67d2c3] px-7 py-4 text-[1.05rem] font-black text-white shadow-sm">Today</Link>
                            <Link href={route('calendar', { workspace: workspace.id, month: calendar.next_month })} className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#67d2c3] text-white shadow-sm"><ChevronRight className="size-5" /></Link>
                        </div>
                        <p className="text-center text-[1.9rem] font-black tracking-tight text-slate-900">Day View</p>
                        <div className="flex flex-wrap gap-3">
                            <ToolbarButton active={false}>Month</ToolbarButton>
                            <ToolbarButton active={false}>Month+</ToolbarButton>
                            <ToolbarButton>Day</ToolbarButton>
                            <ToolbarButton active={false}>Week</ToolbarButton>
                            <ToolbarButton active={false}>List</ToolbarButton>
                        </div>
                    </div>
                    <div className="mt-6 max-h-[60rem] overflow-y-auto pr-2">
                        <div className="rounded-[1.35rem] bg-[#67d2c3] px-5 py-4 text-[1.5rem] font-black text-white shadow-sm">{calendar.month_label}</div>
                        <div className="mt-4 space-y-3">
                            {dayRows.map((day) => (
                                <div key={day.date} className="grid gap-3 md:grid-cols-[7rem_1fr]">
                                    <button type="button" onClick={() => selectDay(day.date)} className={`rounded-[1.2rem] border bg-white px-4 py-5 text-left transition ${day.is_today ? 'border-[#8ddbcc] shadow-sm' : 'border-[#edf3f2]'}`}>
                                        <p className="text-[2.6rem] font-black leading-none text-slate-900">{day.label}</p>
                                        <p className="mt-2 text-base font-bold tracking-[0.14em] text-slate-400">{formatWeekday(day.date)}</p>
                                    </button>
                                    <div className="rounded-[1.6rem] border border-[#edf3f2] bg-[#fbfdfd] p-4">
                                        {day.occurrences.length > 0 ? (
                                            <div className="grid gap-3">
                                                {day.occurrences.map((occurrence) => (
                                                    <div key={occurrence.occurrence_key} className="rounded-[1.25rem] border px-4 py-4" style={{ backgroundColor: applyAlpha(occurrence.color, '14'), borderColor: applyAlpha(occurrence.color, '30') }}>
                                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                            <div>
                                                                <p className="text-[1.2rem] font-black text-slate-900">{occurrence.title}</p>
                                                                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{occurrence.display_time}</p>
                                                                {occurrence.description && <p className="mt-3 text-base text-slate-600">{occurrence.description}</p>}
                                                            </div>
                                                            {occurrence.recurrence_label && <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-black text-slate-600"><Repeat className="size-4" />{occurrence.recurrence_label}</span>}
                                                        </div>
                                                        {occurrence.children.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{occurrence.children.map((child) => <span key={child.id} className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: child.color }} />{child.name}</span>)}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div className="rounded-[1.25rem] bg-[#f5f9f8] px-4 py-7 text-lg text-slate-400">No events scheduled for this day.</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Events</p><p className="mt-2 text-3xl font-black text-slate-900">{calendar.summary.occurrences_count}</p></div>
                        <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Series</p><p className="mt-2 text-3xl font-black text-slate-900">{calendar.summary.series_count}</p></div>
                        <div className="rounded-[1.2rem] bg-[#eef8f7] px-4 py-4 text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Families</p><p className="mt-2 text-3xl font-black text-slate-900">{workspaces.length}</p></div>
                    </div>
                </SectionCard>

                <div className="mt-6 grid gap-6">
                    <SectionCard id="sync-phone" title="Sync to Your Phone" icon={Link2} description="Subscribe to your calendar in Apple Calendar, Google Calendar, or Outlook. Updates sync automatically.">
                        <button type="button" onClick={() => setSyncOpen((current) => !current)} className="flex w-full items-center justify-between rounded-[1.5rem] bg-[#f8fbfb] px-6 py-5 text-left">
                            <span className="text-[1.15rem] font-bold text-slate-500">Subscribe to your calendar in Apple Calendar, Google Calendar, or Outlook. Updates sync automatically.</span>
                            <ChevronDown className={`size-6 text-slate-400 transition ${isSyncOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSyncOpen && (
                            <div className="mt-5 rounded-[1.5rem] border border-[#edf3f2] bg-white p-5">
                                {activeFeed ? (
                                    <div className="rounded-[1.5rem] bg-[#f5f9f8] p-5">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                            <div>
                                                <p className="text-[1.8rem] font-black tracking-tight text-slate-900">Full Family Calendar</p>
                                                <p className="mt-2 text-base text-slate-400">Private ICS subscription for the complete family schedule.</p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <a href={activeFeed.provider_links.apple} className="inline-flex items-center justify-center rounded-[1.2rem] bg-[#67d2c3] px-6 py-4 text-lg font-black text-white shadow-sm">iPhone / Mac</a>
                                                <a href={activeFeed.provider_links.google} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-[1.2rem] bg-[#67d2c3] px-6 py-4 text-lg font-black text-white shadow-sm">Google Calendar</a>
                                                <a href={activeFeed.provider_links.outlook} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-[1.2rem] bg-[#67d2c3] px-6 py-4 text-lg font-black text-white shadow-sm">Outlook</a>
                                                <Link
                                                    href={route('workspaces.calendar-feeds.destroy', { workspace: workspace.id, calendarFeed: activeFeed.id })}
                                                    method="delete"
                                                    as="button"
                                                    className="inline-flex items-center justify-center rounded-[1.2rem] bg-[#67d2c3] px-6 py-4 text-lg font-black text-white shadow-sm"
                                                >
                                                    Remove
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-[1.5rem] bg-[#f5f9f8] px-5 py-8 text-center text-[1.15rem] font-semibold text-slate-300">
                                        Create a sync link to subscribe in your phone's calendar app.
                                    </div>
                                )}

                                <div className="mt-5 flex flex-wrap gap-4">
                                    <Link href={route('workspaces.calendar-feeds.store', { workspace: workspace.id })} method="post" as="button" className="rounded-[1.25rem] bg-[#67d2c3] px-7 py-4 text-[1.1rem] font-black text-white shadow-sm">
                                        + Create Family Sync Link
                                    </Link>
                                </div>

                                {activeFeed && (
                                    <div className="mt-5 grid gap-2">
                                        <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-400">Private feed URL</p>
                                        <Input value={activeFeed.subscription_url} readOnly className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white" />
                                    </div>
                                )}

                                <p className="mt-4 text-sm text-slate-400">
                                    Providers need a public HTTPS URL. On localhost the buttons are wired, but the real subscription flow works once the app is deployed on your domain.
                                </p>
                            </div>
                        )}
                    </SectionCard>
                </div>

                <div className="mt-6 rounded-[1.7rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-[#f6fbfb] p-2.5 text-[#a38fc9]"><Shield className="size-5" /></div>
                        <h2 className="text-[2rem] font-black tracking-tight text-slate-900">Why this sync works</h2>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[1.4rem] bg-[#eef8f7] p-5"><p className="text-lg font-black text-slate-900">1. Private feed</p><p className="mt-2 text-base text-slate-500">We generate a secret URL that serves the family calendar as ICS.</p></div>
                        <div className="rounded-[1.4rem] bg-[#eef8f7] p-5"><p className="text-lg font-black text-slate-900">2. Provider hand-off</p><p className="mt-2 text-base text-slate-500">Apple opens webcal; Google and Outlook open their own subscribe-from-web screens.</p></div>
                        <div className="rounded-[1.4rem] bg-[#eef8f7] p-5"><p className="text-lg font-black text-slate-900">3. Auto-updates</p><p className="mt-2 text-base text-slate-500">Once subscribed, edits in KidSchedule keep syncing without another export.</p></div>
                    </div>
                </div>

                <Dialog open={isAddEventOpen} onOpenChange={setAddEventOpen}>
                    <DialogContent hideCloseButton className="w-[min(96vw,760px)] max-w-[760px] overflow-hidden rounded-[2rem] border border-[#dcedea] bg-white p-0 shadow-[0_35px_110px_-45px_rgba(15,23,42,0.55)]">
                        <div className="flex items-center justify-between border-b border-[#e7f1ef] bg-[#eaf8f7] px-8 py-7">
                            <DialogTitle asChild><h2 className="text-[2.1rem] font-black tracking-tight text-slate-900">Add Event</h2></DialogTitle>
                            <DialogClose asChild>
                                <button type="button" className="inline-flex h-18 w-18 items-center justify-center rounded-[1.35rem] bg-[#67d2c3] text-white shadow-sm">
                                    <X className="size-6" />
                                </button>
                            </DialogClose>
                        </div>

                        <div className="max-h-[78vh] overflow-y-auto px-7 py-7">
                            <form className="space-y-6" onSubmit={submit}>
                                <ModalSection title="Select Children">
                                    <div className="flex flex-wrap gap-3">
                                        {workspace.children.map((child) => {
                                            const isSelected = data.child_ids.includes(child.id);
                                            return (
                                                <button key={child.id} type="button" onClick={() => toggleChild(child.id)} disabled={processing} className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-base font-black transition ${isSelected ? 'border-[#67d2c3] bg-[#eefbfa] text-slate-900' : 'border-[#dceceb] bg-white text-slate-500'}`}>
                                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: child.color }} />
                                                    {child.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </ModalSection>

                                <ModalSection title="Event Details">
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <label htmlFor="event_type" className="text-[1.05rem] font-black text-slate-900">Event Type</label>
                                            <select id="event_type" value={eventType} onChange={(event) => { const nextType = event.target.value; setEventType(nextType); if (!data.title.trim()) setData('title', nextType); }} className="h-16 rounded-[1.35rem] border border-[#cfe9e4] bg-white px-5 text-[1rem] text-slate-900 outline-none">
                                                {eventTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label htmlFor="assign_parent" className="text-[1.05rem] font-black text-slate-900">Assign to Parent</label>
                                            <select id="assign_parent" defaultValue={workspace.members[0]?.id} className="h-16 rounded-[1.35rem] border border-[#cfe9e4] bg-white px-5 text-[1rem] text-slate-900 outline-none">
                                                {workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name ?? member.email ?? `Member ${member.id}`}</option>)}
                                            </select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label htmlFor="title" className="text-[1.05rem] font-black text-slate-900">Event Title</label>
                                            <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} placeholder="Custody Time" disabled={processing} className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]" />
                                            <InputError message={errors.title} />
                                        </div>
                                    </div>
                                </ModalSection>

                                <div>
                                    <p className="text-[1.15rem] font-black uppercase tracking-[0.16em] text-slate-900">Visibility</p>
                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        <button type="button" onClick={() => setVisibility('shared')} className={`rounded-[1.7rem] border px-6 py-6 text-left transition ${visibility === 'shared' ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'}`}>
                                            <Users className="size-7 text-[#7b65b6]" />
                                            <p className="mt-5 text-[1.7rem] font-black text-slate-900">Shared</p>
                                            <p className="mt-2 text-lg text-slate-500">Visible to both co-parents</p>
                                        </button>
                                        <button type="button" onClick={() => setVisibility('private')} className={`rounded-[1.7rem] border px-6 py-6 text-left transition ${visibility === 'private' ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'}`}>
                                            <Lock className="size-7 text-[#f0a52d]" />
                                            <p className="mt-5 text-[1.7rem] font-black text-slate-900">Private</p>
                                            <p className="mt-2 text-lg text-slate-500">Only you can see this</p>
                                        </button>
                                    </div>
                                </div>

                                <ModalSection title="Date & Time">
                                    <div className="grid gap-5">
                                        <label className="flex items-center gap-4 rounded-[1.35rem] border border-[#cfe9e4] bg-white px-5 py-5 text-[1.05rem] font-black text-slate-900">
                                            <input type="checkbox" checked={data.is_all_day} onChange={(event) => setData('is_all_day', event.target.checked)} className="h-7 w-7 rounded-md border-[#cfe9e4]" />
                                            All Day Event
                                        </label>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <label htmlFor="starts_at" className="text-[1.05rem] font-black text-slate-900">Start Date & Time</label>
                                                <Input
                                                    id="starts_at"
                                                    type={data.is_all_day ? 'date' : 'datetime-local'}
                                                    value={data.is_all_day ? data.starts_at.slice(0, 10) : data.starts_at}
                                                    onChange={(event) => setData('starts_at', data.is_all_day ? `${event.target.value}T00:00` : event.target.value)}
                                                    disabled={processing}
                                                    className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]"
                                                />
                                                <InputError message={errors.starts_at} />
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="ends_at" className="text-[1.05rem] font-black text-slate-900">End Date & Time</label>
                                                <Input
                                                    id="ends_at"
                                                    type={data.is_all_day ? 'date' : 'datetime-local'}
                                                    value={data.is_all_day ? data.ends_at.slice(0, 10) : data.ends_at}
                                                    onChange={(event) => setData('ends_at', data.is_all_day ? `${event.target.value}T23:59` : event.target.value)}
                                                    disabled={processing}
                                                    className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]"
                                                />
                                                <InputError message={errors.ends_at} />
                                            </div>
                                        </div>
                                    </div>
                                </ModalSection>

                                <ModalSection title="Repeat Options">
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <label htmlFor="recurrence_type" className="text-[1.05rem] font-black text-slate-900">Repeat Pattern</label>
                                            <select
                                                id="recurrence_type"
                                                value={data.recurrence_type}
                                                onChange={(event) => handleRecurrenceTypeChange(event.target.value as CalendarEventForm['recurrence_type'])}
                                                disabled={processing}
                                                className="h-16 rounded-[1.35rem] border border-[#cfe9e4] bg-white px-5 text-[1rem] text-slate-900 outline-none"
                                            >
                                                {recurrenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select>
                                        </div>

                                        {data.recurrence_type !== 'none' && (
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <label htmlFor="recurrence_interval" className="text-[1.05rem] font-black text-slate-900">Interval</label>
                                                    <Input id="recurrence_interval" type="number" min={1} max={12} value={data.recurrence_interval} onChange={(event) => setData('recurrence_interval', Number(event.target.value) || 1)} disabled={processing} className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label htmlFor="recurrence_until" className="text-[1.05rem] font-black text-slate-900">Repeat Until</label>
                                                    <Input id="recurrence_until" type="date" value={data.recurrence_until} onChange={(event) => setData('recurrence_until', event.target.value)} disabled={processing} className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]" />
                                                </div>
                                            </div>
                                        )}

                                        {data.recurrence_type === 'weekly' && (
                                            <div className="grid gap-2">
                                                <p className="text-[1.05rem] font-black text-slate-900">Days of week</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {weekdayOptions.map((day) => {
                                                        const isActive = data.recurrence_days_of_week.includes(day.value);
                                                        return (
                                                            <button key={day.value} type="button" onClick={() => toggleWeekday(day.value)} disabled={processing} className={`rounded-full px-4 py-2.5 text-sm font-black transition ${isActive ? 'bg-[#172033] text-white' : 'border border-[#dceceb] bg-white text-slate-700'}`}>
                                                                {day.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ModalSection>

                                <ModalSection title="Additional Options">
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <label htmlFor="description" className="text-[1.05rem] font-black text-slate-900">Notes <span className="font-medium text-slate-400">(optional)</span></label>
                                            <textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} disabled={processing} placeholder="Any additional details..." className="min-h-32 rounded-[1.35rem] border border-[#cfe9e4] bg-white px-5 py-4 text-[1rem] text-slate-900 outline-none focus:border-[#8fd6ca]" />
                                            <InputError message={errors.description} />
                                        </div>

                                        <div className="grid gap-2">
                                            <label htmlFor="location" className="text-[1.05rem] font-black text-slate-900">Location</label>
                                            <Input id="location" value={data.location} onChange={(event) => setData('location', event.target.value)} placeholder="Community field" disabled={processing} className="h-16 rounded-[1.35rem] border-[#cfe9e4] bg-white px-5 text-[1rem]" />
                                            <InputError message={errors.location} />
                                        </div>

                                        <div className="grid gap-2">
                                            <p className="text-[1.05rem] font-black text-slate-900">Color</p>
                                            <div className="flex flex-wrap gap-3">
                                                {childColors.map((color) => {
                                                    const isActive = data.color === color;
                                                    return (
                                                        <button key={color} type="button" onClick={() => setData('color', color)} className={`h-10 w-10 rounded-full border-4 transition ${isActive ? 'scale-105 border-[#172033]' : 'border-white shadow-sm'}`} style={{ backgroundColor: color }} aria-label={`Use ${color} as event color`} />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </ModalSection>

                                <div className="flex flex-col-reverse gap-3 border-t border-[#e7f1ef] px-1 pt-6 sm:flex-row sm:justify-end">
                                    <DialogClose asChild><button type="button" className="inline-flex h-14 items-center justify-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-8 text-[1.05rem] font-black text-slate-600">Cancel</button></DialogClose>
                                    <Button type="submit" className="h-14 rounded-[1.25rem] bg-[#67d2c3] px-8 text-[1.05rem] font-black text-white" disabled={processing}>
                                        {processing && <LoaderCircle className="animate-spin" />}
                                        Add Event
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </FamilyLayout>
        </>
    );
}
