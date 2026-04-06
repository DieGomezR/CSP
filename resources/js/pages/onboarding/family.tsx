import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';

type ChildDraft = {
    name: string;
    birthdate: string;
    color: string;
};

type TimezoneOption = {
    label: string;
    value: string;
};

interface FamilyOnboardingProps {
    timezones: TimezoneOption[];
}

interface FamilyOnboardingForm {
    family_name: string;
    timezone: string;
    children: ChildDraft[];
}

const childColors = ['#4DBFAE', '#FF8A5B', '#5B8DEF', '#9B6BFF', '#F2C94C', '#EB5757'];

const createChild = (): ChildDraft => ({
    name: '',
    birthdate: '',
    color: childColors[0],
});

export default function FamilyOnboarding({ timezones }: FamilyOnboardingProps) {
    const { data, setData, post, processing, errors } = useForm<FamilyOnboardingForm>({
        family_name: '',
        timezone: timezones[0]?.value ?? 'America/New_York',
        children: [createChild()],
    });

    const updateChild = (index: number, patch: Partial<ChildDraft>) => {
        setData(
            'children',
            data.children.map((child, childIndex) => (childIndex === index ? { ...child, ...patch } : child)),
        );
    };

    const addChild = () => {
        setData('children', [...data.children, createChild()]);
    };

    const removeChild = (index: number) => {
        if (data.children.length === 1) {
            return;
        }

        setData(
            'children',
            data.children.filter((_, childIndex) => childIndex !== index),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('onboarding.family.store'));
    };

    return (
        <>
            <Head title="Set up your family" />

            <div className="min-h-screen bg-[linear-gradient(160deg,#f6fbf9_0%,#edf5ff_46%,#fff3e8_100%)] px-6 py-10 text-slate-900 lg:px-10">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
                    <section className="rounded-[2rem] border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/10">
                        <p className="text-xs font-semibold tracking-[0.24em] text-teal-300 uppercase">Family onboarding</p>
                        <h1 className="mt-4 text-4xl leading-tight font-black tracking-tight">Create the first real family workspace.</h1>
                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            This step creates the household, adds you as the owner, and seeds the child profiles the calendar will be built around.
                        </p>

                        <div className="mt-8 space-y-3">
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-teal-200 uppercase">What gets created</p>
                                <p className="mt-2 text-sm leading-6 text-slate-200">
                                    A `family` workspace, an owner membership for your account, and the initial child records for scheduling.
                                </p>
                            </div>
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-teal-200 uppercase">What comes next</p>
                                <p className="mt-2 text-sm leading-6 text-slate-200">
                                    After this, the next block is recurring calendar events, custody templates, and caregiver/co-parent invitations.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur md:p-8">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Step 1 of the build</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Set up your household</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                Keep this lean. We only need enough detail to initialize the household and make the dashboard real.
                            </p>
                        </div>

                        <form className="mt-8 space-y-8" onSubmit={submit}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="family_name">Family name</Label>
                                    <Input
                                        id="family_name"
                                        value={data.family_name}
                                        onChange={(event) => setData('family_name', event.target.value)}
                                        disabled={processing}
                                        placeholder="Smith Family"
                                    />
                                    <InputError message={errors.family_name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <select
                                        id="timezone"
                                        value={data.timezone}
                                        onChange={(event) => setData('timezone', event.target.value)}
                                        disabled={processing}
                                        className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {timezones.map((timezone) => (
                                            <option key={timezone.value} value={timezone.value}>
                                                {timezone.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.timezone} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-950">Children</h3>
                                        <p className="text-sm leading-6 text-slate-600">
                                            Add the first children that should appear in the family calendar.
                                        </p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={addChild} disabled={processing}>
                                        <Plus />
                                        Add child
                                    </Button>
                                </div>

                                {typeof errors.children === 'string' && <InputError message={errors.children} />}

                                <div className="space-y-4">
                                    {data.children.map((child, index) => (
                                        <article key={index} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold tracking-[0.18em] text-teal-700 uppercase">
                                                        Child {index + 1}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Name, birthdate, and color help make the schedule readable from day one.
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeChild(index)}
                                                    disabled={processing || data.children.length === 1}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>

                                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`child-name-${index}`}>Name</Label>
                                                    <Input
                                                        id={`child-name-${index}`}
                                                        value={child.name}
                                                        onChange={(event) => updateChild(index, { name: event.target.value })}
                                                        disabled={processing}
                                                        placeholder="Emma"
                                                    />
                                                    <InputError message={errors[`children.${index}.name`]} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor={`child-birthdate-${index}`}>Birthdate</Label>
                                                    <Input
                                                        id={`child-birthdate-${index}`}
                                                        type="date"
                                                        value={child.birthdate}
                                                        onChange={(event) => updateChild(index, { birthdate: event.target.value })}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors[`children.${index}.birthdate`]} />
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-2">
                                                <Label>Calendar color</Label>
                                                <div className="flex flex-wrap gap-3">
                                                    {childColors.map((color) => {
                                                        const isActive = child.color === color;

                                                        return (
                                                            <button
                                                                key={color}
                                                                type="button"
                                                                onClick={() => updateChild(index, { color })}
                                                                className={`h-10 w-10 rounded-full border-4 transition ${isActive ? 'scale-105 border-slate-950' : 'border-white hover:border-slate-300'}`}
                                                                style={{ backgroundColor: color }}
                                                                aria-label={`Select ${color} for child ${index + 1}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <InputError message={errors[`children.${index}.color`]} />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
                                <p className="max-w-xl text-sm leading-6 text-slate-600">
                                    You can add more children, co-parents, caregivers, and events later. This just creates the first real household
                                    shell.
                                </p>

                                <Button type="submit" size="lg" className="min-w-56" disabled={processing}>
                                    {processing && <LoaderCircle className="animate-spin" />}
                                    Create family workspace
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}
