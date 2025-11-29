'use client'

import Welcome from '@/components/Welcome';
import { mainPersistence, ydoc } from '@/libs/yjs';
import { User } from '@/types';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

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

    useEffect(() => {
        handleSyncUser();
        return () => {
            setUser(undefined);
        }
    }, []);

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
        <Context.Provider value={{ user }}>
            {children}
            {!user && <Welcome onComplete={handleWelcomeComplete} />}
        </Context.Provider>
    );
}

type SessionState = {
    user: User | undefined;
}
const Context = createContext<SessionState | undefined>(undefined);
const useSession = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useSession should call inside SessionProvider");
    return ctx;
}

export const useCurrentUser = () => {
    const { user } = useSession();
    return useMemo(() => user, [user]);
}