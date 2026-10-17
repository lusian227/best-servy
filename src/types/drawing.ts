// src/types/drawing.ts

export interface Drawing {
    id: string;
    projectId: string;
    drawingNumber: string;
    title: string;
    discipline: "structural" | "architectural" | "mep" | "electrical" | "mechanical" | "plumbing" | "fire" | "civil" | "geotechnical" | "surveying" | "survey" | "general" | "quantity_surveying" | "environmental" | "project_management" | "other";
    //                                                                                                                                                                                                                        ↑ ADD THIS                                                                                                                                                                                                       ↑ ADD THIS                                                                                                                          ↑ ADD THIS                                                                                                                           ↑ ADD 'survey' and 'general'                                                                                                                     ↑ ADD 'general'                                                                                         ↑ ADD 'fire'                                                                                      ↑ ADD 'plumbing'
    revision: string;
    date: string;
    status: "Approved for Construction" | "Under Review" | "Superseded" | "Draft";
    fileUrl: string;
    annotationsCount: number;
    linkedAssets: string[];
    linkedDecisions: string[];
    linkedRFIs: string[];
    linkedReports: string[];
    version: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;

    // ✅ ADD these for DrawingUploadModal compatibility
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt?: string;
    uploader?: string;
}

export type DrawingItem = Drawing;