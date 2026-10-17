export type QuotationStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'accepted'
    | 'rejected';

export interface QuotationItem {
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
}

export interface Quotation {
    id: string;

    rfqId: string;

    marketplaceListingId?: string;

    providerName: string;
    providerEmail?: string;
    providerPhone?: string;

    items: QuotationItem[];

    subtotal: number;
    tax?: number;
    deliveryCost?: number;
    total: number;

    currency: string;

    deliveryTerms?: string;
    paymentTerms?: string;

    validityDays: number;

    notes?: string;

    status: QuotationStatus;

    submittedAt?: string;

    createdAt: string;
    updatedAt: string;
}