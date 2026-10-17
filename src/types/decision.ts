// src/types/decision.ts

export interface Decision {
    id: string;
    companyId: string;
    decisionNumber: number;
    projectId: string;
    projectName: string;
    title: string;
    reason: string;
    requestedBy: string;
    reviewedBy: string;
    approvedBy: string;
    implemented: boolean;

    // Keep lowercase — matches the rest of the application
    status: "approved" | "pending" | "rejected" | "in-review";

    affectedDrawings: string[];
    relatedRFIs: string[];
    relatedPhotosCount: number;

    date: string;

    impactLevel: "High" | "Medium" | "Low";

    costImpact?: string;
    scheduleImpact?: string;
    category?: string;

    priority?: "Critical" | "High" | "Medium" | "Low";

    attachments?: string[];
    linkedAssets?: string[];
    linkedReports?: string[];

    // IMPORTANT: optional because existing mock data doesn't have them
    createdAt?: string;
    updatedAt?: string;
}

export type DecisionItem = Decision;