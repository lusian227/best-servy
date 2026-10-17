import React from 'react';

interface EngineeringWorkspaceProps {
  notes: any[];
  onSaveNote: (note: any) => void;
  onOpenTrace: (root: any, links?: any[]) => void;
}

const EngineeringWorkspace = ({ notes }: EngineeringWorkspaceProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Engineering Workspace</h1>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm">
          + New Note
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-gray-400">No notes yet. Create your first engineering note!</p>
          </div>
        ) : (
          notes.map((note: any) => (
            <div key={note.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{note.content}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{note.category}</span>
                <span>•</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EngineeringWorkspace;
