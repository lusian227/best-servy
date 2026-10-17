import React from 'react';
import { UserProfile, World, ProjectItem, DecisionItem, NoteItem, TimelineEntry } from '../../types';
import {
  LayoutDashboard,
  Bot,
  Briefcase,
  Bookmark,
  FileText,
  Calculator,
  Plus,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface WorkspaceDashboardProps {
  user: UserProfile;
  projects: ProjectItem[];
  decisions: DecisionItem[];
  notes: NoteItem[];
  timeline: TimelineEntry[];
  onSelectWorld: (world: World) => void;
  onOpenDecisionModal: () => void;
  onOpenAIChat: () => void;
  onSelectProject: (p: ProjectItem) => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  user,
  projects,
  decisions,
  notes,
  timeline,
  onSelectWorld,
  onOpenDecisionModal,
  onOpenAIChat,
  onSelectProject,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome & AI Morning Briefing Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600 text-emerald-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI Project Engineer Greeting
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good morning, {user.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              You have 3 active site projects running with 88% overall health. Forecast predicts rain at Grand Bay Interchange site after 2:30 PM. Pour Pier P4 concrete before noon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAIChat}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-900/50 transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-200" />
              Open AI Copilot
            </button>
            <button
              onClick={onOpenDecisionModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 shadow transition-all"
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              Log Decision Entry
            </button>
          </div>
        </div>
      </div>

      {/* Quick World Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Engineering Notes', sub: `${notes.length} Documents`, icon: <FileText className="w-5 h-5 text-blue-500" />, action: () => onSelectWorld('workspace') },
          { label: 'Engineering Toolkit', sub: 'Calculators & Formulas', icon: <Calculator className="w-5 h-5 text-emerald-500" />, action: () => onSelectWorld('workspace') },
          { label: 'Active Projects', sub: `${projects.length} Sites`, icon: <Briefcase className="w-5 h-5 text-amber-500" />, action: () => onSelectWorld('projects') },
          { label: 'Decision Log', sub: `${decisions.length} Permanent Logs`, icon: <Bookmark className="w-5 h-5 text-purple-500" />, action: () => onSelectWorld('projects') },
          { label: 'Standards Intelligence', sub: 'Eurocode & ACI', icon: <ShieldCheck className="w-5 h-5 text-teal-500" />, action: () => onSelectWorld('knowledge') },
          { label: '3D Digital Twin', sub: 'Structural Telemetry', icon: <Activity className="w-5 h-5 text-rose-500" />, action: () => onSelectWorld('ai') },
        ].map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-2 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.label}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.sub}</div>
          </button>
        ))}
      </div>

      {/* Active Projects Status & Decision Log Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Active Projects & Health Diagnostics
            </h2>
            <button
              onClick={() => onSelectWorld('projects')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All Projects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {p.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.location}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                    Health {p.health.overall}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-mono">
                    <span>Target Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Open RFIs: {p.health.openRFIs}</span>
                  <span>Decisions Logged: {p.recentDecisionsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Decisions Ledger */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Permanent Decision Log
              </h3>
              <button
                onClick={onOpenDecisionModal}
                className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            <div className="space-y-3">
              {decisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Decision #{d.decisionNumber}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {d.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{d.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{d.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectWorld('projects')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            View Complete Decision Ledger ({decisions.length})
          </button>
        </div>
      </div>
    </div>
  );
};
