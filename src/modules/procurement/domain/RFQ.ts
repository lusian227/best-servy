export type RFQStatus =
    | 'draft'
    | 'issued'
    | 'expired'
    | 'closed'
    | 'awarded';

export type RFQSupplierStatus =
    | 'invited'
    | 'viewed'
    | 'declined'
    | 'quoted';

export interface RFQSupplier {
    supplierId?: string;
    supplierName: string;
    invitedAt: string;
    responded: boolean;
    quotationId?: string;
    status: RFQSupplierStatus;
}

export interface RFQ {
    id: string;

    requestId?: string;
    projectId: string;

    reference: string;
    title: string;
    description: string;

    suppliers: RFQSupplier[];

    deadline: string;
    terms?: string;

    status: RFQStatus;

    issuedAt?: string;
    closedAt?: string;

    createdBy?: string;

    createdAt: string;
    updatedAt: string;
}