import React, { useState } from 'react';
import { LessonItem } from '../../types';
import { saveLesson } from '../../lib/storage';
import { BookOpen, Plus, Search, Tag, CheckCircle, AlertTriangle, Sparkles, ThumbsUp, Building2 } from 'lucide-react';

interface LessonsLearnedProps {
  lessons: LessonItem[];
  onSaveLesson: (lesson: LessonItem) => void;
}

export const LessonsLearned: React.FC<LessonsLearnedProps> = ({ lessons, onSaveLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Lesson form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LessonItem['category']>('Concrete');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [causesOfDelay, setCausesOfDelay] = useState('');
  const [bestSuppliers, setBestSuppliers] = useState('');
  const [designChangesRepeated, setDesignChangesRepeated] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [tags, setTags] = useState('Hot Weather, Slump, Concrete');

  const filtered = lessons.filter((l) => {
    if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.whatWentWell.toLowerCase().includes(q) ||
        l.recommendations.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lesson: LessonItem = {
      id: `lsn-${Date.now().toString().slice(-4)}`,
      projectId: 'prj-past',
      projectName: 'Coastal Seawall & Infra Project',
      category,
      title,
      whatWentWell,
      causesOfDelay,
      bestSuppliers,
      designChangesRepeated,
      recommendations,
      date: new Date().toISOString().split('T')[0],
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    onSaveLesson(lesson);
    setShowNewModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Lessons Learned Engine</span>
          </div>
          <h2 className="text-xl font-bold">Post-Project Retrospectives & AI Advice</h2>
          <p className="text-xs text-slate-300 mt-1">
            Capture what went well, causes of delays, supplier performance & design change recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Capture Lesson Entry
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lessons learned by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Concrete', 'Geotechnical', 'Structural', 'Safety', 'Procurement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((l) => (
          <div
            key={l.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                {l.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{l.date}</span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{l.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{l.projectName}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400">WHAT WENT WELL</span>
                <p className="mt-0.5 text-[11px]">{l.whatWentWell}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                <span className="font-bold block text-[10px] text-amber-700 dark:text-amber-400">CAUSES OF DELAY</span>
                <p className="mt-0.5 text-[11px]">{l.causesOfDelay}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-800">
                <span className="font-bold block text-[10px] text-emerald-400">AI RECOMMENDATION FOR FUTURE PROJECTS</span>
                <p className="mt-0.5 text-[11px] text-slate-200 leading-relaxed">{l.recommendations}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {l.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Capture Lesson Learned</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Concrete Slump Retention in High Temperature Pours"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">What Went Well *</label>
                <textarea
                  required
                  rows={2}
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Causes of Delay *</label>
                <textarea
                  required
                  rows={2}
                  value={causesOfDelay}
                  onChange={(e) => setCausesOfDelay(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">AI Recommendation *</label>
                <textarea
                  required
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold">
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
