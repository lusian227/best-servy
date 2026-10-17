export interface Drawing { id: string; projectId: string; drawingNumber: string; title: string; discipline: "Structural" | "Architectural" | "MEP" | "Geotechnical" | "Civil"; revision: string; date: string; status: "Approved for Construction" | "Under Review" | "Superseded" | "Draft"; fileUrl: string; annotationsCount: number; linkedAssets: string[]; linkedDecisions: string[]; linkedRFIs: string[]; linkedReports: string[]; version: number; createdBy: string; createdAt: string; updatedAt: string; }


export type DrawingItem = Drawing;
