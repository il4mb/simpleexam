'use client'

import Welcome from '@/components/Welcome';
import { useCreateEvents } from '@/hooks/useCreateEvents';
import { mainPersistence } from '@/libs/yjs';
import { User } from '@/types';
import { nanoid } from 'nanoid';
import { enqueueSnackbar } from 'notistack';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface SessionProviderProps {
    children?: ReactNode;
}

// Helper function to validate user data
const isValidUser = (user: any): user is User => {
    return (
        typeof user === 'object' &&
        user !== null &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.avatar === 'string'
    );
};

export default function SessionProvider({ children }: SessionProviderProps) {

    const { addEventListener, emit } = useCreateEvents();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>();

    const getCurrentUser = async () => {
        const user = await mainPersistence.get("user");
        return isValidUser(user) ? user : undefined;
    }

    const handleSyncUser = async () => {
        const user = await getCurrentUser();
        setLoading(false);
        setUser(user);
    }

    const handleWelcomeComplete = () => {
        handleSyncUser();
    }

    const updateUser = useCallback(async (patch: Partial<User>): Promise<void> => {
        if (!user) return;

        const { name, avatar } = { ...user, ...patch }

        if (!name.trim()) {
            enqueueSnackbar("Nama tidak boleh kosong", { variant: "error" });
            return;
        }
        if (name.trim().length < 2) {
            enqueueSnackbar("Nama minimal 2 karakter", { variant: "error" });
            return;
        }
        if (name.trim().length > 20) {
            enqueueSnackbar("Nama maksimal 20 karakter", { variant: "error" });
            return;
        }
        if (!avatar?.trim()) {
            enqueueSnackbar("Avatar tidak boleh kosong", { variant: "error" });
            return;
        }

        setUser({ ...user, name, avatar });

        try {
            
            await mainPersistence.set("user", {
                id: user?.id || nanoid(18),
                name: name.trim(),
                avatar: avatar.trim()
            } as any);
            emit("change", { ...user, name, avatar });

        } catch (error: any) {
            enqueueSnackbar(error.message || "Failed update user", { variant: "error" })
        }
    }, [user]);

    useEffect(() => {
        handleSyncUser();
        return () => {
            setUser(undefined);
        }
    }, []);


    const values = useMemo(() => ({ user, updateUser, addEventListener }), [user, updateUser, addEventListener]);

    // Show loading state
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(45deg, #667eea, #764ba2)'
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    textAlign: 'center'
                }}>
                    Loading Squizy.id...
                </div>
            </div>
        );
    }

    return (
        <Context.Provider value={values}>
            {children}
            {!user && <Welcome onComplete={handleWelcomeComplete} />}
        </Context.Provider>
    );
}

type SessionState = {
    user: User | undefined;
    updateUser: (patch: Partial<User>) => Promise<void>;
    addEventListener: <E extends string>(event: E, callback: (args: any) => void) => () => void;
}
const Context = createContext<SessionState | undefined>(undefined);
export const useSession = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useSession should call inside SessionProvider");
    return ctx;
}

export const useCurrentUser = () => {
    const { user } = useSession();
    return useMemo(() => user, [user]);
}