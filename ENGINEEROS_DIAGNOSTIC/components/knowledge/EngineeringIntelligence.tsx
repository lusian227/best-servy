import React, { useState } from 'react';
import { StandardDoc, LessonItem } from '../../types';
import { sampleStandards } from '../../data/mockData';
import { LessonsLearned } from './LessonsLearned';
import { BookOpen, Search, ShieldCheck, Sparkles, FileText, Download, Bot, Database, ArrowRight } from 'lucide-react';

interface EngineeringIntelligenceProps {
  lessons: LessonItem[];
  onSaveLesson: (lesson: LessonItem) => void;
  onOpenAIChat: () => void;
}

export const EngineeringIntelligence: React.FC<EngineeringIntelligenceProps> = ({
  lessons,
  onSaveLesson,
  onOpenAIChat,
}) => {
  const [activeTab, setActiveTab] = useState<'standards' | 'lessons' | 'memory'>('standards');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandards = sampleStandards.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Engineering Intelligence & Standards Engine</span>
          </div>
          <h2 className="text-xl font-bold">Standards Library & Organizational Knowledge</h2>
          <p className="text-xs text-slate-300 mt-1">
            Eurocode 2, ACI 318, Eurocode 7, Company SOPs, AI Clause Lookup & Lessons Learned.
          </p>
        </div>

        <button
          onClick={onOpenAIChat}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
        >
          <Bot className="w-4 h-4 text-emerald-200" />
          Ask AI Standard Tutor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'standards', label: 'Standards & Building Codes' },
          { id: 'lessons', label: 'Lessons Learned Database' },
          { id: 'memory', label: 'Company Memory Repository' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'standards' && (
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Eurocodes, ACI, BS standards, clauses, shear strength formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredStandards.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{s.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {s.publisher}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[10px]">KEY CLAUSE REFERENCE</span>
                    {s.clauseReference}
                  </div>

                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span>{s.fileSize}</span>
                    <button className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                      <Download className="w-3.5 h-3.5" /> PDF Standard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'lessons' && <LessonsLearned lessons={lessons} onSaveLesson={onSaveLesson} />}

      {activeTab === 'memory' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
          <Database className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Company Memory AI Vector Index</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Company Memory continuously indexes every past completed project drawing, site diary, calculation, and decision.
            Ask natural language queries like: <em>&quot;Have we ever placed CFA bored piles in hard basalt rock before?&quot;</em>
          </p>
          <button
            onClick={onOpenAIChat}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow"
          >
            <Bot className="w-4 h-4 text-emerald-200" /> Query Company Memory
          </button>
        </div>
      )}
    </div>
  );
};
