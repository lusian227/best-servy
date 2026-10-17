import React, { useState } from 'react';
import { World, UserProfile } from '../../types';
import { Logo } from './Logo';
import {
  Search,
  Bell,
  Sparkles,
  Bot,
  CloudSun,
  ShieldCheck,
  ChevronDown,
  Building2,
  BookOpen,
  ShoppingBag,
  Briefcase,
  LayoutDashboard,
  Cpu,
  Database,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SyncStatus } from './SyncStatus';

interface HeaderProps {
  currentWorld: World;
  onSelectWorld: (world: World) => void;
  user: UserProfile;
  onOpenAIChat: () => void;
  onOpenSearch: () => void;
  onOpenSupabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorld,
  onSelectWorld,
  user,
  onOpenAIChat,
  onOpenSearch,
  onOpenSupabase,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const supabaseConnected = isSupabaseConfigured() || Boolean(localStorage.getItem('engineeros_supabase_url'));

  const worlds: Array<{ id: World; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" />, badge: '3 Active' },
    { id: 'knowledge', label: 'Knowledge', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Brain', icon: <Cpu className="w-4 h-4" />, badge: 'Live' },
    { id: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Banner Ticker & Quick Status */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4 truncate">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            EngineerOS Single Source Active
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            Grand Bay Site: 29°C Sunny (Rain forecast 2:00 PM)
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* 🆕 Sync Status */}
          <SyncStatus />

          <button
            onClick={onOpenSupabase}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${supabaseConnected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
          >
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{supabaseConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
          </button>
          <span className="text-emerald-400 font-bold hidden sm:inline">Health: 88%</span>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded text-[10px] hidden sm:inline">
            Decision Log #42
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => onSelectWorld('workspace')}
          className="hover:opacity-90 transition-opacity text-left focus:outline-none"
        >
          <Logo variant="full" size="md" />
        </button>

        {/* World Tabs Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
          {worlds.map((w) => {
            const active = currentWorld === w.id;
            return (
              <button
                key={w.id}
                onClick={() => onSelectWorld(w.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                {w.icon}
                <span>{w.label}</span>
                {w.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${active ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-700 text-slate-300'
                      }`}
                  >
                    {w.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Universal Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search platform...</span>
            <kbd className="hidden sm:inline-block text-[9px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* AI Project Engineer Trigger */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-emerald-900/40"
          >
            <Bot className="w-4 h-4 text-emerald-200 animate-bounce" />
            <span className="hidden sm:inline">AI Project Engineer</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-slate-800 mb-2">
                  <div className="font-bold text-sm text-white">{user.name}</div>
                  <div className="text-xs text-emerald-400">{user.role}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.company}</div>
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white">
                    Company Permissions & Roles
                  </button>
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white">
                    Security Audit Logs
                  </button>
                  <button className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white">
                    API & Integration Keys
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Worlds Bar */}
      <div className="lg:hidden flex items-center justify-between overflow-x-auto px-2 py-1 bg-slate-950 border-t border-slate-800 gap-1 font-medium text-xs">
        {worlds.map((w) => (
          <button
            key={w.id}
            onClick={() => onSelectWorld(w.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 ${currentWorld === w.id
                ? 'bg-emerald-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            {w.icon}
            {w.label}
          </button>
        ))}
      </div>
    </header>
  );
};