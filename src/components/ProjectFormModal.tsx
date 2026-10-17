import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: ProjectItem) => void;

    project?: ProjectItem | null;

    companyId: string | null;
    workspaceId: string | null;
    userId: string | null;
}

const createEmptyProject = (
    companyId: string,
    workspaceId: string,
    userId: string
): ProjectItem => {
    const now = new Date().toISOString();

    return {
        id: `project-${Date.now()}`,

        code: '',
        name: '',
        client: '',
        contractor: '',
        consultant: '',
        location: '',

        status: 'In Progress',

        progress: 0,

        startDate: '',
        expectedCompletion: '',

        budget: 0,
        spent: 0,

        leadEngineer: '',

        companyId,
        workspaceId,

        health: {
            overall: 100,
            schedule: 100,
            budget: 100,
            safety: 100,
            quality: 100,
            documentation: 100,
            riskLevel: 'Low',
            openRFIs: 0,
            outstandingApprovals: 0,
            weatherImpactsDays: 0,
            materialShortageRisk: 'Low',
            resourceUtilization: 0,
            aiRecommendations: [],
        },

        milestones: [],
        team: [],

        drawings: [],
        decisions: [],
        rfis: [],
        assets: [],
        reports: [],

        description: '',
        image: '',

        recentDecisionsCount: 0,
        openDefectsCount: 0,

        createdBy: userId,
        updatedBy: userId,

        createdAt: now,
        updatedAt: now,
    };
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    project,
    companyId,
    workspaceId,
    userId,
}) => {
    const [formData, setFormData] = useState<ProjectItem | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        if (project) {
            setFormData({
                ...project,

                companyId: companyId ?? project.companyId,
                workspaceId: workspaceId ?? project.workspaceId,
                updatedBy: userId ?? project.updatedBy ?? project.createdBy,
            });
            return;
        }

        if (!companyId || !workspaceId || !userId) {
            setFormData(null);
            return;
        }

        setFormData(
            createEmptyProject(
                companyId,
                workspaceId,
                userId
            )
        );
    }, [
        isOpen,
        project,
        companyId,
        workspaceId,
        userId,
    ]);

    if (!isOpen) {
        return null;
    }

    const updateField = <
        K extends keyof ProjectItem
    >(
        field: K,
        value: ProjectItem[K]
    ) => {
        setFormData((current) =>
            current
                ? {
                    ...current,
                    [field]: value,
                }
                : current
        );
    };

    const handleSubmit = (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!formData) {
            return;
        }

        if (!companyId) {
            console.error(
                'ProjectFormModal: Cannot save project without companyId'
            );
            return;
        }

        if (!workspaceId) {
            console.error(
                'ProjectFormModal: Cannot save project without workspaceId'
            );
            return;
        }

        if (!userId) {
            console.error(
                'ProjectFormModal: Cannot save project without userId'
            );
            return;
        }

        const now = new Date().toISOString();

        const projectToSave: ProjectItem = {
            ...formData,

            companyId,
            workspaceId,

            createdBy:
                formData.createdBy || userId,

            updatedBy: userId,

            createdAt:
                formData.createdAt || now,

            updatedAt: now,
        };

        console.log(
            'PROJECT SAVE CONTEXT:',
            {
                id: projectToSave.id,
                companyId: projectToSave.companyId,
                workspaceId: projectToSave.workspaceId,
                createdBy: projectToSave.createdBy,
                updatedBy: projectToSave.updatedBy,
            }
        );

        onSave(projectToSave);
        onClose();
    };

    if (!formData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Project context unavailable
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        A company, workspace, and authenticated user are required
                        before creating a project.
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {project
                                ? 'Edit Project'
                                : 'Create Project'}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Project belongs to the current company and workspace.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 p-6"
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Project Name
                            </label>

                            <input
                                value={formData.name}
                                onChange={(e) =>
                                    updateField(
                                        'name',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Project Code
                            </label>

                            <input
                                value={formData.code}
                                onChange={(e) =>
                                    updateField(
                                        'code',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Client
                            </label>

                            <input
                                value={formData.client}
                                onChange={(e) =>
                                    updateField(
                                        'client',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Location
                            </label>

                            <input
                                value={formData.location}
                                onChange={(e) =>
                                    updateField(
                                        'location',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Contractor
                            </label>

                            <input
                                value={formData.contractor}
                                onChange={(e) =>
                                    updateField(
                                        'contractor',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Consultant
                            </label>

                            <input
                                value={formData.consultant}
                                onChange={(e) =>
                                    updateField(
                                        'consultant',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Lead Engineer
                            </label>

                            <input
                                value={formData.leadEngineer}
                                onChange={(e) =>
                                    updateField(
                                        'leadEngineer',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    updateField(
                                        'status',
                                        e.target.value as ProjectItem['status']
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            >
                                <option value="In Progress">
                                    In Progress
                                </option>
                                <option value="Design Phase">
                                    Design Phase
                                </option>
                                <option value="Inspection">
                                    Inspection
                                </option>
                                <option value="Completed">
                                    Completed
                                </option>
                                <option value="Delayed">
                                    Delayed
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Budget
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={formData.budget}
                                onChange={(e) =>
                                    updateField(
                                        'budget',
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    updateField(
                                        'startDate',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Expected Completion
                            </label>

                            <input
                                type="date"
                                value={formData.expectedCompletion}
                                onChange={(e) =>
                                    updateField(
                                        'expectedCompletion',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={formData.description || ''}
                            onChange={(e) =>
                                updateField(
                                    'description',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
                        />
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                            <div>
                                <span className="text-gray-500">
                                    Company
                                </span>

                                <div className="font-mono text-xs text-gray-900">
                                    {companyId}
                                </div>
                            </div>

                            <div>
                                <span className="text-gray-500">
                                    Workspace
                                </span>

                                <div className="font-mono text-xs text-gray-900">
                                    {workspaceId}
                                </div>
                            </div>

                            <div>
                                <span className="text-gray-500">
                                    User
                                </span>

                                <div className="font-mono text-xs text-gray-900">
                                    {userId}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            <Save size={17} />

                            {project
                                ? 'Save Changes'
                                : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;