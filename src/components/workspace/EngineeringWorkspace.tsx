import React, { useState } from 'react';
import { NoteItem, SingleSourceLink } from '../../types';
import { AssetLinkBadge } from '../common/AssetLinkBadge';
import { FileText, Plus, Search, Tag, Mic, PenTool, Link2, Sparkles, Filter, CheckCircle, Trash2 } from 'lucide-react';

interface EngineeringWorkspaceProps {
  notes: NoteItem[];
  onSaveNote: (note: NoteItem) => void;
  onOpenTrace: (root: { id: string; type: string; title: string; subtitle?: string }, links: SingleSourceLink[]) => void;
}

export const EngineeringWorkspace: React.FC<EngineeringWorkspaceProps> = ({
  notes,
  onSaveNote,
  onOpenTrace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');

  // Modal State for new note
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<NoteItem['category']>('Calculation');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Eurocode, Calculation, Structural');

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const note: NoteItem = {
      id: `nt-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      hasAudio: false,
      hasSketch: false,
      linkedAssets: [],
    };
    onSaveNote(note);
    setSelectedNoteId(note.id);
    setShowNewModal(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>Engineering Workspace & Structured Notes</span>
          </div>
          <h2 className="text-xl font-bold">Engineering Knowledge & Field Workspace</h2>
          <p className="text-xs text-slate-300 mt-1">
            Calculations, site inspections, formula notes & Single Source connected assets.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Engineering Note
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notes List */}
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, formulas, codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium">
              {['All', 'Calculation', 'Site Inspection', 'Design Review', 'Client Meeting', 'SOP'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.map((n) => {
              const isActive = activeNote?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-emerald-950/20 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{n.category}</span>
                    <span className="font-mono text-slate-400 text-[10px]">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{n.title}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{n.content}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Link2 className="w-3 h-3 text-emerald-500" /> {n.linkedAssets.length} Assets Linked
                    </span>
                    <div className="flex items-center gap-1.5">
                      {n.hasAudio && <Mic className="w-3 h-3 text-amber-500" />}
                      {n.hasSketch && <PenTool className="w-3 h-3 text-blue-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Note Document Viewer & Single Source Asset Trace */}
        <div className="lg:col-span-2 space-y-4">
          {activeNote ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      {activeNote.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {activeNote.id}</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{activeNote.title}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Recorded on {activeNote.date} by Eng. Martin Vance
                  </p>
                </div>

                <button
                  onClick={() =>
                    onOpenTrace(
                      { id: activeNote.id, type: 'note', title: activeNote.title, subtitle: activeNote.category },
                      activeNote.linkedAssets
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-900/40 text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                  <Link2 className="w-4 h-4 text-emerald-500" />
                  Trace Connected Assets ({activeNote.linkedAssets.length})
                </button>
              </div>

              {/* Note Content Body */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeNote.content}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {activeNote.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono border border-slate-200 dark:border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Single Source Connected Assets */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-500" />
                  Single Source Linked Assets ({activeNote.linkedAssets.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeNote.linkedAssets.map((asset) => (
                    <AssetLinkBadge key={asset.id} asset={asset} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a note to view details.</div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Engineering Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Span 2 Deck Deflection SLS Calculation"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Calculation">Calculation</option>
                  <option value="Site Inspection">Site Inspection</option>
                  <option value="Design Review">Design Review</option>
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="SOP">SOP</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Note Content *</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write engineering notes, load parameters, calculation steps, or site findings..."
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
