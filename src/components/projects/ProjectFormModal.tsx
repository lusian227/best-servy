// src/components/projects/ProjectFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCompanyStore } from '../../stores/companyStore';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: any) => void;
    project?: any;
    workspaceId: string;  // ✅ REQUIRED - no fallback
    userId: string;       // ✅ REQUIRED
}

const ProjectFormModal = ({
    isOpen,
    onClose,
    onSave,
    project,
    workspaceId,
    userId,
}: ProjectFormModalProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);

    // ============================================================
    // GET ACTIVE COMPANY
    // ============================================================

    const { activeCompanyId } = useCompanyStore();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        client: '',
        location: '',
        status: 'In Progress',
        progress: 0,
        startDate: '',
        expectedCompletion: '',
        budget: 0,
        leadEngineer: '',
    });

    useEffect(() => {
        if (project) {
            setEditingId(project.id || null);
            setFormData({
                name: project.name || '',
                code: project.code || '',
                client: project.client || '',
                location: project.location || '',
                status: project.status || 'In Progress',
                progress: project.progress || 0,
                startDate: project.startDate || '',
                expectedCompletion: project.expectedCompletion || '',
                budget: project.budget || 0,
                leadEngineer: project.leadEngineer || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                code: '',
                client: '',
                location: '',
                status: 'In Progress',
                progress: 0,
                startDate: '',
                expectedCompletion: '',
                budget: 0,
                leadEngineer: '',
            });
        }
    }, [project]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ CRITICAL VALIDATION 1: Check workspaceId
        if (!workspaceId) {
            console.error('❌ Cannot save project: workspaceId is missing');
            alert('Cannot save project: workspace context is missing. Please refresh and try again.');
            return;
        }

        // ✅ CRITICAL VALIDATION 2: Check companyId
        if (!activeCompanyId) {
            console.error('❌ Cannot save project: companyId is missing');
            alert('Cannot save project: company context is missing. Please refresh and try again.');
            return;
        }

        // ✅ CRITICAL VALIDATION 3: Check userId
        if (!userId) {
            console.error('❌ Cannot save project: userId is missing');
            alert('Cannot save project: user context is missing. Please refresh and try again.');
            return;
        }

        const finalId = editingId || `proj-${Date.now()}`;

        const newProject = {
            id: finalId,
            companyId: activeCompanyId,        // ✅ From store (guaranteed not null)
            workspaceId: workspaceId,          // ✅ From props (guaranteed not empty)
            ...formData,
            spent: project?.spent || 0,
            leadEngineerId: project?.leadEngineerId || userId,
            recentDecisionsCount: project?.recentDecisionsCount || 0,
            openDefectsCount: project?.openDefectsCount || 0,
            image: project?.image || '',
            createdBy: project?.createdBy || userId,
            createdAt: project?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // ✅ DIAGNOSTIC LOG - CRITICAL FOR DEBUGGING
        console.log('========================================');
        console.log('📝 SAVING PROJECT');
        console.log('Project ID:', newProject.id);
        console.log('Project Name:', newProject.name);
        console.log('Company ID:', newProject.companyId);
        console.log('Workspace ID:', newProject.workspaceId);
        console.log('Created By:', newProject.createdBy);
        console.log('========================================');

        onSave(newProject);
        onClose();
    };

    if (!isOpen) return null;

    const isEditing = !!editingId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Edit Project' : 'New Project'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Show which company this project will belong to */}
                {!isEditing && activeCompanyId && (
                    <div className="mb-4 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
                        📌 This project will be created under your current company
                    </div>
                )}

                {/* ⚠️ Show warning if context is missing */}
                {(!activeCompanyId || !workspaceId) && (
                    <div className="mb-4 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
                        ⚠️ Cannot create project: Company or Workspace context is missing.
                        Please refresh the page and try again.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            placeholder="e.g. River Bridge Construction"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Project Code *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                placeholder="e.g. PRJ-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            >
                                <option value="Design Phase">Design Phase</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Inspection">Inspection</option>
                                <option value="Completed">Completed</option>
                                <option value="Delayed">Delayed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            placeholder="e.g. Nairobi County"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            placeholder="e.g. Kilimani, Nairobi"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expected Completion
                            </label>
                            <input
                                type="date"
                                value={formData.expectedCompletion}
                                onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Budget ($)
                            </label>
                            <input
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Lead Engineer
                            </label>
                            <input
                                type="text"
                                value={formData.leadEngineer}
                                onChange={(e) => setFormData({ ...formData, leadEngineer: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                placeholder="e.g. Martin Vance"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!activeCompanyId || !workspaceId}
                        className={`w-full py-3 text-white font-semibold rounded-xl transition ${activeCompanyId && workspaceId
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isEditing ? 'Update Project' : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;