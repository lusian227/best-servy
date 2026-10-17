// src/components/company/PeopleList.tsx

import React from 'react';
import { CompanyMember } from '../../types/company';
import { Mail, Briefcase, Users, Plus, Trash2 } from 'lucide-react';

interface PeopleListProps {
    members: CompanyMember[];
    loading?: boolean;
    onAddMember?: () => void;
    onRemoveMember?: (memberId: string) => void;
}

// ✅ All roles now match CompanyMember
const roleColors: Record<CompanyMember['role'], string> = {
    admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    engineer: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    member: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
    viewer: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
};

export function PeopleList({ members, loading, onAddMember, onRemoveMember }: PeopleListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="flex-1">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="text-center text-slate-500 py-8">
                <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm">No team members yet</p>
                {onAddMember && (
                    <button onClick={onAddMember} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition">
                        <Plus size={14} /> Add Member
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition group">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-900 dark:text-white">
                                {member.name || 'Unknown User'}
                            </p>
                            <span className={`px-2 py-0.5 text-xs rounded ${roleColors[member.role]}`}>
                                {member.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {member.title && <span className="flex items-center gap-1"><Briefcase size={12} />{member.title}</span>}
                            {member.department && <span className="flex items-center gap-1"><Users size={12} />{member.department}</span>}
                            <span className="flex items-center gap-1"><Mail size={12} />{member.email || 'No email'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 hidden sm:block">
                            Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        {onRemoveMember && (
                            <button
                                onClick={() => onRemoveMember(member.id)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}