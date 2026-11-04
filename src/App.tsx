
import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link,
} from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import AuthenticatedApp from './AuthenticatedApp';
import LoginPage from './components/auth/LoginPage';
import HomePage from './pages/Public/HomePage';

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <p className="text-sm text-slate-400">
                    Initializing EngineerOS...
                </p>
            </div>
        </div>
    );
}

function LoginRoute() {
    const {
        user,
        loading,
        initialized,
    } = useAuth();

    if (!initialized || loading) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate to="/app" replace />;
    }

    return <LoginPage />;
}

function ProtectedRoute() {
    const {
        user,
        loading,
        initialized,
    } = useAuth();

    if (!initialized || loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <AuthenticatedApp />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<LoginRoute />} />

            <Route path="/app" element={<ProtectedRoute />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
