export type MomentWorkspace = {
    id: number;
    name: string;
    timezone: string;
    children_count: number;
    members_count: number;
    events_count: number;
    viewer: {
        member_id: number;
        role: string;
        name: string | null;
    };
};

export type MomentVisibilityOption = {
    value: string;
    label: string;
    description: string;
};

export type MomentReactionOption = {
    value: string;
    emoji: string;
    label: string;
    count: number;
    active: boolean;
};

export type MomentItem = {
    id: number;
    caption: string | null;
    visibility: string;
    visibility_label: string;
    visibility_description: string;
    image_url: string;
    can_delete: boolean;
    can_react: boolean;
    created_at_iso: string | null;
    created_at_label: string | null;
    taken_on_iso: string | null;
    taken_on_label: string | null;
    author: {
        name: string;
        role: string;
        initials: string;
    };
    viewer_reaction: string | null;
    reactions: MomentReactionOption[];
};
