// src/components/company/CompanyProfile.tsx

import React from 'react';
import { Company } from '../../types/company';
import { Mail, Phone, Globe, MapPin, Edit2 } from 'lucide-react';

interface CompanyProfileProps {
    company: Company | null;
    onEdit?: () => void;
}

export function CompanyProfile({ company, onEdit }: CompanyProfileProps) {
    if (!company) {
        return <div className="p-6 text-center text-slate-500">No company data available</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
                        {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{company.industry || 'Engineering'}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {company.size || 'Medium'} • {company.foundedAt ? `Founded ${new Date(company.foundedAt).getFullYear()}` : 'N/A'}
                        </p>
                    </div>
                </div>
                {onEdit && (
                    <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <Edit2 size={16} className="text-slate-500" />
                    </button>
                )}
            </div>
            {company.description && (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {company.description}
                </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {company.email && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Mail size={14} /><span>{company.email}</span></div>}
                {company.phone && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Phone size={14} /><span>{company.phone}</span></div>}
                {company.website && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Globe size={14} />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                            {company.website.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                )}
                {company.address && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><MapPin size={14} /><span>{company.address}</span></div>}
            </div>
        </div>
    );
}