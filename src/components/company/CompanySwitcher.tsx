// src/components/company/CompanySwitcher.tsx

import React, { useState } from 'react';
import { Company } from '../../types/company';
import { ChevronDown, Check, Building2 } from 'lucide-react';

interface CompanySwitcherProps {
    companies: Company[];
    activeCompanyId: string | null;
    onSwitchCompany: (companyId: string) => void;
}

export function CompanySwitcher({
    companies,
    activeCompanyId,
    onSwitchCompany,
}: CompanySwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);

    const activeCompany = companies.find((c) => c.id === activeCompanyId);

    if (companies.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500/50 transition text-sm"
            >
                <Building2 size={16} className="text-emerald-500" />
                <span className="font-medium text-slate-900 dark:text-white">
                    {activeCompany?.name || 'Select Company'}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="py-1">
                        {companies.map((company) => {
                            const isActive = company.id === activeCompanyId;
                            return (
                                <button
                                    key={company.id}
                                    type="button"
                                    onClick={() => {
                                        onSwitchCompany(company.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition ${isActive
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                            : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    <span>{company.name}</span>
                                    {isActive && <Check size={14} className="text-emerald-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}