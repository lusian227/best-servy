// src/components/company/CompanyActivity.tsx

import React from 'react';
import { CompanyActivity as ActivityType } from '../../types/company';
import { Activity, FileText, Users, CheckCircle, Plus, Edit2 } from 'lucide-react';

interface CompanyActivityProps {
    activities: ActivityType[];
    loading?: boolean;
}

const activityIcons: Record<ActivityType['type'], React.ReactNode> = {
    project_created: <Plus size={14} className="text-emerald-500" />,
    project_updated: <Edit2 size={14} className="text-blue-500" />,
    record_uploaded: <FileText size={14} className="text-purple-500" />,
    decision_made: <CheckCircle size={14} className="text-amber-500" />,
    member_joined: <Users size={14} className="text-emerald-500" />,
    note_added: <FileText size={14} className="text-slate-500" />,
};

const activityColors: Record<ActivityType['type'], string> = {
    project_created: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    project_updated: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    record_uploaded: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    decision_made: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    member_joined: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    note_added: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
};

export function CompanyActivity({ activities, loading }: CompanyActivityProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="flex-1">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center text-slate-500 py-8">
                <Activity size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition">
                    <div className={`p-1.5 rounded-lg ${activityColors[activity.type]}`}>{activityIcons[activity.type]}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{activity.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{activity.userName}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400">
                                {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}