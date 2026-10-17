import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Company } from '../../types/company';

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (company: Omit<Company, 'id'>) => void;
}

export function CompanyFormModal({
    isOpen,
    onClose,
    onSave,
}: CompanyFormModalProps) {
    const [name, setName] = useState('');
    const [industry, setIndustry] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        onSave({
            name: name.trim(),
            industry: industry.trim(),
            website: website.trim(),
            description: description.trim(),
        } as Omit<Company, 'id'>);

        setName('');
        setIndustry('');
        setWebsite('');
        setDescription('');

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Add Company
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Create a new company workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Company Name
                        </label>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Apex Engineering Ltd"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Industry
                        </label>

                        <input
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="Engineering & Infrastructure"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Website
                        </label>

                        <input
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Company description..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Create Company
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}