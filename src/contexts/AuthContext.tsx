// src/contexts/AuthContext.tsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';

import { User, Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;

    loading: boolean;
    initialized: boolean;

    signIn: (
        email: string,
        password: string
    ) => Promise<void>;

    signInWithGoogle: () => Promise<void>;

    signOut: () => Promise<void>;

    signUp: (
        email: string,
        password: string,
        name: string
    ) => Promise<void>;

    resetPassword: (
        email: string
    ) => Promise<void>;

    refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext =
    createContext<AuthContextType | undefined>(undefined);

const getSiteUrl = () => {
    return (
        import.meta.env.VITE_SITE_URL ||
        window.location.origin
    ).replace(/\/$/, '');
};

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] =
        useState<User | null>(null);

    const [session, setSession] =
        useState<Session | null>(null);

    const [profile, setProfile] =
        useState<UserProfile | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [initialized, setInitialized] =
        useState(false);


    // ==========================================================
    // LOAD PROFILE
    // ==========================================================

    const loadProfile = useCallback(
        async (
            userId: string
        ): Promise<UserProfile | null> => {
            try {
                const {
                    data,
                    error,
                } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();

                if (error) {
                    console.error(
                        'Failed to load user profile:',
                        error
                    );

                    setProfile(null);

                    return null;
                }

                if (!data) {
                    setProfile(null);

                    return null;
                }

                const profileData: UserProfile = {
                    id: data.id,
                    name: data.name || data.email || 'User',
                    email: data.email,
                    role: data.role || 'pending',
                    avatar: data.avatar_url,
                    company: data.company,
                    department: data.department,
                };

                setProfile(profileData);

                return profileData;

            } catch (error) {
                console.error(
                    'Profile loading exception:',
                    error
                );

                setProfile(null);

                return null;
            }
        },
        []
    );


    // ==========================================================
    // REFRESH PROFILE
    // ==========================================================

    const refreshProfile = useCallback(
        async (): Promise<UserProfile | null> => {
            if (!user) {
                setProfile(null);
                return null;
            }

            return loadProfile(user.id);
        },
        [user, loadProfile]
    );


    // ==========================================================
    // INITIAL AUTH STATE
    // ==========================================================

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                const {
                    data: {
                        session: initialSession,
                    },
                } = await supabase.auth.getSession();

                if (!mounted) return;

                setSession(initialSession);
                setUser(
                    initialSession?.user ?? null
                );

                if (initialSession?.user) {
                    await loadProfile(
                        initialSession.user.id
                    );
                } else {
                    setProfile(null);
                }

            } catch (error) {
                console.error(
                    'Auth initialization failed:',
                    error
                );

                if (mounted) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        initialize();


        // ========================================================
        // AUTH STATE LISTENER
        // IMPORTANT:
        // Do NOT await Supabase database calls directly here.
        // ========================================================

        const {
            data: {
                subscription,
            },
        } =
            supabase.auth.onAuthStateChange(
                (event, newSession) => {

                    if (!mounted) return;

                    setSession(newSession);

                    setUser(
                        newSession?.user ?? null
                    );


                    if (!newSession?.user) {
                        setProfile(null);
                        setLoading(false);
                        return;
                    }


                    // Defer database work outside
                    // the auth callback.
                    setTimeout(() => {

                        if (!mounted) return;

                        loadProfile(
                            newSession.user.id
                        ).finally(() => {

                            if (mounted) {
                                setLoading(false);
                            }

                        });

                    }, 0);
                }
            );


        return () => {
            mounted = false;
            subscription.unsubscribe();
        };

    }, [loadProfile]);


    // ==========================================================
    // SIGN IN
    // ==========================================================

    const signIn = async (
        email: string,
        password: string
    ): Promise<void> => {

        const {
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
    };


    // ==========================================================
    // GOOGLE SIGN IN
    // ==========================================================

    const signInWithGoogle = async (): Promise<void> => {

        const {
            error,
        } =
            await supabase.auth.signInWithOAuth({
                provider: 'google',

                options: {
                    redirectTo: `${getSiteUrl()}/`,
                },
            });

        if (error) {
            throw error;
        }
    };


    // ==========================================================
    // SIGN UP - WITH DIAGNOSTIC LOGGING
    // ==========================================================

    const signUp = async (
        email: string,
        password: string,
        name: string
    ): Promise<void> => {

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        console.log('🔐 EngineerOS signup attempt:', {
            email: cleanEmail,
            name: cleanName,
            passwordLength: password.length,
        });

        if (!cleanEmail) {
            throw new Error('Email address is required.');
        }

        if (!cleanName) {
            throw new Error('Full name is required.');
        }

        if (!password) {
            throw new Error('Password is required.');
        }

        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                data: {
                    full_name: cleanName,
                    name: cleanName,
                },
                emailRedirectTo: `${getSiteUrl()}/`,
            },
        });

        // ✅ DIAGNOSTIC LOGGING - CRITICAL FOR DEBUGGING
        if (error) {
            console.error('❌ SUPABASE SIGNUP FAILED', {
                message: error.message,
                status: error.status,
                name: error.name,
                code: (error as any).code,
                details: (error as any).details,
                hint: (error as any).hint,
            });
            throw error;
        }

        console.log('✅ Supabase signup accepted:', {
            userId: data.user?.id,
            sessionCreated: !!data.session,
        });

        // If Supabase created a session immediately
        if (data.user && data.session) {
            await loadProfile(data.user.id);
            return;
        }

        // Email confirmation enabled: user exists but session may be null
        if (data.user && !data.session) {
            console.log('📧 Signup successful. Email confirmation is required.');
            return;
        }
    };


    // ==========================================================
    // PASSWORD RESET REQUEST
    // ==========================================================

    const resetPassword = async (
        email: string
    ): Promise<void> => {

        const {
            error,
        } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        `${getSiteUrl()}/reset-password`,
                }
            );

        if (error) {
            throw error;
        }
    };


    // ==========================================================
    // SIGN OUT
    // ==========================================================

    const signOut = async (): Promise<void> => {

        const {
            error,
        } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        setUser(null);
        setSession(null);
        setProfile(null);
    };


    // ==========================================================
    // CONTEXT VALUE
    // ==========================================================

    const value: AuthContextType = {
        user,
        session,
        profile,

        loading,
        initialized,

        signIn,
        signInWithGoogle,
        signOut,
        signUp,
        resetPassword,
        refreshProfile,
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth =
    (): AuthContextType => {

        const context =
            useContext(AuthContext);

        if (!context) {
            throw new Error(
                'useAuth must be used within an AuthProvider'
            );
        }

        return context;
    };