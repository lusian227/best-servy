import { ProcurementRepository } from '../repositories/ProcurementRepository';

import type {
    ProcurementRequest,
    RFQ,
    Quotation,
    Award,
} from '../domain';

export class ProcurementService {
    constructor(
        private readonly repository: ProcurementRepository
    ) { }

    // ============================================================
    // PROCUREMENT REQUESTS
    // ============================================================

    async getRequests(
        projectId?: string,
        workspaceId?: string,
        userId?: string
    ): Promise<ProcurementRequest[]> {
        return this.repository.getRequests(projectId, workspaceId);
    }

    async getRequest(id: string): Promise<ProcurementRequest | null> {
        return this.repository.getRequest(id);
    }

    async createRequest(
        request: Omit<
            ProcurementRequest,
            'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<ProcurementRequest> {
        return this.repository.createRequest(request);
    }

    async updateRequest(
        id: string,
        updates: Partial<ProcurementRequest>
    ): Promise<ProcurementRequest> {
        return this.repository.updateRequest(id, updates);
    }

    // ============================================================
    // RFQs
    // ============================================================

    async getRFQs(projectId: string): Promise<RFQ[]> {
        return this.repository.getRFQs(projectId);
    }

    async getRFQ(id: string): Promise<RFQ | null> {
        return this.repository.getRFQ(id);
    }

    async createRFQ(
        rfq: Omit<
            RFQ,
            'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<RFQ> {
        return this.repository.createRFQ(rfq);
    }

    async updateRFQ(
        id: string,
        updates: Partial<RFQ>
    ): Promise<RFQ> {
        return this.repository.updateRFQ(id, updates);
    }

    // ============================================================
    // SUPPLIER WORKFLOW
    // ============================================================

    async acceptSupplierRequest(
        requestId: string,
        supplierCompanyId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        return this.repository.acceptSupplierRequest(
            requestId,
            supplierCompanyId,
            userId,
            note
        );
    }

    async confirmRequesterReceipt(
        requestId: string,
        requesterWorkspaceId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        return this.repository.confirmRequesterReceipt(
            requestId,
            requesterWorkspaceId,
            userId,
            note
        );
    }



    // ============================================================
    // QUOTATIONS
    // ============================================================

    async getQuotations(rfqId: string): Promise<Quotation[]> {
        return this.repository.getQuotations(rfqId);
    }

    async getQuotation(id: string): Promise<Quotation | null> {
        return this.repository.getQuotation(id);
    }

    async createQuotation(
        quotation: Quotation
    ): Promise<Quotation> {
        return this.repository.createQuotation(quotation);
    }

    async updateQuotation(
        id: string,
        updates: Partial<Quotation>
    ): Promise<Quotation> {
        return this.repository.updateQuotation(id, updates);
    }

    // ============================================================
    // AWARDS
    // ============================================================

    async getAwards(projectId: string): Promise<Award[]> {
        return this.repository.getAwards(projectId);
    }

    async getAward(id: string): Promise<Award | null> {
        return this.repository.getAward(id);
    }

    async createAward(award: Award): Promise<Award> {
        return this.repository.createAward(award);
    }

    async updateAward(
        id: string,
        updates: Partial<Award>
    ): Promise<Award> {
        return this.repository.updateAward(id, updates);
    }
}