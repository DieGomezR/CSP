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
        <section className="rounded-[2rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] md:p-7">
            <h2 className="text-[2rem] font-black tracking-tight text-slate-900">{title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-400">{description}</p>
            <div className="mt-6">{children}</div>
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
                <section className="border-b border-[#dceceb] pb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#67d2c3]">Calendar / Schedule Wizard</p>
                            <h1 className="mt-3 text-[2.8rem] font-black tracking-tight text-slate-900">Set Custody</h1>
                            <p className="mt-2 text-lg text-slate-400">
                                Create the initial custody schedule before generating recurring events in the family calendar.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('calendar', { workspace: workspace.id })}
                                className="inline-flex items-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-6 py-3 text-[1.05rem] font-black text-slate-600 shadow-sm"
                            >
                                Back to Calendar
                            </Link>
                        </div>
                    </div>
                </section>

                <form className="mt-6 space-y-6" onSubmit={submit}>
                    <SectionCard title="2. Which Children?" description="Select the children this schedule applies to">
                        <div className="grid gap-4 md:grid-cols-2">
                            {workspace.children.map((child) => {
                                const isSelected = data.children_ids.includes(child.id);

                                return (
                                    <button
                                        key={child.id}
                                        type="button"
                                        onClick={() => toggleChild(child.id)}
                                        className={`rounded-[1.55rem] border px-5 py-5 text-left transition ${
                                            isSelected ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white"
                                                style={{ backgroundColor: child.color }}
                                            >
                                                {child.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.3rem] font-black text-slate-900">{child.name}</p>
                                                <p className="text-sm text-slate-400">
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
                        <div className="grid gap-4 md:grid-cols-2">
                            {workspace.members.map((member, index) => {
                                const isActive = data.starting_parent_member_id === member.id;
                                const palette = ['#5B8DEF', '#FF7D7D', '#67D2C3', '#9B6BFF'];

                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => setData('starting_parent_member_id', member.id)}
                                        className={`rounded-[1.55rem] border px-5 py-5 text-left transition ${
                                            isActive ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white"
                                                style={{ backgroundColor: palette[index % palette.length] }}
                                            >
                                                {(member.name ?? '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[1.3rem] font-black text-slate-900">{member.name ?? member.email ?? 'Member'}</p>
                                                <p className="text-sm text-slate-400">{index === 0 ? 'Parent A (starts first)' : `Parent ${String.fromCharCode(65 + index)}`}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.starting_parent_member_id} />
                    </SectionCard>

                    <SectionCard title="4. Schedule Duration" description="Set the start date and how far ahead to generate">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label htmlFor="start_date" className="text-base font-bold text-slate-600">
                                    Start Date
                                </label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(event) => setData('start_date', event.target.value)}
                                    className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                />
                                <p className="text-sm text-slate-300">When the schedule begins</p>
                                <InputError message={errors.start_date} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="generate_until" className="text-base font-bold text-slate-600">
                                    Generate Until
                                </label>
                                <select
                                    id="generate_until"
                                    value={data.generate_until}
                                    onChange={(event) => setData('generate_until', event.target.value as ScheduleWizardForm['generate_until'])}
                                    className="h-14 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 text-[1.05rem] text-slate-900 outline-none"
                                >
                                    {durationOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-slate-300">How far ahead to create events</p>
                                <InputError message={errors.generate_until} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="end_date" className="text-base font-bold text-slate-600">
                                    End Date
                                </label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(event) => setData('end_date', event.target.value)}
                                    className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                />
                                <p className="text-sm text-slate-300">Schedule ends on this date</p>
                                <InputError message={errors.end_date} />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="exchange_day" className="text-base font-bold text-slate-600">
                                    Exchange Day
                                </label>
                                <select
                                    id="exchange_day"
                                    value={data.exchange_day}
                                    onChange={(event) => setData('exchange_day', event.target.value)}
                                    className="h-14 rounded-[1.2rem] border border-[#cfe9e4] bg-white px-4 text-[1.05rem] text-slate-900 outline-none"
                                >
                                    {weekDays.map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-slate-300">Day custody switches between parents</p>
                                <InputError message={errors.exchange_day} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <label htmlFor="exchange_time" className="text-base font-bold text-slate-600">
                                    Exchange Time
                                </label>
                                <Input
                                    id="exchange_time"
                                    type="time"
                                    value={data.exchange_time}
                                    onChange={(event) => setData('exchange_time', event.target.value)}
                                    className="h-14 rounded-[1.2rem] border-[#cfe9e4] bg-white text-[1.05rem]"
                                />
                                <p className="text-sm text-slate-300">When custody handovers happen on each generated event</p>
                                <InputError message={errors.exchange_time} />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="5. School Calendar" description="Optionally connect a school calendar during setup">
                        <div className="grid gap-3">
                            {schoolCalendarOptions.map((option) => {
                                const isSelected = data.school_calendar === option.name;

                                return (
                                    <button
                                        key={option.name}
                                        type="button"
                                        onClick={() => setData('school_calendar', option.name)}
                                        className={`flex items-center gap-4 rounded-[1.45rem] border px-5 py-5 text-left transition ${
                                            isSelected ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dceceb] bg-white'
                                        }`}
                                    >
                                        <div className="rounded-2xl bg-[#ff9d1f] p-3 text-white shadow-sm">
                                            <School className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-[1.2rem] font-black text-slate-900">{option.name}</p>
                                            <p className="text-sm text-slate-400">{option.region}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError className="mt-3" message={errors.school_calendar} />
                    </SectionCard>

                    <section className="rounded-[2rem] border border-[#edf3f2] bg-white p-6 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] md:p-7">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-5">
                                <div className="flex items-center gap-3 text-[#67d2c3]">
                                    <Users className="size-5" />
                                    <p className="text-sm font-black uppercase tracking-[0.15em]">Children</p>
                                </div>
                                <p className="mt-4 text-4xl font-black text-slate-900">{data.children_ids.length}</p>
                            </div>
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-5">
                                <div className="flex items-center gap-3 text-[#67d2c3]">
                                    <Clock3 className="size-5" />
                                    <p className="text-sm font-black uppercase tracking-[0.15em]">Exchange</p>
                                </div>
                                <p className="mt-4 text-2xl font-black text-slate-900">
                                    {data.exchange_day} at {data.exchange_time}
                                </p>
                            </div>
                            <div className="rounded-[1.45rem] bg-[#eef8f7] p-5">
                                <div className="flex items-center gap-3 text-[#67d2c3]">
                                    <CalendarDays className="size-5" />
                                    <p className="text-sm font-black uppercase tracking-[0.15em]">Range</p>
                                </div>
                                <p className="mt-4 text-2xl font-black text-slate-900">{data.generate_until}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link
                                href={route('calendar', { workspace: workspace.id })}
                                className="inline-flex items-center justify-center rounded-[1.25rem] border border-[#d5e8e3] bg-white px-7 py-4 text-[1.05rem] font-black text-slate-600 shadow-sm"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-14 rounded-[1.25rem] bg-[#67d2c3] px-8 text-[1.05rem] font-black text-white shadow-sm"
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
