import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export type UserRealtimeSyncPayload = {
    domain: 'messages' | 'mediation' | 'moments' | 'expenses' | string;
    action: string;
    workspace_id: number;
    actor_user_id?: number | null;
    thread_id?: number | null;
    mediation_session_id?: number | null;
    moment_id?: number | null;
    expense_id?: number | null;
};

export function useUserRealtimeSync(handler: (payload: UserRealtimeSyncPayload) => void): void {
    const { auth } = usePage<SharedData>().props;
    const userId = auth.user?.id;

    useEffect(() => {
        if (!userId || window.Echo === undefined) {
            return;
        }

        const channelName = `App.Models.User.${userId}`;
        const channel = window.Echo.private(channelName);
        const listener = (payload: UserRealtimeSyncPayload) => handler(payload);

        channel.listen('.workspace.ui.sync', listener);

        return () => {
            channel.stopListening('.workspace.ui.sync');
        };
    }, [handler, userId]);
}
