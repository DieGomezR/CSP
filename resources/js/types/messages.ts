export type MessageWorkspace = {
    id: number;
    name: string;
    viewer: {
        member_id: number;
        name: string;
        role: string;
        initials: string;
    };
};

export type MessageParticipant = {
    id: number;
    name: string;
    role: string;
    initials: string;
};

export type MessageItem = {
    id: number;
    body: string;
    created_at_label: string | null;
    created_at_relative: string | null;
    is_viewer: boolean;
    author: {
        name: string;
        role: string;
        initials: string;
    };
};

export type MessageThreadItem = {
    id: number;
    subject: string;
    messages_count: number;
    last_message_at_label: string | null;
    unread_count: number;
    href: string;
    preview: string;
};

export type MessageThreadDetail = {
    id: number;
    subject: string;
    messages: MessageItem[];
};
