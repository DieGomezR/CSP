import FamilyLayout from '@/components/family-layout';
import { type SharedData } from '@/types';
import type {
    ActivityItem,
    WorkspaceChild,
    WorkspaceMember,
    WorkspacePayload,
    WorkspacePendingInvitation,
} from '@/types/family';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CalendarDays,
    Check,
    ClipboardList,
    CreditCard,
    Loader2,
    Lock,
    Mail,
    Palette,
    Pencil,
    RotateCcw,
    Settings2,
    Sparkles,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardProps {
    workspace: WorkspacePayload;
    recentActivity: ActivityItem[];
}

type DashboardTheme = 'warm' | 'modern' | 'minimal';
type MemberRole = 'coparent' | 'member' | 'caregiver';

type ChildFormState = {
    name: string;
    birthdate: string;
    color: string;
};

type MemberFormState = {
    firstName: string;
    lastName: string;
    email: string;
    role: MemberRole;
    sendInvite: boolean;
};

const appearanceThemes = [
    { id: 'warm', title: 'Warm & Friendly', subtitle: 'Soft, rounded, inviting' },
    { id: 'modern', title: 'Modern', subtitle: 'Dense, compact, dashboard' },
    { id: 'minimal', title: 'Minimal', subtitle: 'Flat, no cards, ultra-compact' },
] as const;

const memberRoleOptions: Array<{ value: MemberRole; label: string }> = [
    { value: 'coparent', label: 'Co-parent' },
    { value: 'member', label: 'Family member' },
    { value: 'caregiver', label: 'Caregiver' },
];

const createDefaultChildForm = (): ChildFormState => ({
    name: '',
    birthdate: '',
    color: '#67d2c3',
});

const createDefaultMemberForm = (): MemberFormState => ({
    firstName: '',
    lastName: '',
    email: '',
    role: 'coparent',
    sendInvite: true,
});

function SectionCard({
    id,
    title,
    icon: Icon,
    action,
    children,
    theme = 'warm',
}: {
    id?: string;
    title: string;
    icon: typeof CalendarDays;
    action?: React.ReactNode;
    children: React.ReactNode;
    theme?: DashboardTheme;
}) {
    const radiusMap = {
        warm: 'rounded-[2rem]',
        modern: 'rounded-xl',
        minimal: 'rounded-none',
    };

    return (
        <section
            id={id}
            className={`${radiusMap[theme]} border border-[#edf3f2] bg-white p-4 shadow-[0_26px_60px_-52px_rgba(15,23,42,0.38)] sm:p-6 md:p-7`}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#f6fbfb] p-2.5 text-[#a38fc9]">
                        <Icon className="size-5" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-[2rem]">{title}</h2>
                </div>
                {action}
            </div>

            <div className="mt-4 sm:mt-6">{children}</div>
        </section>
    );
}

function QuickActionCard({
    href,
    onClick,
    title,
    icon: Icon,
    upgrade = false,
    theme = 'warm',
}: {
    href?: string;
    onClick?: () => void;
    title: string;
    icon: typeof CalendarDays;
    upgrade?: boolean;
    theme?: DashboardTheme;
}) {
    const radiusMap = {
        warm: 'rounded-[1.7rem]',
        modern: 'rounded-xl',
        minimal: 'rounded-none',
    };

    const baseClasses = `group flex min-h-[112px] w-full flex-col items-center justify-center ${radiusMap[theme]} px-4 py-6 text-center transition sm:min-h-[160px] sm:px-6 sm:py-8`;
    const cardClasses = upgrade
        ? `${baseClasses} border-2 border-dashed border-[#ffb21a] bg-[#fff8e6] hover:border-[#e6a016] hover:bg-[#fff4d6]`
        : `${baseClasses} border border-[#dceceb] bg-[#eaf8f7] hover:border-[#8ed7ca] hover:bg-[#effaf8]`;

    const content = (
        <>
            <div className={`rounded-full p-3 shadow-sm transition group-hover:scale-105 ${upgrade ? 'bg-[#ffb21a]/20 text-[#b07c1a]' : 'bg-white/80 text-[#9b8fd0]'}`}>
                <Icon className="size-6" />
            </div>
            <p className={`mt-3 text-xl font-black tracking-tight sm:mt-5 sm:text-[1.85rem] ${upgrade ? 'text-[#b07c1a]' : 'text-slate-900'}`}>{title}</p>
        </>
    );

    if (onClick || !href) {
        return (
            <button type="button" onClick={onClick} disabled={!onClick} className={`${cardClasses} disabled:cursor-not-allowed disabled:opacity-70`}>
                {content}
            </button>
        );
    }

    return (
        <a href={href} className={cardClasses}>
            {content}
        </a>
    );
}

