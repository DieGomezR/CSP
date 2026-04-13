export type ExpenseWorkspaceMember = {
    id: number;
    user_id: number;
    name: string | null;
    email: string | null;
    role: string;
    joined_at: string | null;
};

export type ExpenseWorkspace = {
    id: number;
    name: string;
    timezone: string;
    children_count: number;
    members_count: number;
    events_count: number;
    members: ExpenseWorkspaceMember[];
    children: Array<{
        id: number;
        name: string;
        color: string;
        birthdate: string | null;
    }>;
    viewer: {
        member_id: number;
        role: string;
    };
};

export type ExpenseSummaryCard = {
    member_id: number;
    name: string;
    role: string;
    paid: string;
    owes: string;
    net: string;
    net_direction: 'is_owed' | 'owes' | 'settled';
    status_label: string;
};

export type ExpenseRecord = {
    id: number;
    date: string | null;
    description: string;
    category: string;
    child: string | null;
    amount: string;
    currency: string;
    split: number;
    added_by: string;
    status: string;
    status_value: 'pending' | 'accepted';
    can_accept: boolean;
    can_reopen: boolean;
    can_edit: boolean;
    can_delete: boolean;
    edit_url: string;
};
