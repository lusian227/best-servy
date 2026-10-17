// src/modules/procurement/domain/index.ts

// ============================================================
// PROCUREMENT REQUEST STATUS
// ============================================================

export type ProcurementStatus =
    | 'draft'
    | 'open'
    | 'submitted'
    | 'received'
    | 'under_review'
    | 'supplier_accepted'
    | 'supplier_accepted'
    | 'delivery_scheduled'
    | 'rfq_issued'
    | 'quotes_received'
    | 'supplier_selected'
    | 'awarded'
    | 'order_placed'
    | 'ordered'
    | 'delivering'
    | 'delivered'
    | 'verified'
    | 'payment_pending'
    | 'paid'
    | 'completed'
    | 'cancelled'
    | 'rejected';

// ============================================================
// PROCUREMENT CATEGORY
// ============================================================

export type ProcurementCategory =
    | 'material'
    | 'equipment'
    | 'professional'
    | 'service'
    | 'technology'
    | 'energy'
    | 'transport';

// ============================================================
// PROCUREMENT REQUEST
// ============================================================

export interface ProcurementRequest {
    id: string;
    projectId?: string | null;
    workspaceId?: string | null;

    // ✅ Supplier routing (optional at creation, added when supplier is selected)
    supplierCompanyId?: string | null;
    supplierAcceptedAt?: string | null;
    supplierAcceptedBy?: string | null;
    deliveredAt?: string | null;
    deliveredBy?: string | null;
    supplierCompanyName?: string | null;

    assignedSupplierId?: string | null;      // ✅ ADD THIS
    assignedSupplierName?: string | null;    // ✅ ADD THIS


    reference?: string | null;
    title: string;
    description?: string | null;
    category?: ProcurementCategory | null;
    quantity?: number | null;
    unit?: string | null;
    requiredDate?: string | null;
    deliveryLocation?: string | null;
    budget?: number | null;
    currency?: string | null;
    specifications?: Record<string, any> | null;

    status: ProcurementStatus;
    createdBy?: string | null;
    linkedDrawingIds?: string[];
    linkedRFIIds?: string[];

    createdAt: string;
    updatedAt: string;

    // Lifecycle
    receivedAt?: string | null;
    receivedBy?: string | null;
    statusHistory?: ProcurementStatusHistoryEntry[];
}

// ============================================================
// STATUS HISTORY
// ============================================================

export interface ProcurementStatusHistoryEntry {
    from?: ProcurementStatus | null;
    to: ProcurementStatus;
    changedBy?: string | null;
    changedAt: string;
    note?: string | null;
}

// ============================================================
// RFQ STATUS
// ============================================================

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

// ============================================================
// QUOTATION STATUS
// ============================================================

export type QuotationStatus =
    | 'submitted'
    | 'pending'
    | 'accepted'
    | 'rejected';

export interface Quotation {
    id: string;
    rfqId: string;
    supplierCompanyId?: string;
    providerName: string;
    providerEmail?: string | null;
    providerPhone?: string | null;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    tax?: number | null;
    deliveryCost?: number | null;
    total: number;
    currency: string;
    deliveryTerms?: string | null;
    paymentTerms?: string | null;
    validityDays: number;
    notes?: string | null;
    status: QuotationStatus;
    submittedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// AWARD STATUS
// ============================================================

export type AwardStatus =
    | 'draft'
    | 'issued'
    | 'accepted'
    | 'rejected'
    | 'completed';

export interface Award {
    id: string;
    quotationId: string;
    rfqId: string;
    projectId: string;
    supplierCompanyId?: string;
    providerName: string;
    title: string;
    description?: string | null;
    amount: number;
    currency: string;
    status: AwardStatus;
    purchaseOrderReference?: string | null;
    contractReference?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// DELIVERY
// ============================================================

export type DeliveryCondition =
    | 'good'
    | 'damaged'
    | 'partial'
    | 'rejected';

export interface ProcurementDelivery {
    id: string;
    procurementRequestId: string;
    workspaceId: string;
    deliveryNumber: number;
    deliveryDate: string;
    quantityOrdered: number;
    quantityDelivered: number;
    unit?: string | null;
    condition: DeliveryCondition;
    notes?: string | null;
    confirmedBy?: string | null;
    confirmedAt?: string | null;
    receivedBy?: string | null;    // ✅ ADDED
    receivedAt?: string | null;    // ✅ ADDED
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// EVIDENCE
// ============================================================

export type EvidenceType =
    | 'delivery_photo'
    | 'delivery_video'
    | 'delivery_note'
    | 'invoice'
    | 'payment_receipt'
    | 'calculation'
    | 'other';

export interface ProcurementEvidence {
    id: string;
    procurementRequestId: string;
    deliveryId?: string | null;
    workspaceId: string;
    type: EvidenceType;
    fileUrl?: string | null;
    storagePath?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    description?: string | null;
    uploadedBy?: string | null;
    uploadedAt: string;
    createdAt: string;
}

// ============================================================
// CALCULATION
// ============================================================

export interface ProcurementCalculation {
    id: string;
    procurementRequestId: string;
    deliveryId?: string | null;
    workspaceId: string;
    expression: string;
    result: number;
    unit?: string | null;
    description?: string | null;
    createdBy?: string | null;
    createdAt: string;
}

// ============================================================
// PAYMENT
// ============================================================

export type PaymentMethod =
    | 'M-Pesa'
    | 'Bank Transfer'
    | 'Cash'
    | 'Cheque'
    | 'Other';

export type PaymentStatus =
    | 'reported'
    | 'pending_verification'
    | 'verified'
    | 'rejected';

export interface ProcurementPayment {
    id: string;
    procurementRequestId: string;
    workspaceId: string;
    amount: number;
    currency: string;
    paymentMethod?: PaymentMethod | null;
    transactionReference?: string | null;
    paymentDate?: string | null;
    status: PaymentStatus;
    reportedBy?: string | null;
    reportedAt?: string | null;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    verificationNotes?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================================
// TRANSACTION SUMMARY
// ============================================================

export interface ProcurementTransactionSummary {
    request: ProcurementRequest;
    deliveries: ProcurementDelivery[];
    evidence: ProcurementEvidence[];
    calculations: ProcurementCalculation[];
    payments: ProcurementPayment[];
    orderedQuantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
    deliveryPercentage: number;
    totalPaymentReported: number;
    totalPaymentVerified: number;
    budget: number;
    balance: number;
    hasDeliveryEvidence: boolean;
    hasPaymentEvidence: boolean;
    isFullyDelivered: boolean;
    isPaymentPending: boolean;
    isPaid: boolean;
    isCompleted: boolean;
}