// src/components/common/SearchModal.tsx

import React, { useState, useEffect } from 'react';
import { Search, X, Folder, FileText, Lightbulb, Database } from 'lucide-react';
import { useProjectStore, useDecisionStore, useDrawingStore } from '../../stores';
import { useRecordStore } from '../../modules/records/store/recordStore';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectResult: (result: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    onSelectResult,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const { projects } = useProjectStore();
    const { records } = useRecordStore();
    const { decisions } = useDecisionStore();
    const { drawings } = useDrawingStore();

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchResults: any[] = [];

        // Search projects
        projects.forEach(p => {
            if (p.name?.toLowerCase().includes(query.toLowerCase()) ||
                p.description?.toLowerCase().includes(query.toLowerCase())) {
                searchResults.push({ ...p, type: 'project', icon: Folder });
            }
        });

        // Search records
        records.forEach(r => {
            if (r.title?.toLowerCase().includes(query.toLowerCase())) {
                searchResults.push({ ...r, type: 'record', icon: FileText });
            }
        });

        // ✅ FIXED: Search decisions using 'reason' instead of 'description'
        decisions.forEach(d => {
            if (d.title?.toLowerCase().includes(query.toLowerCase()) ||
                d.reason?.toLowerCase().includes(query.toLowerCase())) {
                searchResults.push({ ...d, type: 'decision', icon: Lightbulb });
            }
        });

        // ✅ FIXED: Search drawings using 'title' instead of 'description'
        drawings.forEach(d => {
            if (d.title?.toLowerCase().includes(query.toLowerCase()) ||
                d.drawingNumber?.toLowerCase().includes(query.toLowerCase())) {
                searchResults.push({ ...d, type: 'drawing', icon: Database });
            }
        });

        setResults(searchResults.slice(0, 20));
    }, [query, projects, records, decisions, drawings]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search projects, records, decisions, drawings..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
                        autoFocus
                    />
                    <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                    {results.length === 0 && query && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            No results found for "{query}"
                        </div>
                    )}

                    {results.map((result, index) => (
                        <button
                            key={result.id || index}
                            onClick={() => {
                                onSelectResult(result);
                                onClose();
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                        >
                            <result.icon className="w-5 h-5 text-emerald-500" />
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                    {result.title || result.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {result.type} • {result.projectId || result.workspaceId || 'Global'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};