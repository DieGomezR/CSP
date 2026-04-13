import FamilyLayout from '@/components/family-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorkspacePayload, WorkspaceSummary } from '@/types/family';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, School, Users } from 'lucide-react';
import { useEffect } from 'react';

interface ScheduleWizardProps {
    workspace: WorkspacePayload;
    workspaces: WorkspaceSummary[];
    schoolCalendarOptions: Array<{
        name: string;
        region: string;
    }>;
}

interface ScheduleWizardForm {
    pattern: 'alternating-weeks' | '2-2-3' | '3-4-4-3' | '5-2-2-5' | 'every-other-weekend' | 'every-other-weekend-midweek';
    children_ids: number[];
    starting_parent_member_id: number | null;
    start_date: string;
    generate_until: '6 months' | '1 year' | '2 years';
    end_date: string;
    exchange_day: string;
    exchange_time: string;
    school_calendar: string;
}

const durationOptions = ['6 months', '1 year', '2 years'] as const;
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const custodyPatterns = [
    {
        key: 'alternating-weeks',
        title: 'Alternating Weeks',
        split: '50/50',
        description: 'One week with Parent A, next week with Parent B',
        bestFor: 'Tweens and teens, parents who live close',
    },
    {
        key: '2-2-3',
        title: '2-2-3 Rotation',
        split: '50/50',
        description: 'Mon-Tue with A, Wed-Thu with B, Fri-Sun alternates',
        bestFor: 'Young children, frequent contact needed',
    },
    {
        key: '3-4-4-3',
        title: '3-4-4-3 Rotation',
        split: '50/50',
        description: 'Week 1: A has 3 days, B has 4. Week 2: A has 4, B has 3',
        bestFor: 'School-age children',
    },
    {
        key: '5-2-2-5',
        title: '5-2-2-5 (Fixed Days)',
        split: '50/50',
        description: 'A always has Mon-Tue, B always has Wed-Thu, weekends alternate',
        bestFor: 'Parents with fixed work schedules',
    },
    {
        key: 'every-other-weekend',
        title: 'Every Other Weekend',
        split: '80/20',
        description: 'Primary parent has weekdays, other parent gets alternating weekends',
        bestFor: 'Parents who live far apart',
    },
    {
        key: 'every-other-weekend-midweek',
        title: 'Every Other Weekend + Midweek',
        split: '70/30',
        description: 'Alternating weekends plus one midweek overnight',
        bestFor: 'Maintaining regular contact with both parents',
    },
] as const;

function addDuration(startDate: string, duration: ScheduleWizardForm['generate_until']) {
    if (!startDate) {
        return '';
    }

    const date = new Date(`${startDate}T00:00:00`);
    const monthsToAdd = duration === '6 months' ? 6 : duration === '2 years' ? 24 : 12;
    date.setMonth(date.getMonth() + monthsToAdd);

    return date.toISOString().slice(0, 10);
}

function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[2rem] border border-[#edf3f2] bg-white p-4 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] sm:p-6 md:p-7">
            <h2 className="text-[1.5rem] font-black tracking-tight text-slate-900 sm:text-[1.75rem] md:text-[2rem]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">{description}</p>
            <div className="mt-4 sm:mt-6">{children}</div>
        </section>
    );
}

