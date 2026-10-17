import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, X, Code, Server } from 'lucide-react';
import { testSupabaseConnection, isSupabaseConfigured, getSupabaseClient } from '../../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  });
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');

  useEffect(() => {
    if (isOpen) {
      const storedUrl = localStorage.getItem('engineeros_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
      const storedKey = localStorage.getItem('engineeros_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      setUrl(storedUrl);
      setKey(storedKey);

      if (storedUrl && storedKey) {
        handleTest(storedUrl, storedKey);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (url) localStorage.setItem('engineeros_supabase_url', url.trim());
    if (key) localStorage.setItem('engineeros_supabase_anon_key', key.trim());
    await handleTest(url.trim(), key.trim());
  };

  const handleTest = async (testUrl = url, testKey = key) => {
    setStatus({ loading: true });
    const res = await testSupabaseConnection(testUrl, testKey);
    setStatus({ loading: false, success: res.success, message: res.message });
  };

  const handleCopySql = () => {
    fetch('/database_schema.sql')
      .then((res) => res.text())
      .then((sqlText) => {
        navigator.clipboard.writeText(sqlText);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      })
      .catch(() => {
        // Fallback
        const fallbackMsg = '-- Copy from /database_schema.sql file in workspace';
        navigator.clipboard.writeText(fallbackMsg);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Supabase Database Connection
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect your EngineerOS web app to your Supabase project for real-time cloud sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Database Schema (SQL)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              {/* Connection Status Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  status.loading
                    ? 'bg-slate-800/40 border-slate-700 text-slate-300'
                    : status.success
                    ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                    : status.message
                    ? 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                    : 'bg-slate-800/20 border-slate-800 text-slate-400'
                }`}
              >
                {status.loading ? (
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0 mt-0.5" />
                ) : status.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-semibold text-white mb-0.5">
                    {status.loading
                      ? 'Testing Supabase Connection...'
                      : status.success
                      ? 'Supabase Connected'
                      : 'Supabase Not Connected'}
                  </div>
                  <div>
                    {status.message ||
                      'Provide your Supabase URL & Anon Public Key below or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment.'}
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  How to get these from Supabase:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Go to your Supabase Dashboard (<span className="text-emerald-400">app.supabase.com</span>).</li>
                  <li>Select your project, then open <span className="text-slate-200">Project Settings &gt; API</span>.</li>
                  <li>Copy your <span className="text-slate-200">Project URL</span> and <span className="text-slate-200">anon / public</span> API key.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 leading-relaxed">
                We generated a complete PostgreSQL schema (<span className="font-mono text-emerald-400">database_schema.sql</span>) containing all 14 core tables, custom enums, performance indexes, automated triggers, and Row-Level Security policies.
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-emerald-300">
                  {`-- Includes 14 Tables, RLS Policies & Triggers:
1. user_profiles
2. projects
3. project_health_metrics
4. decisions
5. drawings
6. notes
7. calculations
8. lessons_learned
9. site_diaries
10. digital_twin_nodes
11. marketplace_listings
12. standard_docs
13. single_source_links
14. audit_logs`}
                </pre>
              </div>

              <button
                onClick={handleCopySql}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    SQL Script Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-400" />
                    Copy database_schema.sql for Supabase SQL Editor
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => handleTest()}
            disabled={status.loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
