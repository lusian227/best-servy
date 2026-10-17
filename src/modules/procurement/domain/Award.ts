export type AwardStatus =
    | 'draft'
    | 'approved'
    | 'issued'
    | 'signed'
    | 'completed';

export interface Award {
    id: string;

    quotationId: string;
    rfqId: string;
    projectId: string;

    providerName: string;

    title: string;
    description: string;

    amount: number;
    currency: string;

    status: AwardStatus;

    purchaseOrderReference?: string;
    contractReference?: string;

    approvedBy?: string;
    approvedAt?: string;

    notes?: string;

    createdAt: string;
    updatedAt: string;
}