export default function ScheduleWizard({ workspace, schoolCalendarOptions }: ScheduleWizardProps) {
    const defaultStartDate = workspace.custody_schedule.start_date ?? new Date().toISOString().slice(0, 10);
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<ScheduleWizardForm>({
        pattern: workspace.custody_schedule.pattern,
        children_ids: workspace.custody_schedule.children_ids.length > 0 ? workspace.custody_schedule.children_ids : workspace.children.map((child) => child.id),
        starting_parent_member_id: workspace.custody_schedule.starting_parent_member_id ?? workspace.members[0]?.id ?? null,
        start_date: defaultStartDate,
        generate_until: workspace.custody_schedule.generate_until,
        end_date: workspace.custody_schedule.end_date ?? addDuration(defaultStartDate, workspace.custody_schedule.generate_until),
        exchange_day: workspace.custody_schedule.exchange_day,
        exchange_time: workspace.custody_schedule.exchange_time,
        school_calendar: workspace.custody_schedule.school_calendar ?? '',
    });

    useEffect(() => {
        setData('end_date', addDuration(data.start_date, data.generate_until));
    }, [data.generate_until, data.start_date, setData]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('workspaces.schedule-wizard.store', workspace.id));
    };

    const toggleChild = (childId: number) => {
        setData(
            'children_ids',
            data.children_ids.includes(childId) ? data.children_ids.filter((id) => id !== childId) : [...data.children_ids, childId],
        );
    };

    return (
        <>
            <Head title="Schedule Wizard" />

            <FamilyLayout activeTab="calendar" workspaceId={workspace.id}>
                <section className="border-b border-[#dceceb] pb-4 sm:pb-6">
                    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#67d2c3] sm:text-sm">Calendar / Schedule Wizard</p>
                            <h1 className="mt-2 text-[2rem] font-black tracking-tight text-slate-900 sm:text-[2.4rem] md:text-[2.8rem]">Set Custody</h1>
                            <p className="mt-1 text-base text-slate-400 sm:text-lg">
                                Create the initial custody schedule before generating recurring events in the family calendar.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Link
                                href={route('calendar', { workspace: workspace.id })}
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm sm:px-6 sm:py-3 sm:text-[1.05rem]"
                            >
                                Back to Calendar
                            </Link>
                        </div>
                    </div>
                </section>

                <form className="mt-4 space-y-4 sm:mt-6 sm:space-y-6" onSubmit={submit}>
                    <SectionCard title="1. Choose a Custody Schedule" description="Select the pattern that works best for your family">
                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                            {custodyPatterns.map((pattern) => {
                                const isSelected = data.pattern === pattern.key;

                                return (
                                    <button
                                        key={pattern.key}
                                        type="button"
                                        onClick={() => setData('pattern', pattern.key)}
                                        className={`rounded-[1.65rem] border px-4 py-4 text-left transition sm:px-6 sm:py-6 md:px-6 md:py-6 ${
                                            isSelected ? 'border-[#67d2c3] bg-[#eefbfa] shadow-[0_20px_45px_-40px_rgba(15,23,42,0.5)]' : 'border-[#dce6ef] bg-white'
                                        }`}
                                    >
                                        <h3 className="text-[1.35rem] font-black tracking-tight text-slate-900 sm:text-[1.6rem] md:text-[2rem]">{pattern.title}</h3>
                                        <div className="mt-3 inline-flex rounded-full bg-[#e7eef6] px-3 py-1.5 text-sm font-black text-slate-600 sm:mt-4 sm:px-4 sm:py-2 sm:text-[1.05rem]">
                                            {pattern.split}
                                        </div>
                                        <p className="mt-3 text-base leading-7 text-slate-600 sm:mt-4 sm:text-[1.2rem] sm:leading-9 md:text-[1.2rem]">{pattern.description}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-400 italic sm:mt-5 sm:text-[1.05rem] sm:leading-8">
                                            <span className="font-black">Best for:</span> {pattern.bestFor}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.pattern} />
                    </SectionCard>

                    <SectionCard title="2. Which Children?" description="Select the children this schedule applies to">
                        <div className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">
                            {workspace.children.map((child) => {
                                const isSelected = data.children_ids.includes(child.id);

                                return (
                                    <button
                                        key={child.id}
                                        type="button"
                                        onClick={() => toggleChild(child.id)}
                                        className={`min-h-[44px] rounded-[1.55rem] border px-4 py-4 text-left transition sm:px-5 sm:py-5 md:px-5 md:py-5 ${
                                            isSelected ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg"
                                                style={{ backgroundColor: child.color }}
                                            >
                                                {child.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.1rem] font-black text-slate-900 sm:text-[1.3rem]">{child.name}</p>
                                                <p className="text-xs text-slate-400 sm:text-sm">
                                                    {child.birthdate ? new Date(child.birthdate).toLocaleDateString() : 'Child profile ready for schedule'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.children_ids} />
                    </SectionCard>

                    <SectionCard title="3. Who Starts?" description="Choose which parent has the children first">
                        <div className="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">
                            {workspace.members.map((member, index) => {
                                const isActive = data.starting_parent_member_id === member.id;
                                const palette = ['#5B8DEF', '#FF7D7D', '#67D2C3', '#9B6BFF'];

                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => setData('starting_parent_member_id', member.id)}
                                        className={`min-h-[44px] rounded-[1.55rem] border px-4 py-4 text-left transition sm:px-5 sm:py-5 md:px-5 md:py-5 ${
                                            isActive ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-full text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg"
                                                style={{ backgroundColor: palette[index % palette.length] }}
                                            >
                                                {(member.name ?? '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.1rem] font-black text-slate-900 sm:text-[1.3rem]">{member.name ?? member.email ?? 'Member'}</p>
                                                <p className="text-xs text-slate-400 sm:text-sm">{index === 0 ? 'Parent A (starts first)' : `Parent ${String.fromCharCode(65 + index)}`}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.starting_parent_member_id} />
                    </SectionCard>

                    <SectionCard title="4. Schedule Duration" description="Set the start date and how far ahead to generate">
                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label htmlFor="start_date" className="text-sm font-bold text-slate-600 sm:text-base">
                                    Start Date
                                </label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(event) => setData('start_date', event.target.value)}
                                    className="h-12 rounded-[1.2rem] border-[#cfe9e4] bg-white text-sm sm:h-14 sm:text-[1.05rem]"
                                />
                                <p className="text-xs text-slate-300 sm:text-sm">When the schedule begins</p>
                                <InputError message={errors.start_date} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="generate_until" className="text-sm font-bold text-slate-600 sm:text-base">
                                    Generate Until
                                </label>
                                <select
                                    id="generate_until"
                                    value={data.generate_until}
                                    onChange={(event) => setData('generate_until', event.target.value as ScheduleWizardForm['generate_until'])}
                                    className="h-12 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-3 text-sm text-slate-900 outline-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                                >
                                    {durationOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-300 sm:text-sm">How far ahead to create events</p>
                                <InputError message={errors.generate_until} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="end_date" className="text-sm font-bold text-slate-600 sm:text-base">
                                    End Date
                                </label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(event) => setData('end_date', event.target.value)}
                                    className="h-12 rounded-[1.2rem] border-[#cfe9e4] bg-white text-sm sm:h-14 sm:text-[1.05rem]"
                                />
                                <p className="text-xs text-slate-300 sm:text-sm">Schedule ends on this date</p>
                                <InputError message={errors.end_date} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="exchange_day" className="text-sm font-bold text-slate-600 sm:text-base">
                                    Exchange Day
                                </label>
                                <select
                                    id="exchange_day"
                                    value={data.exchange_day}
                                    onChange={(event) => setData('exchange_day', event.target.value)}
                                    className="h-12 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-3 text-sm text-slate-900 outline-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                                >
                                    {weekDays.map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-300 sm:text-sm">Day custody switches between parents</p>
                                <InputError message={errors.exchange_day} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <label htmlFor="exchange_time" className="text-sm font-bold text-slate-600 sm:text-base">
                                    Exchange Time
                                </label>
                                <Input
                                    id="exchange_time"
                                    type="time"
                                    value={data.exchange_time}
                                    onChange={(event) => setData('exchange_time', event.target.value)}
                                    className="h-12 rounded-[1.2rem] border-[#cfe9e4] bg-white text-sm sm:h-14 sm:text-[1.05rem]"
                                />
                                <p className="text-xs text-slate-300 sm:text-sm">When custody handovers happen on each generated event</p>
                                <InputError message={errors.exchange_time} />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="5. School Calendar" description="Optionally connect a school calendar during setup">
                        <div className="grid grid-cols-1 gap-3 sm:gap-3">
                            {schoolCalendarOptions.map((option) => {
                                const isSelected = data.school_calendar === option.name;

                                return (
                                    <button
                                        key={option.name}
                                        type="button"
                                        onClick={() => setData('school_calendar', option.name)}
                                        className={`min-h-[44px] flex items-center gap-3 rounded-[1.45rem] border px-4 py-4 text-left transition sm:gap-4 sm:px-5 sm:py-5 md:px-5 md:py-5 ${
                                            isSelected ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="rounded-2xl bg-[#ff9d1f] p-2.5 text-white shadow-sm sm:p-3">
                                            <School className="size-4 sm:size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[1.05rem] font-black text-slate-900 sm:text-[1.2rem]">{option.name}</p>
                                            <p className="text-xs text-slate-400 sm:text-sm">{option.region}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.school_calendar} />
                    </SectionCard>

                    <section className="rounded-[2rem] border border-[#edf3f2] bg-white p-4 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] sm:p-6 md:p-7">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-4 sm:p-5">
                                <div className="flex items-center gap-2 text-[#67d2c3] sm:gap-3">
                                    <CheckCircle2 className="size-4 sm:size-5" />
                                    <p className="text-xs font-black uppercase tracking-[0.15em] sm:text-sm">Pattern</p>
                                </div>
                                <p className="mt-3 text-xl font-black text-slate-900 sm:mt-4 sm:text-2xl">
                                    {custodyPatterns.find((pattern) => pattern.key === data.pattern)?.title ?? 'Alternating Weeks'}
                                </p>
                            </div>
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-4 sm:p-5">
                                <div className="flex items-center gap-2 text-[#67d2c3] sm:gap-3">
                                    <Users className="size-4 sm:size-5" />
                                    <p className="text-xs font-black uppercase tracking-[0.15em] sm:text-sm">Children</p>
                                </div>
                                <p className="mt-3 text-3xl font-black text-slate-900 sm:mt-4 sm:text-4xl">{data.children_ids.length}</p>
                            </div>
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-4 sm:p-5">
                                <div className="flex items-center gap-2 text-[#67d2c3] sm:gap-3">
                                    <Clock3 className="size-4 sm:size-5" />
                                    <p className="text-xs font-black uppercase tracking-[0.15em] sm:text-sm">Exchange</p>
                                </div>
                                <p className="mt-3 text-lg font-black text-slate-900 sm:mt-4 sm:text-xl md:text-2xl">
                                    {data.exchange_day} at {data.exchange_time}
                                </p>
                            </div>
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-4 sm:p-5">
                                <div className="flex items-center gap-2 text-[#67d2c3] sm:gap-3">
                                    <CalendarDays className="size-4 sm:size-5" />
                                    <p className="text-xs font-black uppercase tracking-[0.15em] sm:text-sm">Range</p>
                                </div>
                                <p className="mt-3 text-xl font-black text-slate-900 sm:mt-4 sm:text-2xl">{data.generate_until}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                            <Link
                                href={route('calendar', { workspace: workspace.id })}
                                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm sm:px-7 sm:py-4 sm:text-[1.05rem]"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-h-[44px] h-12 rounded-[1.25rem] bg-[#67d2c3] px-6 text-sm font-black text-white shadow-sm sm:h-14 sm:px-8 sm:text-[1.05rem]"
                            >
                                <CheckCircle2 className="size-4" />
                                Generate Schedule
                            </Button>
                        </div>
                    </section>
                </form>
            </FamilyLayout>
        </>
    );
}
