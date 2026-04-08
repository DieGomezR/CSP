export type WorkspaceChild = {
    id: number;
    name: string;
    color: string;
    birthdate: string | null;
};

export type WorkspaceMember = {
    id: number;
    user_id: number;
    name: string | null;
    email: string | null;
    role: string;
    joined_at: string | null;
};

export type WorkspaceSummary = {
    id: number;
    name: string;
    type: string;
    timezone: string;
    children_count: number;
    members_count: number;
    calendar_events_count: number;
};

export type CalendarOccurrence = {
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

export type CalendarDay = {
    date: string;
    label: number;
    is_current_month: boolean;
    is_today: boolean;
    occurrences: CalendarOccurrence[];
};

export type CalendarPayload = {
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

export type ActivityItem = {
    id: string;
    icon: 'workspace' | 'member' | 'child' | 'calendar';
    title: string;
    detail: string;
    relative_time: string;
    timestamp_iso: string;
    highlighted: boolean;
};

export type WorkspacePayload = {
    id: number;
    name: string;
    type: string;
    timezone: string;
    children_count: number;
    members_count: number;
    events_count: number;
    children: WorkspaceChild[];
    members: WorkspaceMember[];
    setup: {
        custody_schedule_completed: boolean;
        custody_schedule_completed_at: string | null;
    };
    custody_schedule: {
        completed_at: string | null;
        children_ids: number[];
        starting_parent_member_id: number | null;
        start_date: string | null;
        generate_until: '6 months' | '1 year' | '2 years';
        end_date: string | null;
        exchange_day: string;
        exchange_time: string;
        school_calendar: string | null;
    };
};

export type CalendarFeedPayload = {
    id: number;
    name: string;
    subscription_url: string;
    last_accessed_at: string | null;
    provider_links: {
        apple: string;
        google: string;
        outlook: string;
    };
};
