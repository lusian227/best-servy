export interface ProjectMilestone {
    id: string;
    label: string;
    status: "pending" | "in-progress" | "complete";
    progress: number;
    dueDate?: string;
}

export interface ProjectTeam {
    id: string;
    name: string;
    role: string;
    active: boolean;
    avatar?: string;
}

export interface ProjectHealth {
    projectId?: string;
    overall: number;
    schedule: number;
    budget: number;
    safety: number;
    quality: number;
    documentation: number;
    riskLevel: "Low" | "Medium" | "High" | "Critical";
    openRFIs: number;
    outstandingApprovals: number;
    weatherImpactsDays: number;
    materialShortageRisk: string;
    resourceUtilization: number;
    aiRecommendations: string[];
}

export interface Project {
    id: string;
    code: string;
    name: string;
    client: string;
    contractor: string;
    consultant: string;
    location: string;

    status:
    | "In Progress"
    | "Design Phase"
    | "Inspection"
    | "Completed"
    | "Delayed";

    progress: number;
    startDate: string;
    expectedCompletion: string;

    budget: number;
    spent: number;

    leadEngineer: string;

    companyId: string;
    workspaceId: string;

    health: ProjectHealth;

    milestones: ProjectMilestone[];
    team: ProjectTeam[];

    drawings: string[];
    decisions: string[];
    rfis: string[];
    assets: string[];
    reports: string[];

    description?: string;
    image?: string;

    recentDecisionsCount?: number;

    createdBy?: string;      // ✅ ADD THIS
    updatedBy?: string;      // ✅ ADD THIS
    openDefectsCount?: number;    // ✅ ADD THIS
    createdAt: string;
    updatedAt: string;
}

export type ProjectHealthMetrics = ProjectHealth;

export type ProjectItem = Project;