function DetailField({ label, value, theme = 'warm' }: { label: string; value: string; theme?: DashboardTheme }) {
    const radiusMap = {
        warm: 'rounded-[1.2rem]',
        modern: 'rounded-lg',
        minimal: 'rounded-none',
    };

    return (
        <div className="grid gap-2 sm:gap-3">
            <p className="text-sm font-bold text-slate-400 sm:text-base">{label}</p>
            <div className={`${radiusMap[theme]} border border-[#cfe9e4] bg-white px-3 py-3 text-base font-semibold text-slate-800 sm:px-4 sm:py-4 sm:text-[1.15rem]`}>
                {value}
            </div>
        </div>
    );
}

function AppearanceCard({
    title,
    subtitle,
    active,
    disabled,
    onClick,
    theme,
}: {
    title: string;
    subtitle: string;
    active: boolean;
    disabled: boolean;
    onClick: () => void;
    theme: DashboardTheme;
}) {
    const radiusMap = {
        warm: 'rounded-[1.45rem]',
        modern: 'rounded-xl',
        minimal: 'rounded-none',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left ${radiusMap[theme]} border px-4 py-4 transition disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:py-5 ${
                active ? 'border-[#67d2c3] bg-[#eefbfa]' : 'border-[#dcecec] bg-white hover:border-[#67d2c3]'
            }`}
        >
            <div className={`${radiusMap[theme]} border border-slate-200 bg-[#f9fbfc] p-3`}>
                <div className="space-y-2">
                    <div className="h-2 w-18 rounded-full bg-[#76d4c8]" />
                    <div className="h-2 w-26 rounded-full bg-slate-200" />
                </div>
            </div>
            <p className="mt-3 text-base font-black tracking-tight text-slate-900 sm:mt-4 sm:text-xl">{title}</p>
            <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base">{subtitle}</p>
        </button>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    return (
        <div className={`grid grid-cols-[auto_1fr] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 ${item.highlighted ? 'bg-[#eef8f7]' : 'bg-white'}`}>
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e9ff] text-[#5b8def]">
                <ClipboardList className="size-4" />
            </div>
            <div className="min-w-0 border-b border-[#e7f0ef] pb-3 last:border-b-0 last:pb-0 sm:pb-4 sm:last:pb-0">
                <p className="text-base font-semibold text-slate-900 sm:text-xl">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:gap-3 sm:text-base">
                    <span>{item.detail}</span>
                    <span>{item.relative_time}</span>
                </div>
            </div>
        </div>
    );
}

function ModalShell({
    title,
    children,
    onClose,
    disableClose = false,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    disableClose?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#e4f1ef] pb-4">
                    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={disableClose}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#67d2c3] text-white disabled:opacity-60"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

function formatDate(date: string | null, options?: Intl.DateTimeFormatOptions) {
    if (!date) {
        return null;
    }

    return new Date(date).toLocaleDateString('en-US', options ?? {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatMemberRole(role: string) {
    return role
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function normalizeMemberRole(role: string): MemberRole {
    if (role === 'coparent' || role === 'member' || role === 'caregiver') {
        return role;
    }

    return 'member';
}

export default function Dashboard({ workspace, recentActivity }: DashboardProps) {
    const { auth, appearance, flash, workspaceAccess } = usePage<SharedData>().props;
    const workspaceTitle = workspace.name.replace(/family$/i, '').trim() || workspace.name;
    const custodyWizardHref = route('calendar.schedule-wizard', { workspace: workspace.id });
    const calendarHref = route('calendar', { workspace: workspace.id });
    const canManageCustody = (workspaceAccess?.abilities?.['custody.manage'] ?? false) && (workspaceAccess?.features?.['custody_schedule_templates'] ?? false);
    const canManageBilling = workspaceAccess?.abilities?.['billing.manage'] ?? false;
    const isOwner = workspaceAccess?.is_owner ?? false;
    const savedTheme = appearance?.theme ?? 'warm';
    const transitionTime = workspace.custody_schedule.exchange_time
        ? new Date(`1970-01-01T${workspace.custody_schedule.exchange_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
          })
        : '6:00 PM';

    const [activeTheme, setActiveTheme] = useState<DashboardTheme>(savedTheme);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const [isAddChildOpen, setIsAddChildOpen] = useState(false);
    const [newChild, setNewChild] = useState<ChildFormState>(createDefaultChildForm);
    const [childToEdit, setChildToEdit] = useState<WorkspaceChild | null>(null);
    const [editChild, setEditChild] = useState<ChildFormState>(createDefaultChildForm);
    const [childToDelete, setChildToDelete] = useState<WorkspaceChild | null>(null);

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [newMember, setNewMember] = useState<MemberFormState>(createDefaultMemberForm);
    const [memberToEdit, setMemberToEdit] = useState<WorkspaceMember | null>(null);
    const [editMemberRole, setEditMemberRole] = useState<MemberRole>('coparent');
    const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
    const [invitationToCancel, setInvitationToCancel] = useState<WorkspacePendingInvitation | null>(null);

    useEffect(() => {
        setActiveTheme(savedTheme);
    }, [savedTheme]);

    const isPending = (action: string) => pendingAction === action;
    const canManageMembers = isOwner && canManageBilling;
    const upgradeHref = route('billing', {
        plan: 'complete',
        mode: workspaceAccess?.subscription?.billing_mode ?? 'family',
    });

    const quickActions: Array<{
        title: string;
        href?: string;
        onClick?: () => void;
        icon: typeof CalendarDays;
        upgrade?: boolean;
    }> = [
        { title: 'View Calendar', href: calendarHref, icon: CalendarDays },
        {
            title: workspace.setup.custody_schedule_completed ? 'View Schedule' : 'Setup Schedule',
            href: canManageCustody
                ? (workspace.setup.custody_schedule_completed ? calendarHref : custodyWizardHref)
                : upgradeHref,
            icon: Settings2,
            upgrade: !canManageCustody,
        },
        { title: 'Add Child', onClick: () => setIsAddChildOpen(true), icon: Sparkles },
        {
            title: 'Add Parent',
            href: canManageMembers ? '#family-members' : undefined,
            onClick: canManageMembers ? () => setIsAddMemberOpen(true) : undefined,
            icon: UserPlus,
            upgrade: !canManageMembers,
        },
        { title: 'Caregivers', href: '#family-members', icon: Users },
        {
            title: 'Billing',
            href: canManageBilling ? route('billing') : undefined,
            icon: CreditCard,
            upgrade: !canManageBilling,
        },
        { title: 'Log Transfer', href: '#recent-activity', icon: ClipboardList },
    ];

    const resetChildCreateForm = () => setNewChild(createDefaultChildForm());
    const resetMemberCreateForm = () => setNewMember(createDefaultMemberForm());

    const handleAddChild = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPendingAction('add-child');

        router.post(
            route('children.store', { workspace: workspace.id }),
            {
                name: newChild.name,
                color: newChild.color,
                birthdate: newChild.birthdate || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    resetChildCreateForm();
                    setIsAddChildOpen(false);
                },
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const openChildEditor = (child: WorkspaceChild) => {
        setChildToEdit(child);
        setEditChild({
            name: child.name,
            birthdate: child.birthdate ?? '',
            color: child.color,
        });
    };

    const handleEditChild = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!childToEdit) {
            return;
        }

        setPendingAction('edit-child');

        router.put(
            route('children.update', { workspace: workspace.id, child: childToEdit.id }),
            {
                name: editChild.name,
                color: editChild.color,
                birthdate: editChild.birthdate || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setChildToEdit(null);
                    setEditChild(createDefaultChildForm());
                },
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const handleDeleteChild = () => {
        if (!childToDelete) {
            return;
        }

        setPendingAction('delete-child');

        router.delete(route('children.destroy', { workspace: workspace.id, child: childToDelete.id }), {
            preserveScroll: true,
            onSuccess: () => setChildToDelete(null),
            onFinish: () => setPendingAction(null),
        });
    };

    const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPendingAction('add-member');

        router.post(
            route('workspace.members.store', { workspace: workspace.id }),
            {
                first_name: newMember.firstName,
                last_name: newMember.lastName,
                email: newMember.email,
                role: newMember.role,
                send_invite: newMember.sendInvite,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    resetMemberCreateForm();
                    setIsAddMemberOpen(false);
                },
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const openMemberEditor = (member: WorkspaceMember) => {
        setMemberToEdit(member);
        setEditMemberRole(normalizeMemberRole(member.role));
    };

    const handleEditMember = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!memberToEdit) {
            return;
        }

        setPendingAction('edit-member');

        router.put(
            route('workspace.members.update', { workspace: workspace.id, member: memberToEdit.id }),
            {
                role: editMemberRole,
            },
            {
                preserveScroll: true,
                onSuccess: () => setMemberToEdit(null),
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const handleRemoveMember = () => {
        if (!memberToRemove) {
            return;
        }

        setPendingAction('remove-member');

        router.delete(route('workspace.members.destroy', { workspace: workspace.id, member: memberToRemove.id }), {
            preserveScroll: true,
            onSuccess: () => setMemberToRemove(null),
            onFinish: () => setPendingAction(null),
        });
    };

    const handleThemeChange = (theme: DashboardTheme) => {
        const previousTheme = activeTheme;

        setActiveTheme(theme);
        setPendingAction('theme');

        router.post(
            route('appearance.store'),
            {
                theme,
            },
            {
                preserveScroll: true,
                onError: () => setActiveTheme(previousTheme),
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const handleResendInvitation = (invitation: WorkspacePendingInvitation) => {
        setPendingAction(`resend-invitation-${invitation.id}`);

        router.post(
            route('workspace.invitations.resend', { workspace: workspace.id, invitation: invitation.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const handleCancelInvitation = () => {
        if (!invitationToCancel) {
            return;
        }

        setPendingAction('cancel-invitation');

        router.post(
            route('workspace.invitations.cancel', { workspace: workspace.id, invitation: invitationToCancel.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setInvitationToCancel(null),
                onFinish: () => setPendingAction(null),
            },
        );
    };

    return (
        <>
            <Head title="Family Dashboard" />

            <FamilyLayout activeTab="dashboard" workspaceId={workspace.id}>
                <section className="flex flex-col gap-4 border-b border-[#dceceb] px-4 pb-4 sm:px-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-[2.8rem]">{workspaceTitle}</h1>
                        {isOwner && (
                            <button
                                type="button"
                                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-[#67d2c3] text-white shadow-sm sm:h-11 sm:w-11"
                            >
                                <Pencil className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className="inline-flex rounded-full bg-white p-1.5 shadow-sm">
                        <button type="button" className="rounded-full bg-[#67d2c3] px-4 py-2 text-sm font-black text-slate-900 sm:px-6 sm:py-3 sm:text-[1.05rem]">
                            Dashboard
                        </button>
                        <Link href={calendarHref} className="rounded-full px-4 py-2 text-sm font-black text-slate-400 sm:px-6 sm:py-3 sm:text-[1.05rem]">
                            Calendar
                        </Link>
                    </div>
                </section>

                {flash.status && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#caece6] bg-white px-4 py-3 text-sm font-semibold text-[#3da999] shadow-sm sm:mt-6 sm:px-5 sm:py-4 sm:text-[1.05rem]">
                        {flash.status}
                    </div>
                )}
                {flash.error && (
                    <div className="mx-4 mt-4 rounded-[1.35rem] border border-[#f8d7da] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#b0243a] shadow-sm sm:mt-6 sm:px-5 sm:py-4 sm:text-[1.05rem]">
                        {flash.error}
                    </div>
                )}

                <section className="mx-4 mt-4 grid gap-3 sm:mx-6 sm:mt-6 sm:gap-4 md:grid-cols-2">
                    {quickActions.map((action) => (
                        <QuickActionCard
                            key={action.title}
                            href={action.href}
                            onClick={action.onClick}
                            title={action.title}
                            icon={action.icon}
                            upgrade={action.upgrade}
                            theme={activeTheme}
                        />
                    ))}
                </section>

                <div className="mx-4 mt-4 space-y-4 px-0 sm:mx-6 sm:mt-6 sm:space-y-6">
                    <SectionCard
                        id="children"
                        title="Children"
                        icon={Sparkles}
                        action={
                            <button
                                type="button"
                                onClick={() => setIsAddChildOpen(true)}
                                className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white shadow-sm sm:px-6 sm:py-3 sm:text-[1.1rem]"
                            >
                                + Add
                            </button>
                        }
                        theme={activeTheme}
                    >
                        {workspace.children.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {workspace.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex flex-col gap-3 rounded-[1.4rem] bg-[#eef8f7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white sm:h-14 sm:w-14 sm:text-xl"
                                                style={{ backgroundColor: child.color }}
                                            >
                                                {child.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black tracking-tight text-slate-900 sm:text-[1.45rem]">{child.name}</p>
                                                <p className="text-sm text-slate-400 sm:text-base">
                                                    {formatDate(child.birthdate) ?? 'Birthdate not added yet'}
                                                </p>
                                            </div>
                                        </div>
                                        {isOwner && (
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openChildEditor(child)}
                                                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setChildToDelete(child)}
                                                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.4rem] bg-[#fbfefe] px-4 py-8 text-center text-base text-slate-400 sm:px-5 sm:py-12 sm:text-[1.2rem]">
                                No children added yet
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard
                        id="family-members"
                        title="Family Members"
                        icon={Users}
                        action={
                            canManageMembers && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddMemberOpen(true)}
                                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white shadow-sm sm:px-6 sm:py-3 sm:text-[1.1rem]"
                                >
                                    + Add
                                </button>
                            )
                        }
                        theme={activeTheme}
                    >
                        <div className="space-y-3 sm:space-y-4">
                            {workspace.members.map((member, index) => {
                                const isCurrentUser = member.user_id === auth.user.id;
                                const avatarPalette = ['#5B8DEF', '#FF7D7D', '#67D2C3', '#9B6BFF'];
                                const avatarColor = avatarPalette[index % avatarPalette.length];

                                return (
                                    <div
                                        key={member.id}
                                        className="flex flex-col gap-3 rounded-[1.4rem] bg-[#eef8f7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white sm:h-14 sm:w-14 sm:text-xl"
                                                style={{ backgroundColor: avatarColor }}
                                            >
                                                {(member.name ?? member.email ?? '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-lg font-black tracking-tight text-slate-900 sm:text-[1.45rem]">
                                                    {member.name ?? 'Unknown member'}{' '}
                                                    <span className="text-sm font-semibold text-slate-400 sm:text-base">
                                                        {isCurrentUser ? 'You' : formatMemberRole(member.role)}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-slate-400 sm:text-base">{member.email ?? 'No email on file'}</p>
                                            </div>
                                        </div>

                                        {!isCurrentUser && canManageMembers && (
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openMemberEditor(member)}
                                                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMemberToRemove(member)}
                                                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}

                                        {isCurrentUser && !isOwner && (
                                            <div className="text-sm font-semibold text-[#67d2c3] sm:text-base">You</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {canManageMembers && workspace.pending_invitations.length > 0 && (
                            <div className="mt-6 rounded-[1.4rem] border border-[#dceceb] bg-[#fbfefe] p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-[#eef8ff] p-2 text-[#5B8DEF]">
                                        <Mail className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black tracking-tight text-slate-900 sm:text-[1.3rem]">Pending Invitations</p>
                                        <p className="text-sm text-slate-400 sm:text-base">These contacts still need to accept their invitation.</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {workspace.pending_invitations.map((invitation) => (
                                        <div
                                            key={invitation.id}
                                            className="flex flex-col gap-3 rounded-[1.2rem] border border-[#e4f1ef] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="text-base font-black text-slate-900 sm:text-[1.1rem]">{invitation.email}</p>
                                                <p className="mt-1 text-sm text-slate-400 sm:text-base">
                                                    {formatMemberRole(invitation.role)} · Invited {formatDate(invitation.invited_at)}
                                                    {invitation.expires_at ? ` · Expires ${formatDate(invitation.expires_at)}` : ''}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleResendInvitation(invitation)}
                                                    disabled={isPending(`resend-invitation-${invitation.id}`)}
                                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white disabled:opacity-60 sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    {isPending(`resend-invitation-${invitation.id}`) ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                                                    Resend
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setInvitationToCancel(invitation)}
                                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-black text-white sm:px-5 sm:py-3 sm:text-base"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard id="settings" title="Settings" icon={Settings2} theme={activeTheme}>
                        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                            <DetailField label="Timezone" value={workspace.timezone} theme={activeTheme} />
                            <DetailField label="Transition Day" value={workspace.custody_schedule.exchange_day} theme={activeTheme} />
                            <DetailField label="Transition Time" value={transitionTime} theme={activeTheme} />
                            <DetailField label="Week Starts On" value="Sunday" theme={activeTheme} />
                            <div className="md:col-span-2">
                                <DetailField label="Time Format" value="12 hour (6 PM)" theme={activeTheme} />
                            </div>
                        </div>

                        {!workspace.setup.custody_schedule_completed && (
                            <div className="mt-4 sm:mt-6">
                                {canManageCustody ? (
                                    <Link
                                        href={custodyWizardHref}
                                        className="inline-flex min-h-[44px] items-center rounded-2xl bg-[#67d2c3] px-4 py-2 text-sm font-black text-white shadow-sm sm:px-6 sm:py-3 sm:text-[1.05rem]"
                                    >
                                        Complete custody setup wizard
                                    </Link>
                                ) : (
                                    <Link
                                        href={upgradeHref}
                                        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-dashed border-[#ffb21a] bg-[#fff8e6] px-4 py-2 text-sm font-black text-[#b07c1a] shadow-sm sm:px-6 sm:py-3 sm:text-[1.05rem]"
                                    >
                                        <Lock className="size-4" />
                                        Complete plan required
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="mt-4 space-y-3 text-base font-semibold text-slate-900 sm:mt-6 sm:space-y-4 sm:text-[1.15rem]">
                            <div className="flex items-center gap-3">
                                <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-[#67d2c3] text-white">
                                    <Check className="size-4" />
                                </span>
                                Email me when the schedule changes
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-[#67d2c3] text-white">
                                    <Check className="size-4" />
                                </span>
                                Remind me the day before custody changes
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard id="appearance" title="Appearance" icon={Palette} theme={activeTheme}>
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {appearanceThemes.map((theme) => (
                                <AppearanceCard
                                    key={theme.id}
                                    title={theme.title}
                                    subtitle={theme.subtitle}
                                    active={activeTheme === theme.id}
                                    disabled={isPending('theme')}
                                    onClick={() => handleThemeChange(theme.id)}
                                    theme={theme.id}
                                />
                            ))}
                        </div>
                        <p className="mt-3 text-sm text-slate-400 sm:mt-4 sm:text-base">Auto-saves on click and restores on your next visit.</p>
                    </SectionCard>

                    <SectionCard id="recent-activity" title="Recent Activity" icon={ClipboardList} theme={activeTheme}>
                        <div className="max-h-[20rem] overflow-y-auto rounded-[1.4rem] border border-[#edf3f2] sm:max-h-[27rem]">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((item) => <ActivityRow key={item.id} item={item} />)
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-slate-400 sm:px-5 sm:py-10 sm:text-base">No recent activity yet.</div>
                            )}
                        </div>
                    </SectionCard>
                </div>
            </FamilyLayout>

            {isAddChildOpen && (
                <ModalShell title="Add Child" onClose={() => setIsAddChildOpen(false)} disableClose={isPending('add-child')}>
                    <form onSubmit={handleAddChild} className="mt-6 space-y-5">
                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Child&apos;s Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Emma"
                                value={newChild.name}
                                onChange={(event) => setNewChild((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Date of Birth (optional)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={newChild.birthdate}
                                    onChange={(event) => setNewChild((current) => ({ ...current, birthdate: event.target.value }))}
                                    className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                />
                                <Calendar className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={newChild.color}
                                    onChange={(event) => setNewChild((current) => ({ ...current, color: event.target.value }))}
                                    className="h-12 w-full max-w-[120px] rounded-2xl border-2 border-[#d5e8e3] p-2"
                                />
                                <span className="text-sm text-slate-500">Shows on calendar events</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAddChildOpen(false)}
                                disabled={isPending('add-child')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending('add-child')}
                                className="min-h-[44px] rounded-2xl bg-[#67d2c3] px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('add-child') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Adding...
                                    </span>
                                ) : (
                                    'Add Child'
                                )}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {childToEdit && (
                <ModalShell title={`Edit ${childToEdit.name}`} onClose={() => setChildToEdit(null)} disableClose={isPending('edit-child')}>
                    <form onSubmit={handleEditChild} className="mt-6 space-y-5">
                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Child&apos;s Name</label>
                            <input
                                type="text"
                                value={editChild.name}
                                onChange={(event) => setEditChild((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Date of Birth (optional)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={editChild.birthdate}
                                    onChange={(event) => setEditChild((current) => ({ ...current, birthdate: event.target.value }))}
                                    className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                />
                                <Calendar className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={editChild.color}
                                    onChange={(event) => setEditChild((current) => ({ ...current, color: event.target.value }))}
                                    className="h-12 w-full max-w-[120px] rounded-2xl border-2 border-[#d5e8e3] p-2"
                                />
                                <span className="text-sm text-slate-500">Updates future calendar color usage</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setChildToEdit(null)}
                                disabled={isPending('edit-child')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending('edit-child')}
                                className="min-h-[44px] rounded-2xl bg-[#67d2c3] px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('edit-child') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {childToDelete && (
                <ModalShell title={`Delete ${childToDelete.name}?`} onClose={() => setChildToDelete(null)} disableClose={isPending('delete-child')}>
                    <div className="mt-6 space-y-5">
                        <p className="text-base leading-7 text-slate-600">
                            This removes the child from the workspace dashboard. Existing calendar records stay untouched unless you clean them separately.
                        </p>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setChildToDelete(null)}
                                disabled={isPending('delete-child')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteChild}
                                disabled={isPending('delete-child')}
                                className="min-h-[44px] rounded-2xl bg-slate-900 px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('delete-child') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete Child'
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {isAddMemberOpen && (
                <ModalShell title="Add Family Member" onClose={() => setIsAddMemberOpen(false)} disableClose={isPending('add-member')}>
                    <form onSubmit={handleAddMember} className="mt-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-base font-bold text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    value={newMember.firstName}
                                    onChange={(event) => setNewMember((current) => ({ ...current, firstName: event.target.value }))}
                                    className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-base font-bold text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    value={newMember.lastName}
                                    onChange={(event) => setNewMember((current) => ({ ...current, lastName: event.target.value }))}
                                    className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Email</label>
                            <input
                                type="email"
                                value={newMember.email}
                                onChange={(event) => setNewMember((current) => ({ ...current, email: event.target.value }))}
                                className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Role</label>
                            <select
                                value={newMember.role}
                                onChange={(event) => setNewMember((current) => ({ ...current, role: normalizeMemberRole(event.target.value) }))}
                                className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                            >
                                {memberRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={newMember.sendInvite}
                                onChange={(event) => setNewMember((current) => ({ ...current, sendInvite: event.target.checked }))}
                                className="h-5 w-5 rounded border-[#d5e8e3] text-[#67d2c3] focus:ring-[#67d2c3]"
                            />
                            <label className="text-base font-bold text-slate-700">Send invite email now</label>
                        </div>

                        <div className="rounded-[1.2rem] border border-[#dceceb] bg-[#fbfefe] px-4 py-3 text-sm leading-6 text-slate-500">
                            Invitations stay pending until the recipient accepts from the email link. Existing users can sign in with the invited email to join immediately.
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAddMemberOpen(false)}
                                disabled={isPending('add-member')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending('add-member')}
                                className="min-h-[44px] rounded-2xl bg-[#67d2c3] px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('add-member') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Inviting...
                                    </span>
                                ) : (
                                    'Create Invitation'
                                )}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {memberToEdit && (
                <ModalShell title={`Edit ${memberToEdit.name ?? memberToEdit.email ?? 'member'}`} onClose={() => setMemberToEdit(null)} disableClose={isPending('edit-member')}>
                    <form onSubmit={handleEditMember} className="mt-6 space-y-5">
                        <div>
                            <label className="mb-2 block text-base font-bold text-slate-700">Role</label>
                            <select
                                value={editMemberRole}
                                onChange={(event) => setEditMemberRole(normalizeMemberRole(event.target.value))}
                                className="w-full rounded-2xl border-2 border-[#d5e8e3] px-4 py-3 text-base focus:border-[#67d2c3] focus:outline-none"
                            >
                                {memberRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-[1.2rem] border border-[#dceceb] bg-[#fbfefe] px-4 py-3 text-sm leading-6 text-slate-500">
                            Role changes update access to shared family features the next time the page loads.
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setMemberToEdit(null)}
                                disabled={isPending('edit-member')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending('edit-member')}
                                className="min-h-[44px] rounded-2xl bg-[#67d2c3] px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('edit-member') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Role'
                                )}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {memberToRemove && (
                <ModalShell title={`Remove ${memberToRemove.name ?? memberToRemove.email ?? 'member'}?`} onClose={() => setMemberToRemove(null)} disableClose={isPending('remove-member')}>
                    <div className="mt-6 space-y-5">
                        <p className="text-base leading-7 text-slate-600">
                            This removes the member from the workspace and they will lose access to shared family data for this household.
                        </p>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setMemberToRemove(null)}
                                disabled={isPending('remove-member')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveMember}
                                disabled={isPending('remove-member')}
                                className="min-h-[44px] rounded-2xl bg-slate-900 px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('remove-member') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Removing...
                                    </span>
                                ) : (
                                    'Remove Member'
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}

            {invitationToCancel && (
                <ModalShell title="Cancel Invitation?" onClose={() => setInvitationToCancel(null)} disableClose={isPending('cancel-invitation')}>
                    <div className="mt-6 space-y-5">
                        <p className="text-base leading-7 text-slate-600">
                            This cancels the pending invitation for <span className="font-bold text-slate-900">{invitationToCancel.email}</span>. The recipient will need a new invite link after this.
                        </p>

                        <div className="flex justify-end gap-3 border-t border-[#e4f1ef] pt-4">
                            <button
                                type="button"
                                onClick={() => setInvitationToCancel(null)}
                                disabled={isPending('cancel-invitation')}
                                className="min-h-[44px] rounded-2xl bg-slate-200 px-6 py-3 text-base font-black text-slate-700 disabled:opacity-50"
                            >
                                Keep Invitation
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelInvitation}
                                disabled={isPending('cancel-invitation')}
                                className="min-h-[44px] rounded-2xl bg-slate-900 px-6 py-3 text-base font-black text-white disabled:opacity-50"
                            >
                                {isPending('cancel-invitation') ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Cancelling...
                                    </span>
                                ) : (
                                    'Cancel Invitation'
                                )}
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}
        </>
    );
}
