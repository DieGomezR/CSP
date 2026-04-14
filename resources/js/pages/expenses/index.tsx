import FamilyLayout from '@/components/family-layout';
import { useUserRealtimeSync } from '@/hooks/use-user-realtime-sync';
import { type SharedData } from '@/types';
import { type ExpenseRecord, type ExpenseSummaryCard, type ExpenseWorkspace } from '@/types/expenses';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Pencil, RotateCcw, Trash2, Wallet } from 'lucide-react';
import { type FormEvent, useCallback } from 'react';

type Props = {
    workspace: ExpenseWorkspace;
    workspaces: Array<{ id: number; name: string }>;
    summary: {
        members: ExpenseSummaryCard[];
        total_unsettled: string;
    };
    filters: {
        category: string | null;
        status: string | null;
        from: string | null;
        to: string | null;
    };
    categories: Array<{ value: string; label: string }>;
    expenses: ExpenseRecord[];
};

export default function ExpensesIndex({ workspace, summary, filters, categories, expenses }: Props) {
    const { flash, auth } = usePage<SharedData>().props;

    const submitFilter = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        router.get(
            route('expenses.index'),
            {
                workspace: workspace.id,
                category: formData.get('category') || undefined,
                status: formData.get('status') || undefined,
                from: formData.get('from') || undefined,
                to: formData.get('to') || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        router.get(route('expenses.index'), { workspace: workspace.id }, { preserveScroll: true, preserveState: true });
    };

    const acceptExpense = (expenseId: number) => {
        router.post(route('expenses.accept', expenseId), {}, { preserveScroll: true });
    };

    const reopenExpense = (expenseId: number) => {
        router.post(route('expenses.reopen', expenseId), {}, { preserveScroll: true });
    };

    const deleteExpense = (expenseId: number) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        router.delete(route('expenses.destroy', expenseId), { preserveScroll: true });
    };

    const handleRealtimeSync = useCallback(
        (payload: { domain: string; workspace_id: number; actor_user_id?: number | null }) => {
            if (payload.domain !== 'expenses' || payload.workspace_id !== workspace.id || payload.actor_user_id === auth.user.id) {
                return;
            }

            router.reload({
                only: ['summary', 'expenses'],
                preserveScroll: true,
                preserveState: true,
            });
        },
        [auth.user.id, workspace.id],
    );

    useUserRealtimeSync(handleRealtimeSync);

    return (
        <>
            <Head title="Expenses" />

            <FamilyLayout activeTab="expenses" workspaceId={workspace.id}>
                {flash.status && (
                    <div className="mb-5 rounded-[1.35rem] border border-[#8ad7bd] bg-[#e7faf2] px-4 py-4 text-sm font-semibold text-[#4aa17f] shadow-sm sm:text-[1.05rem]">
                        {flash.status}
                    </div>
                )}

                <section className="mx-auto max-w-[70rem]">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h1 className="text-[2.8rem] font-black tracking-tight text-slate-900 sm:text-[3.5rem]">Shared Expenses</h1>

                        <Link
                            href={route('expenses.create', { workspace: workspace.id })}
                            className="inline-flex items-center rounded-[1.2rem] bg-[#67d2c3] px-6 py-3 text-[1rem] font-black text-white shadow-sm transition hover:bg-[#58c5b6]"
                        >
                            + Add Expense
                        </Link>
                    </div>

                    <div className="mt-6 rounded-[1.9rem] border border-[#e5f2ef] bg-white p-7 shadow-[0_30px_70px_-56px_rgba(15,23,42,0.45)]">
                        <div className="mb-6 flex items-center gap-3 text-[#dd8f43]">
                            <Wallet className="size-5" />
                        </div>

                        <div className={`grid gap-6 ${summary.members.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                            {summary.members.map((member) => (
                                <article key={member.member_id} className="rounded-[1.5rem] bg-white">
                                    <h2 className="text-[1.45rem] font-black text-slate-900">{member.name}</h2>
                                    <dl className="mt-3 space-y-1 text-[1.05rem] text-slate-500">
                                        <div>
                                            <dt className="inline">Paid:</dt> <dd className="inline">${member.paid}</dd>
                                        </div>
                                        <div>
                                            <dt className="inline">Owes:</dt> <dd className="inline">${member.owes}</dd>
                                        </div>
                                    </dl>

                                    <p
                                        className={`mt-5 text-[1.55rem] font-black ${
                                            member.net_direction === 'is_owed'
                                                ? 'text-[#80dd8d]'
                                                : member.net_direction === 'owes'
                                                  ? 'text-[#ffb0bc]'
                                                  : 'text-slate-700'
                                        }`}
                                    >
                                        {member.net_direction === 'settled' ? member.status_label : `${member.status_label} $${member.net}`}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <p className="mt-8 text-[1.05rem] font-semibold text-slate-500">
                            Total Unsettled: <span className="font-black text-slate-900">${summary.total_unsettled}</span>
                        </p>
                    </div>

                    <form
                        onSubmit={submitFilter}
                        className="mt-6 rounded-[1.9rem] border border-[#e5f2ef] bg-white p-7 shadow-[0_30px_70px_-56px_rgba(15,23,42,0.45)]"
                    >
                        <div className="grid gap-4 md:grid-cols-[1.15fr_0.8fr_1fr_1fr_auto] md:items-end">
                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">Category</span>
                                <select name="category" defaultValue={filters.category ?? ''} className="h-12 rounded-[1rem] border border-[#cfe9e4] bg-white px-4 text-[1rem] text-slate-700 outline-none">
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">Status</span>
                                <select name="status" defaultValue={filters.status ?? ''} className="h-12 rounded-[1rem] border border-[#cfe9e4] bg-white px-4 text-[1rem] text-slate-700 outline-none">
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Settled</option>
                                </select>
                            </label>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">From</span>
                                <input type="date" name="from" defaultValue={filters.from ?? ''} className="h-12 rounded-[1rem] border border-[#cfe9e4] bg-white px-4 text-[1rem] text-slate-700 outline-none" />
                            </label>

                            <label className="grid gap-2">
                                <span className="text-[1rem] font-black text-slate-700">To</span>
                                <input type="date" name="to" defaultValue={filters.to ?? ''} className="h-12 rounded-[1rem] border border-[#cfe9e4] bg-white px-4 text-[1rem] text-slate-700 outline-none" />
                            </label>

                            <div className="flex gap-3">
                                <button type="submit" className="inline-flex h-12 items-center rounded-[1rem] bg-[#67d2c3] px-7 text-[1rem] font-black text-white">
                                    Filter
                                </button>
                                <button type="button" onClick={clearFilters} className="inline-flex h-12 items-center rounded-[1rem] bg-[#ff7f7f] px-7 text-[1rem] font-black text-white">
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 overflow-hidden rounded-[1.9rem] border border-[#e5f2ef] bg-white shadow-[0_30px_70px_-56px_rgba(15,23,42,0.45)]">
                        {expenses.length === 0 ? (
                            <div className="px-7 py-8 text-[1.05rem] text-[#99b3bb]">
                                No expenses found. <span className="font-semibold text-[#67d2c3]">Add your first expense</span> to get started tracking shared costs.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-[#f7f7f7] text-left">
                                        <tr className="text-[1rem] font-black text-slate-700">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Child</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Split</th>
                                            <th className="px-6 py-4">Added By</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map((expense) => (
                                            <tr key={expense.id} className="border-t border-[#edf3f2] align-top text-[1rem] text-slate-600">
                                                <td className="px-6 py-5 font-medium text-slate-500">{expense.date}</td>
                                                <td className="px-6 py-5">{expense.description}</td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex rounded-full bg-[#eef3ff] px-3 py-1 text-sm font-semibold text-[#7f9ad6]">{expense.category}</span>
                                                </td>
                                                <td className="px-6 py-5">{expense.child ?? '—'}</td>
                                                <td className="px-6 py-5 font-semibold text-slate-700">{expense.currency} {expense.amount}</td>
                                                <td className="px-6 py-5">{expense.split}%</td>
                                                <td className="px-6 py-5">{expense.added_by}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${expense.status_value === 'accepted' ? 'bg-[#e6f8ec] text-[#69b884]' : 'bg-[#fff4df] text-[#d39a2d]'}`}>
                                                        {expense.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {expense.can_accept && (
                                                            <button type="button" onClick={() => acceptExpense(expense.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#67d2c3] text-white" title="Accept expense">
                                                                <Check className="size-4" />
                                                            </button>
                                                        )}
                                                        {expense.can_reopen && (
                                                            <button type="button" onClick={() => reopenExpense(expense.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#67d2c3] text-white" title="Undo expense">
                                                                <RotateCcw className="size-4" />
                                                            </button>
                                                        )}
                                                        {expense.can_edit && (
                                                            <Link href={expense.edit_url} className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#ff9f9f] text-white" title="Edit expense">
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        )}
                                                        {expense.can_delete && (
                                                            <button type="button" onClick={() => deleteExpense(expense.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#67d2c3] text-white" title="Delete expense">
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </FamilyLayout>
        </>
    );
}
