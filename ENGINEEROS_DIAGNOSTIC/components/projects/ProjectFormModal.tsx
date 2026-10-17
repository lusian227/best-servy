import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: any) => void;
    project?: any;
}

const ProjectFormModal = ({
    isOpen,
    onClose,
    onSave,
    project,
}: ProjectFormModalProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);

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

        const finalId = editingId || `proj-${Date.now()}`;

        const newProject = {
            id: finalId,
            ...formData,
            spent: project?.spent || 0,
            leadEngineerId: project?.leadEngineerId || 'usr-01',
            recentDecisionsCount: project?.recentDecisionsCount || 0,
            openDefectsCount: project?.openDefectsCount || 0,
            image: project?.image || '',
            createdBy: project?.createdBy || 'usr-01',
            createdAt: project?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

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
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition"
                    >
                        {isEditing ? 'Update Project' : 'Create Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;
