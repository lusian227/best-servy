// src/components/company/CompanyMetrics.tsx

import React from 'react';
import { CompanyMetrics as MetricsType } from '../../types/company';
import { Briefcase, Users, FileText, Layers } from 'lucide-react';

interface CompanyMetricsProps {
    metrics: MetricsType | null;
    loading?: boolean;
    onNavigate?: (world: string) => void;
}

export function CompanyMetrics({ metrics, loading, onNavigate }: CompanyMetricsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
                        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!metrics) {
        return <div className="text-center text-slate-500 py-8">No metrics available</div>;
    }

    const cards = [
        {
            label: 'Workspaces',
            value: metrics.totalWorkspaces || 0,
            sub: 'environments',
            icon: Layers,
            color: 'text-emerald-500',
            navigateTo: 'workspace'
        },
        {
            label: 'Projects',
            value: metrics.totalProjects || 0,
            sub: `${metrics.activeProjects || 0} active`,
            icon: Briefcase,
            color: 'text-blue-500',
            navigateTo: 'projects'
        },
        {
            label: 'People',
            value: metrics.totalMembers || 0,
            sub: 'team members',
            icon: Users,
            color: 'text-purple-500',
            navigateTo: 'company'
        },
        {
            label: 'Records',
            value: metrics.totalRecords || 0,      // ✅ Now exists in interface
            sub: 'documents',
            icon: FileText,
            color: 'text-amber-500',
            navigateTo: 'records'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        onClick={() => {
                            console.log(`🔍 CompanyMetrics: Clicked ${card.label} -> navigating to: ${card.navigateTo}`);
                            onNavigate?.(card.navigateTo);
                        }}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-emerald-500/50 transition"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {card.label}
                            </span>
                            <Icon size={16} className={card.color} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.sub}</p>
                    </div>
                );
            })}
        </div>
    );
}