import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    appearance?: {
        theme: 'warm' | 'modern' | 'minimal';
    };
    workspaceAccess?: {
        workspace_id: number;
        membership_role: string;
        is_owner: boolean;
        features: Record<string, boolean>;
        abilities: Record<string, boolean>;
        subscription: {
            active: boolean;
            on_trial: boolean;
            status: string | null;
            plan: string | null;
            plan_label: string | null;
            billing_mode: string | null;
            billing_mode_label: string | null;
            covered: boolean;
        };
    } | null;
    security?: {
        csrf_token?: string | null;
    };
    notifications?: {
        unread_count: number;
        items: Array<{
            id: string;
            kind: string;
            title: string;
            body: string;
            href?: string | null;
            workspace_id?: number | null;
            read_at?: string | null;
            created_at?: string | null;
            created_at_label?: string | null;
        }>;
    };
    flash: {
        status?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    published_at: string;
    reading_time?: string;
    hero_tone?: string;
    content?: Array<{
        type: 'paragraph' | 'heading' | 'list';
        body?: string;
        items?: string[];
    }>;
}
