// src/components/auth/LoginPage.tsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building2,
    Mail,
    Lock,
    Loader2,
    Github,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle
} from 'lucide-react';

export function LoginPage() {
    const { signIn, signInWithGoogle, signUp, resetPassword } = useAuth();

    // ============================================================
    // STATE
    // ============================================================

    const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (mode === 'reset') {
            if (!email) {
                setError('Please enter your email address.');
                return;
            }

            setLoading(true);
            try {
                await resetPassword(email);
                setSuccess('Password reset email sent! Check your inbox.');
                setMode('login');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to send reset email.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'register') {
            if (!email || !password || !name) {
                setError('Please fill in all fields.');
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters.');
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            setLoading(true);
            try {
                await signUp(email, password, name);
                setSuccess('Account created! Please check your email to verify.');
                setMode('login');
                // Clear form
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setName('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create account.');
            } finally {
                setLoading(false);
            }
            return;
        }

        // LOGIN
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">

            <div className="w-full max-w-md">

                {/* ======================================================
            LOGO / HEADER
        ====================================================== */}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        EngineerOS
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {mode === 'login' && 'Sign in to your engineering workspace'}
                        {mode === 'register' && 'Create your EngineerOS account'}
                        {mode === 'reset' && 'Reset your password'}
                    </p>
                </div>

                {/* ======================================================
            CARD
        ====================================================== */}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8">

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>
                        </div>
                    )}

                    {/* ======================================================
              FORM
          ====================================================== */}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name - Register only */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                    placeholder="John Engineer"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                    placeholder="you@company.com"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password - Login & Register only */}
                        {mode !== 'reset' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                        placeholder={mode === 'register' ? 'Create a password' : 'Enter your password'}
                                        disabled={loading}
                                        required={mode === 'login' || mode === 'register'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password - Register only */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                        placeholder="Confirm your password"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'login' && 'Sign In'}
                            {mode === 'register' && 'Create Account'}
                            {mode === 'reset' && 'Send Reset Email'}
                        </button>
                    </form>

                    {/* ======================================================
              DIVIDER
          ====================================================== */}

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* ======================================================
              SOCIAL LOGIN
          ====================================================== */}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>

                    {/* ======================================================
              MODE SWITCHER
          ====================================================== */}

                    <div className="mt-6 text-center text-sm">
                        {mode === 'login' && (
                            <>
                                <button
                                    onClick={() => setMode('reset')}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                                >
                                    Forgot password?
                                </button>
                                <span className="mx-3 text-slate-300 dark:text-slate-600">|</span>
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                                >
                                    Create account
                                </button>
                            </>
                        )}

                        {mode === 'register' && (
                            <button
                                onClick={() => setMode('login')}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                            >
                                Already have an account? Sign in
                            </button>
                        )}

                        {mode === 'reset' && (
                            <button
                                onClick={() => setMode('login')}
                                className="text-emerald-600 dark:text-emerald-400 hover:underline transition"
                            >
                                Back to sign in
                            </button>
                        )}
                    </div>

                </div>

                {/* ======================================================
            FOOTER
        ====================================================== */}

                <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    EngineerOS v2.0 • Engineering Intelligence Platform
                </p>

            </div>
        </div>
    );
}

export default LoginPage;