import FamilyLayout from '@/components/family-layout';
import InputError from '@/components/input-error';
import { type MomentVisibilityOption, type MomentWorkspace } from '@/types/moments';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, Camera, Loader2, Lock, Upload, Users } from 'lucide-react';
import { type ChangeEvent, type DragEvent, type FormEvent, useEffect, useRef, useState } from 'react';

type Props = {
    workspace: MomentWorkspace;
    form: {
        workspace_id: number;
        caption: string;
        taken_on: string | null;
        visibility: string;
    };
    visibilityOptions: MomentVisibilityOption[];
};

const visibilityIcons: Record<string, typeof Users> = {
    family: Users,
    private: Lock,
};

export default function CreateMomentPage({ workspace, form, visibilityOptions }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const formState = useForm({
        workspace_id: form.workspace_id,
        photo: null as File | null,
        caption: form.caption,
        taken_on: form.taken_on ?? '',
        visibility: form.visibility,
    });

    useEffect(() => {
        return () => {
            if (previewUrl !== null) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const applySelectedFile = (file: File | null) => {
        if (previewUrl !== null) {
            URL.revokeObjectURL(previewUrl);
        }

        formState.setData('photo', file);
        setPreviewUrl(file !== null ? URL.createObjectURL(file) : null);
    };

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        applySelectedFile(event.target.files?.[0] ?? null);
    };

    const onDrop = (event: DragEvent<HTMLButtonElement>) => {
        event.preventDefault();
        applySelectedFile(event.dataTransfer.files?.[0] ?? null);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        formState.post(route('moments.store'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Share a Moment" />

            <FamilyLayout activeTab="moments" workspaceId={workspace.id}>
                <section className="mx-auto max-w-[44rem]">
                    <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#67d2c3]">Moments</p>
                        <h1 className="mt-3 text-[2.6rem] font-black tracking-tight text-slate-900 sm:text-[3.1rem]">Share a Moment</h1>
                        <p className="mt-3 text-[1.05rem] leading-7 text-slate-500">
                            Capture a memory and decide whether it stays just with you or becomes part of the shared family timeline.
                        </p>
                    </div>

                    <form
                        onSubmit={submit}
                        className="mt-8 rounded-[2rem] border border-[#e3f0ee] bg-white p-5 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:p-8"
                    >
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={onDrop}
                                    className="group overflow-hidden rounded-[1.75rem] border-2 border-dashed border-[#7ed8cb] bg-[#f1fbfa] p-4 transition hover:border-[#67d2c3] hover:bg-[#eefaf8]"
                                >
                                    {previewUrl !== null ? (
                                        <div className="grid gap-4">
                                            <img
                                                src={previewUrl}
                                                alt="Moment preview"
                                                className="h-[20rem] w-full rounded-[1.35rem] object-cover shadow-sm"
                                            />
                                            <div className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[#67d2c3] px-5 py-3 text-sm font-black text-white">
                                                <Upload className="size-4" />
                                                Change Photo
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-[1.5rem] px-4 text-center">
                                            <div className="rounded-full bg-white p-4 text-[#67d2c3] shadow-sm">
                                                <Camera className="size-9" />
                                            </div>
                                            <div>
                                                <p className="text-[1.45rem] font-black tracking-tight text-slate-900">Tap to select a photo</p>
                                                <p className="mt-2 text-sm text-slate-500">or drag and drop here</p>
                                            </div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">JPEG, PNG, GIF or WebP up to 10 MB</p>
                                        </div>
                                    )}
                                </button>

                                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onFileChange} className="hidden" />
                                <InputError message={formState.errors.photo} />
                            </div>

                            <label className="grid gap-2">
                                <span className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Caption</span>
                                <textarea
                                    value={formState.data.caption}
                                    onChange={(event) => formState.setData('caption', event.target.value)}
                                    rows={3}
                                    placeholder="Add a caption to your moment..."
                                    className="rounded-[1.25rem] border border-[#cfe9e4] px-4 py-3 text-[1rem] text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#67d2c3]"
                                />
                                <InputError message={formState.errors.caption} />
                            </label>

                            <label className="grid gap-2">
                                <span className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">When was this taken?</span>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formState.data.taken_on}
                                        max={new Date().toISOString().slice(0, 10)}
                                        onChange={(event) => formState.setData('taken_on', event.target.value)}
                                        className="h-14 w-full rounded-[1.25rem] border border-[#cfe9e4] px-4 pr-12 text-[1rem] text-slate-700 outline-none transition focus:border-[#67d2c3]"
                                    />
                                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                                </div>
                                <InputError message={formState.errors.taken_on} />
                            </label>

                            <div className="grid gap-3">
                                <span className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Who can see this?</span>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {visibilityOptions.map((option) => {
                                        const Icon = visibilityIcons[option.value] ?? Users;
                                        const isActive = formState.data.visibility === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => formState.setData('visibility', option.value)}
                                                className={`rounded-[1.45rem] border px-5 py-5 text-left transition ${
                                                    isActive
                                                        ? 'border-[#67d2c3] bg-[#eefbfa] shadow-[0_20px_40px_-28px_rgba(103,210,195,0.9)]'
                                                        : 'border-[#ddeceb] bg-white hover:border-[#67d2c3]'
                                                }`}
                                            >
                                                <div className="inline-flex rounded-full bg-[#f1fbfa] p-3 text-[#67d2c3]">
                                                    <Icon className="size-5" />
                                                </div>
                                                <p className="mt-4 text-[1.05rem] font-black text-slate-900">{option.label}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={formState.errors.visibility} />
                            </div>

                            <div className="flex flex-col gap-3 border-t border-[#e6f1f0] pt-2 sm:flex-row sm:justify-end">
                                <Link
                                    href={route('moments.index', { workspace: workspace.id })}
                                    className="inline-flex min-h-[3.5rem] items-center justify-center rounded-[1.25rem] border border-[#d7e7e4] px-6 text-[1rem] font-black text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={formState.processing || formState.data.photo === null}
                                    className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-[1.25rem] bg-[#67d2c3] px-7 text-[1rem] font-black text-white shadow-sm transition hover:bg-[#5dc9ba] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {formState.processing ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Sharing...
                                        </>
                                    ) : (
                                        'Share Moment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </FamilyLayout>
        </>
    );
}
