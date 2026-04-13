import FamilyLayout from '@/components/family-layout';
import InputError from '@/components/input-error';
import { type ExpenseWorkspace } from '@/types/expenses';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

type Props = {
    mode: 'create' | 'edit';
    workspace: ExpenseWorkspace;
    workspaces: Array<{ id: number; name: string }>;
    categories: Array<{ value: string; label: string }>;
    participants: Array<{ value: number; label: string }>;
    children: Array<{ value: number; label: string }>;
    form: {
        workspace_id: number;
        child_id: number | null;
        shared_with_member_id: number | null;
        currency: string;
        amount: string;
        category: string;
        expense_date: string;
        description: string;
        other_party_share_percentage: number;
        receipt_url: string | null;
    };
    expense?: {
        id: number;
        status: string;
    };
};

export default function ExpenseFormPage({ mode, workspace, categories, participants, children, form, expense }: Props) {
    const pageTitle = mode === 'create' ? 'Add Expense' : 'Edit Expense';

    const formState = useForm({
        workspace_id: form.workspace_id,
        child_id: form.child_id ? String(form.child_id) : '',
        shared_with_member_id: form.shared_with_member_id ? String(form.shared_with_member_id) : '',
        currency: form.currency,
        amount: form.amount,
        category: form.category,
        expense_date: form.expense_date,
        description: form.description,
        other_party_share_percentage: form.other_party_share_percentage,
        receipt: null as File | null,
    });

    const splitPreview = useMemo(() => {
        const otherShare = Number(formState.data.other_party_share_percentage);
        return `${otherShare}%/${100 - otherShare}%`;
    }, [formState.data.other_party_share_percentage]);

    const submit = () => {
        const options = {
            forceFormData: true as const,
            preserveScroll: true,
        };

        if (mode === 'create') {
            formState.post(route('expenses.store'), options);
            return;
        }

        formState.transform((data) => ({
            ...data,
            _method: 'put',
        })).post(route('expenses.update', expense!.id), options);
    };

    return (
        <>
            <Head title={pageTitle} />

            <FamilyLayout activeTab="expenses" workspaceId={workspace.id}>
                <section className="mx-auto max-w-[70rem]">
                    <h1 className="text-[2.8rem] font-black tracking-tight text-slate-900 sm:text-[3.5rem]">{pageTitle}</h1>

                    <div className="mt-6 rounded-[1.9rem] border border-[#e5f2ef] bg-white p-7 shadow-[0_30px_70px_-56px_rgba(15,23,42,0.45)]">
                        <div className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                                <label className="grid gap-2">
                                    <span className="text-[1rem] font-black text-slate-700">Amount *</span>
                                    <div className="grid gap-3 md:grid-cols-[0.48fr_1fr]">
                                        <select value={formState.data.currency} onChange={(event) => formState.setData('currency', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none">
                                            <option value="USD">USD</option>
                                        </select>
                                        <input type="number" step="0.01" min="0.01" value={formState.data.amount} onChange={(event) => formState.setData('amount', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none" />
                                    </div>
                                    <InputError message={formState.errors.amount} />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-[1rem] font-black text-slate-700">Category *</span>
                                    <select value={formState.data.category} onChange={(event) => formState.setData('category', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none">
                                        <option value="">Select a category...</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={formState.errors.category} />
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                                <label className="grid gap-2">
                                    <span className="text-[1rem] font-black text-slate-700">Date *</span>
                                    <input type="date" value={formState.data.expense_date} onChange={(event) => formState.setData('expense_date', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none" />
                                    <InputError message={formState.errors.expense_date} />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-[1rem] font-black text-slate-700">Child</span>
                                    <select value={formState.data.child_id} onChange={(event) => formState.setData('child_id', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none">
                                        <option value="">No child selected</option>
                                        {children.map((child) => (
                                            <option key={child.value} value={child.value}>
                                                {child.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">Description</span>
                                <input type="text" value={formState.data.description} onChange={(event) => formState.setData('description', event.target.value)} placeholder="e.g., Doctor visit copay, Soccer registration" className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none" />
                            </label>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">{workspace.viewer.role === 'owner' ? 'Share With' : 'Shared With'}</span>
                                <select value={formState.data.shared_with_member_id} onChange={(event) => formState.setData('shared_with_member_id', event.target.value)} className="h-14 rounded-[1rem] border border-[#cfe9e4] px-4 text-[1rem] text-slate-700 outline-none" disabled={workspace.viewer.role !== 'owner'}>
                                    <option value="">Select member...</option>
                                    {participants.map((participant) => (
                                        <option key={participant.value} value={participant.value}>
                                            {participant.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-slate-400">
                                    {workspace.viewer.role === 'owner' ? 'Family owners can share an expense with any member.' : 'Family members can only share expenses with the family owner.'}
                                </p>
                                <InputError message={formState.errors.shared_with_member_id} />
                            </label>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[1rem] font-black text-slate-700">Split Ratio</span>
                                    <span className="text-[1.1rem] font-black text-slate-600">{splitPreview}</span>
                                </div>
                                <input type="range" min="0" max="100" step="1" value={formState.data.other_party_share_percentage} onChange={(event) => formState.setData('other_party_share_percentage', Number(event.target.value))} className="w-full accent-slate-700" />
                                <p className="text-sm text-slate-400">How much the other family member pays. 50% means the expense is split equally.</p>
                            </div>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">Receipt (optional)</span>
                                <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={(event) => formState.setData('receipt', event.target.files?.[0] ?? null)} className="rounded-[1rem] border border-[#cfe9e4] px-4 py-3 text-[0.95rem] text-slate-700 outline-none" />
                                {form.receipt_url && (
                                    <a href={form.receipt_url} target="_blank" className="text-sm font-semibold text-[#67d2c3]" rel="noreferrer">
                                        View current receipt
                                    </a>
                                )}
                                <p className="text-sm text-slate-400">Accepted: JPEG, PNG, GIF, WebP, PDF (max 10MB)</p>
                                <InputError message={formState.errors.receipt} />
                            </label>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button type="button" onClick={submit} disabled={formState.processing} className="inline-flex items-center rounded-[1rem] bg-[#67d2c3] px-7 py-3 text-[1rem] font-black text-white disabled:opacity-60">
                                    {mode === 'create' ? 'Add Expense' : 'Update Expense'}
                                </button>
                                <Link href={route('expenses.index', { workspace: workspace.id })} className="inline-flex items-center rounded-[1rem] bg-[#ff7f7f] px-7 py-3 text-[1rem] font-black text-white">
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </FamilyLayout>
        </>
    );
}
