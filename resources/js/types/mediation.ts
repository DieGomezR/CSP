export type MediationWorkspace = {
    id: number;
    name: string;
    viewer: {
        member_id: number;
        name: string;
        role: string;
    };
};

export type MediationWarning = {
    severity: string;
    label: string;
    evidence: string;
    message_id: number;
    created_at?: string | null;
};

export type MediationSessionCard = {
    id: number;
    subject: string;
    status: string;
    status_label: string;
    started_at_label?: string | null;
    messages_count: number;
    href: string;
    cta_label: string;
};

export type MediationMessage = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    kind: string;
    body: string;
    author_name: string;
    created_at_label?: string | null;
    analysis: {
        warnings: Array<{
            severity: string;
            label: string;
            evidence: string;
        }>;
        patterns: string[];
    };
    tag?: string | null;
};

export type MediationSessionDetail = {
    id: number;
    subject: string;
    status: string;
    status_label: string;
    started_at_label?: string | null;
    resolution_reason?: string | null;
    cancellation_reason?: string | null;
    can_reply: boolean;
    messages: MediationMessage[];
    warnings: MediationWarning[];
};
