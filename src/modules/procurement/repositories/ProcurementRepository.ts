// src/modules/procurement/repositories/ProcurementRepository.ts

import { supabase } from '../../../lib/supabase';

import { generateUUID } from '../../../utils/uuid';

import { procurementStorage } from '../services/procurementStorage';

import type {
    ProcurementRequest,
    ProcurementCategory,
    ProcurementStatus,
    RFQ,
    RFQStatus,
    RFQSupplier,
    RFQSupplierStatus,
    Quotation,
    QuotationStatus,
    Award,
    AwardStatus,
    ProcurementDelivery,
    ProcurementEvidence,
    ProcurementCalculation,
    ProcurementPayment,
    DeliveryCondition,
    PaymentMethod,
    PaymentStatus,
    EvidenceType,
} from '../domain';

/**
 * ProcurementRepository
 *
 * Persistence layer for procurement:
 *
 * Procurement Request
 *      ↓
 * RFQ
 *      ↓
 * Quotations
 *      ↓
 * Award
 *      ↓
 * Order / Delivery
 *      ↓
 * Verification
 *      ↓
 * Payment
 *      ↓
 * Completion
 *
 * Important:
 * - Normal request status changes MUST go through transitionRequest().
 * - Direct updateRequest() should only be used for non-workflow fields.
 * - Database RLS should still enforce workspace/company authorization.
 */
export class ProcurementRepository {
    // ============================================================
    // REQUESTS
    // ============================================================

    async createRequest(
        input: Omit<
            ProcurementRequest,
            'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<ProcurementRequest> {
        const id = generateUUID();
        const now = new Date().toISOString();

        // UUID-derived reference avoids timestamp collisions.
        const reference = `PR-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

        const payload = {
            id,
            project_id: input.projectId ?? null,
            workspace_id: input.workspaceId ?? null,

            supplier_company_id: input.supplierCompanyId ?? null,
            supplier_company_name: input.supplierCompanyName ?? null,

            reference,
            title: input.title.trim(),
            description: input.description?.trim() ?? null,

            category: input.category,
            quantity: input.quantity ?? null,
            unit: input.unit ?? null,

            required_date: input.requiredDate ?? null,
            delivery_location: input.deliveryLocation ?? null,

            budget: input.budget ?? null,
            currency: input.currency ?? 'KES',

            specifications: input.specifications ?? {},

            status: 'open' as ProcurementStatus,

            created_by: input.createdBy ?? null,

            linked_drawing_ids: input.linkedDrawingIds ?? [],
            linked_rfi_ids: input.linkedRFIIds ?? [],

            status_history: [],

            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from('procurement_requests')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to create procurement request: ${error.message}`
            );
        }

        // Public request → notify platform companies.
        if (!input.supplierCompanyId) {
            await this.notifyCompaniesOfNewRFQ(data.id);
        }

        return this.mapRequest(data);
    }

    async getRequests(
        projectId?: string,
        workspaceId?: string,
        userId?: string
    ): Promise<ProcurementRequest[]> {
        if (!workspaceId) {
            console.warn(
                '[ProcurementRepository] getRequests blocked: workspaceId is required'
            );
            return [];
        }

        // ✅ Get the user's company ID if they're a supplier
        let supplierCompanyId: string | null = null;

        if (userId) {
            const { data: companyData, error } = await supabase
                .from('companies')
                .select('id')
                .eq('owner_id', userId)
                .maybeSingle();

            if (!error && companyData) {
                supplierCompanyId = companyData.id;
            }
        }

        let query = supabase
            .from('procurement_requests')
            .select('*')
            .eq('workspace_id', workspaceId);

        // ✅ If we have supplier company ID, include supplier requests
        if (supplierCompanyId) {
            // Show: workspace requests + supplier-specific requests + public requests
            query = query.or(
                `workspace_id.eq.${workspaceId},` +
                `supplier_company_id.eq.${supplierCompanyId},` +
                `supplier_company_id.is.null`
            );
        } else {
            // Fallback: only workspace requests
            query = query.eq('workspace_id', workspaceId);
        }

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query.order('created_at', {
            ascending: false,
        });

        if (error) {
            throw new Error(
                `Failed to fetch procurement requests: ${error.message}`
            );
        }

        return (data ?? []).map((row) => this.mapRequest(row));
    }

    async getRequest(id: string): Promise<ProcurementRequest | null> {
        if (!id) return null;

        const { data, error } = await supabase
            .from('procurement_requests')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(
                `Failed to fetch procurement request: ${error.message}`
            );
        }

        return data ? this.mapRequest(data) : null;
    }

    /**
     * Updates non-workflow request fields.
     *
     * Do NOT use this method for normal status transitions.
     * Use transitionRequest() instead.
     */
    async updateRequest(
        id: string,
        updates: Partial<ProcurementRequest>
    ): Promise<ProcurementRequest> {
        if (!id) {
            throw new Error('Procurement request ID is required');
        }

        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (updates.title !== undefined) {
            payload.title = updates.title.trim();
        }

        if (updates.description !== undefined) {
            payload.description = updates.description ?? null;
        }

        if (updates.category !== undefined) {
            payload.category = updates.category;
        }

        if (updates.quantity !== undefined) {
            payload.quantity = updates.quantity;
        }

        if (updates.unit !== undefined) {
            payload.unit = updates.unit;
        }

        if (updates.requiredDate !== undefined) {
            payload.required_date = updates.requiredDate;
        }

        if (updates.deliveryLocation !== undefined) {
            payload.delivery_location = updates.deliveryLocation;
        }

        if (updates.budget !== undefined) {
            payload.budget = updates.budget;
        }

        if (updates.currency !== undefined) {
            payload.currency = updates.currency;
        }

        if (updates.specifications !== undefined) {
            payload.specifications = updates.specifications;
        }

        if (updates.supplierCompanyId !== undefined) {
            payload.supplier_company_id = updates.supplierCompanyId ?? null;
        }

        if (updates.supplierCompanyName !== undefined) {
            payload.supplier_company_name =
                updates.supplierCompanyName ?? null;
        }

        if (updates.linkedDrawingIds !== undefined) {
            payload.linked_drawing_ids = updates.linkedDrawingIds;
        }

        if (updates.linkedRFIIds !== undefined) {
            payload.linked_rfi_ids = updates.linkedRFIIds;
        }

        if (updates.projectId !== undefined) {
            payload.project_id = updates.projectId ?? null;
        }

        // Intentionally NOT accepting status here.
        // Workflow transitions must use transitionRequest().

        const { data, error } = await supabase
            .from('procurement_requests')
            .update(payload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to update procurement request: ${error.message}`
            );
        }

        return this.mapRequest(data);
    }

    // ============================================================
    // REQUEST STATUS WORKFLOW
    // ============================================================

    private readonly allowedTransitions: Record<
        string,
        ProcurementStatus[]
    > = {
            draft: ['submitted', 'cancelled'],
            open: ['submitted', 'received', 'cancelled'], // ✅ Changed: removed 'supplier_accepted'
            submitted: ['received', 'cancelled'],         // ✅ Changed: removed 'supplier_accepted'
            received: ['ordered', 'cancelled'],           // ✅ Changed: removed 'supplier_accepted'
            ordered: ['delivering', 'cancelled'],
            delivering: ['delivered', 'cancelled'],
            delivered: ['verified', 'rejected'],
            verified: ['payment_pending', 'rejected'],
            payment_pending: ['paid', 'rejected'],
            paid: ['completed'],
            completed: [],
            cancelled: [],
            rejected: [],
        };

    private async transitionRequest(
        requestId: string,
        userId: string,
        nextStatus: ProcurementStatus,
        note?: string,
        extraPayload: Record<string, unknown> = {}
    ): Promise<ProcurementRequest> {
        if (!requestId) {
            throw new Error('Procurement request ID is required');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        const request = await this.getRequest(requestId);

        if (!request) {
            throw new Error('Procurement request not found');
        }

        const currentStatus = String(request.status);

        if (currentStatus === nextStatus) {
            throw new Error(
                `Procurement request is already "${nextStatus}".`
            );
        }

        const allowed =
            this.allowedTransitions[currentStatus] ?? [];

        if (!allowed.includes(nextStatus)) {
            throw new Error(
                `Cannot move procurement request from "${currentStatus}" to "${nextStatus}".`
            );
        }

        const now = new Date().toISOString();

        const historyEntry = {
            from: currentStatus,
            to: nextStatus,
            userId,
            note: note?.trim() || null,
            createdAt: now,
        };

        const currentHistory = Array.isArray(
            (request as any).statusHistory
        )
            ? (request as any).statusHistory
            : [];

        const payload: Record<string, unknown> = {
            status: nextStatus,
            updated_at: now,

            status_history: [
                ...currentHistory,
                historyEntry,
            ],

            ...extraPayload,
        };

        const { data, error } = await supabase
            .from('procurement_requests')
            .update(payload)
            .eq('id', requestId)
            .select('*');

        if (error) {
            console.error(
                '[ProcurementRepository] transitionRequest UPDATE failed:',
                {
                    requestId,
                    userId,
                    currentStatus,
                    nextStatus,
                    payload,
                    error,
                }
            );

            throw new Error(
                `Failed to transition procurement request: ${error.message}`
            );
        }

        if (!data || data.length === 0) {
            console.error(
                '[ProcurementRepository] transitionRequest updated 0 rows:',
                {
                    requestId,
                    userId,
                    currentStatus,
                    nextStatus,
                    payload,
                }
            );

            throw new Error(
                'Procurement request could not be updated. ' +
                'This usually means the database RLS policy does not allow this user to update the request.'
            );
        }

        if (data.length > 1) {
            console.error(
                '[ProcurementRepository] transitionRequest updated multiple rows:',
                {
                    requestId,
                    rows: data.length,
                }
            );

            throw new Error(
                'Unexpected database result: multiple procurement requests were updated.'
            );
        }

        return this.mapRequest(data[0]);
    }

    async submitRequest(
        requestId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        return this.transitionRequest(
            requestId,
            userId,
            'submitted' as ProcurementStatus,
            note
        );
    }
    async markReceived(
        requestId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        const now = new Date().toISOString();

        // ✅ First, check if already claimed
        const { data: currentReq, error: fetchError } = await supabase
            .from('procurement_requests')
            .select('status, assigned_supplier_id')
            .eq('id', requestId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to check request: ${fetchError.message}`);
        }

        if (currentReq.assigned_supplier_id) {
            throw new Error('This request has already been claimed by another supplier.');
        }

        // ✅ Atomic update with assignment - SAFE array handling
        const { data, error } = await supabase
            .from('procurement_requests')
            .update({
                status: 'received',
                assigned_supplier_id: userId,
                received_at: now,
                received_by: userId,
                updated_at: now,
            })
            .eq('id', requestId)
            .is('assigned_supplier_id', null)  // ✅ Prevents race conditions
            .select('*');

        if (error) {
            throw new Error(`Failed to claim request: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('Request was already claimed by another supplier');
        }

        return this.mapRequest(data[0]);
    }

    async markOrdered(
        requestId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'ordered' as ProcurementStatus,
            note,
            {
                ordered_at: now,
                ordered_by: userId,
            }
        );
    }

    async markDelivering(
        requestId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'delivering' as ProcurementStatus,
            note,
            {
                delivering_at: now,
                delivering_by: userId,
            }
        );
    }

    async verifyDelivery(
        requestId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'verified' as ProcurementStatus,
            note,
            {
                verified_at: now,
                verified_by: userId,
            }
        );
    }

    async completeRequest(
        requestId: string,
        userId: string
    ): Promise<ProcurementRequest> {
        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'completed' as ProcurementStatus,
            undefined,
            {
                completed_at: now,
                completed_by: userId,
            }
        );
    }

    async cancelRequest(
        requestId: string,
        userId: string,
        reason: string
    ): Promise<ProcurementRequest> {
        if (!reason?.trim()) {
            throw new Error('Cancellation reason is required');
        }

        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'cancelled' as ProcurementStatus,
            reason,
            {
                cancelled_at: now,
                cancelled_by: userId,
                cancellation_reason: reason.trim(),
            }
        );
    }

    async rejectRequest(
        requestId: string,
        userId: string,
        reason: string
    ): Promise<ProcurementRequest> {
        if (!reason?.trim()) {
            throw new Error('Rejection reason is required');
        }

        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'rejected' as ProcurementStatus,
            reason,
            {
                rejected_at: now,
                rejected_by: userId,
                rejection_reason: reason.trim(),
            }
        );
    }

    async getStatusHistory(
        requestId: string
    ): Promise<
        Array<{
            from?: string;
            to: string;
            userId?: string;
            note?: string | null;
            createdAt: string;
        }>
    > {
        const request = await this.getRequest(requestId);

        if (!request) {
            throw new Error('Procurement request not found');
        }

        return Array.isArray((request as any).statusHistory)
            ? (request as any).statusHistory
            : [];
    }

    // ============================================================
    // SUPPLIER REQUESTS
    // ============================================================

    async getSupplierRequests(
        supplierCompanyId: string
    ): Promise<ProcurementRequest[]> {
        if (!supplierCompanyId) {
            return [];
        }

        const { data, error } = await supabase
            .from('procurement_requests')
            .select('*')
            // ✅ Fetch both requests SPECIFIC to this supplier, AND PUBLIC requests (no supplier assigned)
            .or(
                `supplier_company_id.eq.${supplierCompanyId},supplier_company_id.is.null`
            )
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(
                `Failed to get supplier requests: ${error.message}`
            );
        }

        return (data ?? []).map((row) =>
            this.mapRequest(row)
        );
    }

    async sendRequestToSupplier(
        requestId: string,
        supplierCompanyId: string,
        supplierCompanyName?: string
    ): Promise<ProcurementRequest> {
        if (!requestId) {
            throw new Error('Procurement request ID is required');
        }

        if (!supplierCompanyId) {
            throw new Error('Supplier company is required');
        }

        return this.updateRequest(requestId, {
            supplierCompanyId,
            supplierCompanyName,
        });
    }

    // ============================================================
    // SUPPLIER WORKFLOW
    // ============================================================

    /**
     * Supplier accepts a procurement request.
     * 
     * This transitions the request from 'open' or 'submitted' to 'received'.
     * Only the supplier assigned to this request (or any supplier for public requests) can accept it.
     * 
     * @param requestId - The ID of the procurement request
     * @param supplierCompanyId - The supplier's company ID
     * @param userId - The user ID of the supplier user accepting the request
     * @param note - Optional note
     * @returns The updated ProcurementRequest
     */
    async acceptSupplierRequest(
        requestId: string,
        supplierCompanyId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        if (!requestId) throw new Error('Procurement request ID is required');
        if (!supplierCompanyId) throw new Error('Supplier company ID is required');
        if (!userId) throw new Error('User ID is required');

        const request = await this.getRequest(requestId);
        if (!request) throw new Error('Procurement request not found');

        // ✅ Allow public requests (supplier_company_id IS NULL) to be claimed
        const isPublicRequest = !request.supplierCompanyId;

        if (!isPublicRequest && request.supplierCompanyId !== supplierCompanyId) {
            throw new Error('You are not the assigned supplier for this request');
        }

        if (request.status !== 'open' && request.status !== 'submitted') {
            throw new Error(`Request cannot be accepted in its current status: "${request.status}".`);
        }

        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'received' as ProcurementStatus, // ✅ Changed from 'supplier_accepted'
            note ?? 'Supplier accepted the request',
            {
                supplier_accepted_at: now,
                supplier_accepted_by: userId,
                assigned_supplier_id: userId,
                received_at: now,
                received_by: userId,
            }
        );
    }

    /**
     * Requester confirms receipt of delivered goods/services.
     * 
     * This transitions the request from 'delivered' to 'verified'.
     * Only the requester (workspace owner) can confirm receipt.
     * 
     * @param requestId - The ID of the procurement request
     * @param requesterWorkspaceId - The workspace ID of the requester (must match request.workspace_id)
     * @param userId - The user ID of the requester confirming receipt
     * @param note - Optional note
     * @returns The updated ProcurementRequest
     */
    async confirmRequesterReceipt(
        requestId: string,
        requesterWorkspaceId: string,
        userId: string,
        note?: string
    ): Promise<ProcurementRequest> {
        if (!requestId) {
            throw new Error('Procurement request ID is required');
        }

        if (!requesterWorkspaceId) {
            throw new Error('Requester workspace ID is required');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        // Get the request
        const request = await this.getRequest(requestId);

        if (!request) {
            throw new Error('Procurement request not found');
        }

        // Check if the requester is the workspace owner
        if (request.workspaceId !== requesterWorkspaceId) {
            throw new Error('Only the requesting company can confirm receipt');
        }

        // Check if the request is in the correct status
        if (request.status !== 'delivered') {
            throw new Error(
                `Receipt can only be confirmed when the request status is "delivered". Current status: "${request.status}"`
            );
        }

        const now = new Date().toISOString();

        return this.transitionRequest(
            requestId,
            userId,
            'verified' as ProcurementStatus,
            note ?? 'Requester confirmed receipt',
            {
                received_at: now,
                received_by: userId,
                verified_at: now,
                verified_by: userId,
            }
        );
    }

    // ============================================================
    // RFQs
    // ============================================================

    async createRFQ(
        input: Omit<
            RFQ,
            'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<RFQ> {
        if (!input.projectId) {
            throw new Error('Project ID is required for an RFQ');
        }

        if (!input.title?.trim()) {
            throw new Error('RFQ title is required');
        }

        if (!input.deadline) {
            throw new Error('RFQ deadline is required');
        }

        const id = generateUUID();
        const now = new Date().toISOString();

        const reference = `RFQ-${id
            .replace(/-/g, '')
            .slice(0, 8)
            .toUpperCase()}`;

        const payload = {
            id,
            request_id: input.requestId ?? null,
            project_id: input.projectId,

            reference,
            title: input.title.trim(),
            description: input.description?.trim() ?? '',

            suppliers: input.suppliers ?? [],

            deadline: input.deadline,
            terms: input.terms ?? null,

            status: 'draft' as RFQStatus,

            issued_at: input.issuedAt ?? null,
            closed_at: input.closedAt ?? null,

            created_by: input.createdBy ?? null,

            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from('procurement_rfqs')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to create RFQ: ${error.message}`
            );
        }

        return this.mapRFQ(data);
    }

    async getRFQs(projectId: string): Promise<RFQ[]> {
        const { data, error } = await supabase
            .from('procurement_rfqs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(
                `Failed to fetch RFQs: ${error.message}`
            );
        }

        return (data ?? []).map((row) =>
            this.mapRFQ(row)
        );
    }

    async getRFQ(id: string): Promise<RFQ | null> {
        const { data, error } = await supabase
            .from('procurement_rfqs')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(
                `Failed to fetch RFQ: ${error.message}`
            );
        }

        return data ? this.mapRFQ(data) : null;
    }

    async updateRFQ(
        id: string,
        updates: Partial<RFQ>
    ): Promise<RFQ> {
        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (updates.title !== undefined) {
            payload.title = updates.title.trim();
        }

        if (updates.description !== undefined) {
            payload.description = updates.description ?? '';
        }

        if (updates.requestId !== undefined) {
            payload.request_id = updates.requestId ?? null;
        }

        if (updates.projectId !== undefined) {
            payload.project_id = updates.projectId ?? null;
        }

        if (updates.suppliers !== undefined) {
            payload.suppliers = updates.suppliers;
        }

        if (updates.deadline !== undefined) {
            payload.deadline = updates.deadline;
        }

        if (updates.terms !== undefined) {
            payload.terms = updates.terms;
        }

        // RFQ status is controlled by workflow methods below.
        if (updates.status !== undefined) {
            payload.status = updates.status;
        }

        if (updates.issuedAt !== undefined) {
            payload.issued_at = updates.issuedAt ?? null;
        }

        if (updates.closedAt !== undefined) {
            payload.closed_at = updates.closedAt ?? null;
        }

        const { data, error } = await supabase
            .from('procurement_rfqs')
            .update(payload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to update RFQ: ${error.message}`
            );
        }

        return this.mapRFQ(data);
    }

    async addSupplierToRFQ(
        rfqId: string,
        supplier: RFQSupplier
    ): Promise<RFQ> {
        const rfq = await this.getRFQ(rfqId);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (
            rfq.suppliers.some(
                (item) => item.supplierId === supplier.supplierId
            )
        ) {
            throw new Error(
                'Supplier is already attached to this RFQ'
            );
        }

        return this.updateRFQ(rfqId, {
            suppliers: [...rfq.suppliers, supplier],
        });
    }

    async updateRFQSupplierStatus(
        rfqId: string,
        supplierId: string,
        status: RFQSupplierStatus,
        quotationId?: string
    ): Promise<RFQ> {
        const rfq = await this.getRFQ(rfqId);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        let found = false;

        const suppliers = rfq.suppliers.map((supplier) => {
            if (supplier.supplierId !== supplierId) {
                return supplier;
            }

            found = true;

            return {
                ...supplier,
                status,
                responded: status === 'quoted',
                quotationId:
                    quotationId ?? supplier.quotationId,
            };
        });

        if (!found) {
            throw new Error(
                'Supplier is not attached to this RFQ'
            );
        }

        return this.updateRFQ(rfqId, {
            suppliers,
        });
    }

    async issueRFQ(id: string): Promise<RFQ> {
        const rfq = await this.getRFQ(id);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (rfq.status !== 'draft') {
            throw new Error(
                'Only draft RFQs can be issued'
            );
        }

        if (!rfq.suppliers.length) {
            throw new Error(
                'RFQ must have at least one supplier'
            );
        }

        return this.updateRFQ(id, {
            status: 'issued',
            issuedAt: new Date().toISOString(),
        });
    }

    async closeRFQ(id: string): Promise<RFQ> {
        const rfq = await this.getRFQ(id);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (rfq.status !== 'issued') {
            throw new Error(
                'Only issued RFQs can be closed'
            );
        }

        return this.updateRFQ(id, {
            status: 'closed',
            closedAt: new Date().toISOString(),
        });
    }

    async expireRFQ(id: string): Promise<RFQ> {
        const rfq = await this.getRFQ(id);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (rfq.status !== 'issued') {
            throw new Error(
                'Only issued RFQs can expire'
            );
        }

        return this.updateRFQ(id, {
            status: 'expired',
            closedAt: new Date().toISOString(),
        });
    }

    // ============================================================
    // QUOTATIONS
    // ============================================================

    async createQuotation(
        input: Omit<
            Quotation,
            'id' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<Quotation> {
        if (!input.rfqId) {
            throw new Error('RFQ ID is required');
        }

        if (!input.providerName?.trim()) {
            throw new Error('Provider name is required');
        }

        if (input.total < 0) {
            throw new Error(
                'Quotation total cannot be negative'
            );
        }

        const rfq = await this.getRFQ(input.rfqId);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (
            rfq.status !== 'issued' &&
            rfq.status !== 'closed'
        ) {
            throw new Error(
                'Quotation cannot be submitted for this RFQ status'
            );
        }

        const id = generateUUID();
        const now = new Date().toISOString();

        const payload = {
            id,

            rfq_id: input.rfqId,

            supplier_company_id:
                input.supplierCompanyId ?? null,

            provider_name: input.providerName.trim(),
            provider_email: input.providerEmail ?? null,
            provider_phone: input.providerPhone ?? null,

            items: input.items ?? [],

            subtotal: input.subtotal,
            tax: input.tax ?? null,
            delivery_cost: input.deliveryCost ?? null,
            total: input.total,

            currency: input.currency ?? 'KES',

            delivery_terms:
                input.deliveryTerms ?? null,

            payment_terms:
                input.paymentTerms ?? null,

            validity_days:
                input.validityDays ?? 14,

            notes: input.notes ?? null,

            status: 'submitted' as QuotationStatus,

            submitted_at: now,

            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from('procurement_quotations')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to create quotation: ${error.message}`
            );
        }

        if (input.supplierCompanyId) {
            await this.updateRFQSupplierStatus(
                input.rfqId,
                input.supplierCompanyId,
                'quoted',
                data.id
            );
        }

        return this.mapQuotation(data);
    }

    async getQuotations(
        rfqId: string
    ): Promise<Quotation[]> {
        const { data, error } = await supabase
            .from('procurement_quotations')
            .select('*')
            .eq('rfq_id', rfqId)
            .order('total', { ascending: true });

        if (error) {
            throw new Error(
                `Failed to fetch quotations: ${error.message}`
            );
        }

        return (data ?? []).map((row) =>
            this.mapQuotation(row)
        );
    }

    async getQuotation(
        id: string
    ): Promise<Quotation | null> {
        const { data, error } = await supabase
            .from('procurement_quotations')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(
                `Failed to fetch quotation: ${error.message}`
            );
        }

        return data ? this.mapQuotation(data) : null;
    }

    async updateQuotation(
        id: string,
        updates: Partial<Quotation>
    ): Promise<Quotation> {
        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (updates.items !== undefined) {
            payload.items = updates.items;
        }

        if (updates.subtotal !== undefined) {
            payload.subtotal = updates.subtotal;
        }

        if (updates.tax !== undefined) {
            payload.tax = updates.tax;
        }

        if (updates.deliveryCost !== undefined) {
            payload.delivery_cost = updates.deliveryCost;
        }

        if (updates.total !== undefined) {
            if (updates.total < 0) {
                throw new Error(
                    'Quotation total cannot be negative'
                );
            }

            payload.total = updates.total;
        }

        if (updates.deliveryTerms !== undefined) {
            payload.delivery_terms = updates.deliveryTerms;
        }

        if (updates.paymentTerms !== undefined) {
            payload.payment_terms = updates.paymentTerms;
        }

        if (updates.validityDays !== undefined) {
            payload.validity_days = updates.validityDays;
        }

        if (updates.notes !== undefined) {
            payload.notes = updates.notes;
        }

        if (updates.status !== undefined) {
            payload.status = updates.status;
        }

        if (updates.submittedAt !== undefined) {
            payload.submitted_at =
                updates.submittedAt ?? null;
        }

        const { data, error } = await supabase
            .from('procurement_quotations')
            .update(payload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to update quotation: ${error.message}`
            );
        }

        return this.mapQuotation(data);
    }

    // ============================================================
    // AWARDS
    // ============================================================

    async createAward(
        input: Omit<
            Award,
            'id' | 'status' | 'createdAt' | 'updatedAt'
        >
    ): Promise<Award> {
        const quotation = await this.getQuotation(
            input.quotationId
        );

        if (!quotation) {
            throw new Error('Quotation not found');
        }

        if (quotation.rfqId !== input.rfqId) {
            throw new Error(
                'Quotation does not belong to this RFQ'
            );
        }

        const rfq = await this.getRFQ(input.rfqId);

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        if (rfq.status === 'awarded') {
            throw new Error(
                'This RFQ has already been awarded'
            );
        }

        if (input.amount < 0) {
            throw new Error(
                'Award amount cannot be negative'
            );
        }

        const id = generateUUID();
        const now = new Date().toISOString();

        const payload = {
            id,

            quotation_id: input.quotationId,
            rfq_id: input.rfqId,
            project_id: input.projectId,

            supplier_company_id:
                input.supplierCompanyId ?? null,

            provider_name: input.providerName,

            title: input.title,
            description: input.description ?? null,

            amount: input.amount,
            currency: input.currency ?? 'KES',

            status: 'draft' as AwardStatus,

            purchase_order_reference:
                input.purchaseOrderReference ?? null,

            contract_reference:
                input.contractReference ?? null,

            approved_by: input.approvedBy ?? null,
            approved_at: input.approvedAt ?? null,

            notes: input.notes ?? null,

            created_at: now,
            updated_at: now,
        };

        const { data, error } = await supabase
            .from('procurement_awards')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to create award: ${error.message}`
            );
        }

        await this.updateRFQ(input.rfqId, {
            status: 'awarded',
        });

        return this.mapAward(data);
    }

    async getAwards(
        projectId: string
    ): Promise<Award[]> {
        const { data, error } = await supabase
            .from('procurement_awards')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(
                `Failed to fetch awards: ${error.message}`
            );
        }

        return (data ?? []).map((row) =>
            this.mapAward(row)
        );
    }

    async getAward(id: string): Promise<Award | null> {
        const { data, error } = await supabase
            .from('procurement_awards')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            throw new Error(
                `Failed to fetch award: ${error.message}`
            );
        }

        return data ? this.mapAward(data) : null;
    }

    async getAwardForRequest(
        requestId: string
    ): Promise<Award | null> {
        const request = await this.getRequest(requestId);

        if (!request?.projectId) {
            return null;
        }

        const awards = await this.getAwards(
            request.projectId
        );

        if (!awards.length) {
            return null;
        }

        // Preferred relationship:
        // request → RFQ → quotation → award.
        const rfqs = await this.getRFQs(request.projectId);

        const rfqIds = new Set(
            rfqs
                .filter(
                    (rfq) => rfq.requestId === requestId
                )
                .map((rfq) => rfq.id)
        );

        if (rfqIds.size) {
            const matchingAward = awards.find(
                (award) => rfqIds.has(award.rfqId)
            );

            if (matchingAward) {
                return matchingAward;
            }
        }

        return null;
    }

    async updateAward(
        id: string,
        updates: Partial<Award>
    ): Promise<Award> {
        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (updates.status !== undefined) {
            payload.status = updates.status;
        }

        if (updates.title !== undefined) {
            payload.title = updates.title;
        }

        if (updates.description !== undefined) {
            payload.description = updates.description;
        }

        if (updates.amount !== undefined) {
            if (updates.amount < 0) {
                throw new Error(
                    'Award amount cannot be negative'
                );
            }

            payload.amount = updates.amount;
        }

        if (updates.projectId !== undefined) {
            payload.project_id =
                updates.projectId ?? null;
        }

        if (updates.purchaseOrderReference !== undefined) {
            payload.purchase_order_reference =
                updates.purchaseOrderReference;
        }

        if (updates.contractReference !== undefined) {
            payload.contract_reference =
                updates.contractReference;
        }

        if (updates.approvedBy !== undefined) {
            payload.approved_by =
                updates.approvedBy ?? null;
        }

        if (updates.approvedAt !== undefined) {
            payload.approved_at =
                updates.approvedAt ?? null;
        }

        if (updates.notes !== undefined) {
            payload.notes = updates.notes;
        }

        const { data, error } = await supabase
            .from('procurement_awards')
            .update(payload)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to update award: ${error.message}`
            );
        }

        return this.mapAward(data);
    }

    // ============================================================
    // DELIVERIES
    // ============================================================

    async getDeliveries(
        procurementRequestId: string
    ): Promise<ProcurementDelivery[]> {
        const { data, error } = await supabase
            .from('procurement_deliveries')
            .select('*')
            .eq(
                'procurement_request_id',
                procurementRequestId
            )
            .order('delivery_number', {
                ascending: true,
            });

        if (error) {
            throw new Error(
                `Failed to get deliveries: ${error.message}`
            );
        }

        return (data ?? []).map((row) =>
            this.mapDelivery(row)
        );
    }

    async confirmDelivery(
        input: {
            procurementRequestId: string;
            workspaceId: string;
            quantityDelivered: number;
            unit?: string;
            condition: DeliveryCondition;
            notes?: string;
            userId: string;
            receivedBy?: string;
            deliveryDate?: string;
            receivedDate?: string;
        }
    ): Promise<{
        delivery: ProcurementDelivery;
        request: ProcurementRequest;
    }> {
        if (input.quantityDelivered < 0) {
            throw new Error(
                'Delivered quantity cannot be negative'
            );
        }

        const request = await this.getRequest(
            input.procurementRequestId
        );

        if (!request) {
            throw new Error(
                'Procurement request not found'
            );
        }

        if (
            request.status !== 'ordered' &&
            request.status !== 'delivering'
        ) {
            throw new Error(
                `Delivery cannot be recorded while request is "${request.status}".`
            );
        }

        const existingDeliveries =
            await this.getDeliveries(
                input.procurementRequestId
            );

        const deliveryNumber =
            existingDeliveries.length + 1;

        const quantityOrdered =
            Number(request.quantity ?? 0);

        const previouslyDelivered =
            existingDeliveries.reduce(
                (sum, delivery) =>
                    sum +
                    Number(
                        delivery.quantityDelivered ?? 0
                    ),
                0
            );

        const totalDelivered =
            previouslyDelivered +
            Number(input.quantityDelivered);

        if (
            quantityOrdered > 0 &&
            totalDelivered > quantityOrdered
        ) {
            throw new Error(
                'Delivery exceeds ordered quantity'
            );
        }

        const now =
            input.deliveryDate ??
            new Date().toISOString();

        const receivedAt =
            input.receivedDate ?? now;

        const { data, error } = await supabase
            .from('procurement_deliveries')
            .insert({
                procurement_request_id:
                    input.procurementRequestId,

                workspace_id: input.workspaceId,

                delivery_number: deliveryNumber,

                delivery_date: now,

                quantity_ordered: quantityOrdered,

                quantity_delivered:
                    input.quantityDelivered,

                unit:
                    input.unit ??
                    request.unit ??
                    null,

                condition: input.condition,

                notes: input.notes ?? null,

                confirmed_by: input.userId,
                confirmed_at: now,

                received_by:
                    input.receivedBy ??
                    input.userId,

                received_at: receivedAt,
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to confirm delivery: ${error.message}`
            );
        }

        let updatedRequest = request;

        // Rejected delivery.
        if (input.condition === 'rejected') {
            updatedRequest =
                await this.transitionRequest(
                    input.procurementRequestId,
                    input.userId,
                    'rejected' as ProcurementStatus,
                    input.notes ??
                    'Delivery rejected.',
                    {
                        rejected_at: now,
                        rejected_by: input.userId,
                        rejection_reason:
                            input.notes ??
                            'Delivery rejected.',
                    }
                );
        }
        // Fully delivered.
        else if (
            quantityOrdered > 0 &&
            totalDelivered >= quantityOrdered
        ) {
            updatedRequest =
                await this.transitionRequest(
                    input.procurementRequestId,
                    input.userId,
                    'delivered' as ProcurementStatus,
                    input.notes
                );
        }
        // First/partial delivery.
        else if (request.status === 'ordered') {
            updatedRequest =
                await this.transitionRequest(
                    input.procurementRequestId,
                    input.userId,
                    'delivering' as ProcurementStatus,
                    input.notes
                );
        }

        return {
            delivery: this.mapDelivery(data),
            request: updatedRequest,
        };
    }

    // ============================================================
    // EVIDENCE
    // ============================================================

    async getEvidence(
        procurementRequestId: string
    ): Promise<ProcurementEvidence[]> {
        const { data, error } = await supabase
            .from('procurement_evidence')
            .select('*')
            .eq('procurement_request_id', procurementRequestId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get evidence: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        const evidence = await Promise.all(
            data.map(async (row) => {
                let freshUrl = row.file_url;

                if (row.storage_path) {
                    freshUrl = await procurementStorage.getSignedUrl(
                        row.storage_path,
                        3600
                    );
                }

                return {
                    ...row,
                    file_url: freshUrl,
                };
            })
        );

        return evidence as ProcurementEvidence[];
    }

    async uploadEvidence(
        input: {
            procurementRequestId: string;
            workspaceId: string;
            deliveryId?: string;
            type: EvidenceType;
            fileUrl?: string;
            storagePath?: string;
            fileName?: string;
            mimeType?: string;
            fileSize?: number;
            description?: string;
            userId: string;
        }
    ): Promise<ProcurementEvidence> {
        const payload = {
            procurement_request_id:
                input.procurementRequestId,

            delivery_id:
                input.deliveryId ?? null,

            workspace_id:
                input.workspaceId,

            type: input.type,

            file_url:
                input.fileUrl ?? null,

            storage_path:
                input.storagePath ?? null,

            file_name:
                input.fileName ?? null,

            mime_type:
                input.mimeType ?? null,

            file_size:
                input.fileSize ?? null,

            description:
                input.description ?? null,

            uploaded_by: input.userId,

            uploaded_at:
                new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('procurement_evidence')
            .insert(payload)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to upload evidence: ${error.message}`
            );
        }

        return this.mapEvidence(data);
    }

    async deleteEvidence(
        id: string
    ): Promise<void> {
        if (!id) {
            throw new Error('Evidence ID is required');
        }

        const { error } = await supabase
            .from('procurement_evidence')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(
                `Failed to delete evidence: ${error.message}`
            );
        }
    }

    // ============================================================
    // CALCULATIONS
    // ============================================================

    async getCalculations(
        procurementRequestId: string
    ): Promise<ProcurementCalculation[]> {
        const { data, error } = await supabase
            .from('procurement_calculations')
            .select('*')
            .eq(
                'procurement_request_id',
                procurementRequestId
            )
            .order('created_at', {
                ascending: false,
            });

        if (error) {
            throw new Error(
                `Failed to get calculations: ${error.message}`
            );
        }

        return (data ?? []).map((row) => this.mapCalculation(row));
    }

    async addCalculation(
        input: {
            procurementRequestId: string;
            workspaceId: string;
            deliveryId?: string;
            expression: string;
            result: number;
            unit?: string;
            description?: string;
            userId: string;
        }
    ): Promise<ProcurementCalculation> {
        if (!input.expression?.trim()) {
            throw new Error(
                'Calculation expression is required'
            );
        }

        if (!Number.isFinite(input.result)) {
            throw new Error(
                'Calculation result must be a valid number'
            );
        }

        const { data, error } = await supabase
            .from('procurement_calculations')
            .insert({
                procurement_request_id:
                    input.procurementRequestId,

                delivery_id:
                    input.deliveryId ?? null,

                workspace_id:
                    input.workspaceId,

                expression:
                    input.expression.trim(),

                result: input.result,

                unit: input.unit ?? null,

                description:
                    input.description ?? null,

                created_by: input.userId,

                created_at:
                    new Date().toISOString(),
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to add calculation: ${error.message}`
            );
        }

        return this.mapCalculation(data);
    }

    // ============================================================
    // PAYMENTS
    // ============================================================

    async getPayments(
        procurementRequestId: string
    ): Promise<ProcurementPayment[]> {
        const { data, error } = await supabase
            .from('procurement_payments')
            .select('*')
            .eq(
                'procurement_request_id',
                procurementRequestId
            )
            .order('created_at', {
                ascending: false,
            });

        if (error) {
            throw new Error(
                `Failed to get payments: ${error.message}`
            );
        }

        return (data ?? []).map((row) => this.mapPayment(row));
    }

    async reportPayment(
        input: {
            procurementRequestId: string;
            workspaceId: string;
            amount: number;
            currency?: string;
            paymentMethod: PaymentMethod;
            transactionReference?: string;
            paymentDate?: string;
            notes?: string;
            userId: string;
        }
    ): Promise<{
        payment: ProcurementPayment;
        request: ProcurementRequest;
    }> {
        if (input.amount <= 0) {
            throw new Error(
                'Payment amount must be greater than zero'
            );
        }

        const request = await this.getRequest(
            input.procurementRequestId
        );

        if (!request) {
            throw new Error(
                'Procurement request not found'
            );
        }

        if (
            request.status !== 'verified' &&
            request.status !== 'payment_pending'
        ) {
            throw new Error(
                `Payment cannot be reported while request is "${request.status}".`
            );
        }

        const now =
            input.paymentDate ??
            new Date().toISOString();

        const { data, error } = await supabase
            .from('procurement_payments')
            .insert({
                procurement_request_id:
                    input.procurementRequestId,

                workspace_id:
                    input.workspaceId,

                amount: input.amount,

                currency:
                    input.currency ?? 'KES',

                payment_method:
                    input.paymentMethod,

                transaction_reference:
                    input.transactionReference ??
                    null,

                payment_date: now,

                status:
                    'reported' as PaymentStatus,

                reported_by:
                    input.userId,

                reported_at: now,

                notes:
                    input.notes ?? null,

                updated_at: now,
            })
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Failed to report payment: ${error.message}`
            );
        }

        let updatedRequest = request;

        if (request.status === 'verified') {
            updatedRequest =
                await this.transitionRequest(
                    input.procurementRequestId,
                    input.userId,
                    'payment_pending' as ProcurementStatus,
                    input.notes
                );
        }

        return {
            payment: this.mapPayment(data),
            request: updatedRequest,
        };
    }

    /**
     * Calculates the authoritative payable amount.
     *
     * Relationship:
     * request
     *   → RFQ
     *      → Award
     *
     * Falls back to request.budget if an award cannot
     * be resolved.
     */
    private async getPayableAmount(
        request: ProcurementRequest
    ): Promise<number> {
        const award = await this.getAwardForRequest(
            request.id
        );

        if (award) {
            return Number(award.amount);
        }

        return Number(request.budget ?? 0);
    }

    async verifyPayment(
        paymentId: string,
        userId: string,
        notes?: string
    ): Promise<{
        payment: ProcurementPayment;
        request: ProcurementRequest;
    }> {
        if (!paymentId) {
            throw new Error('Payment ID is required');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        const { data: payment, error: fetchError } =
            await supabase
                .from('procurement_payments')
                .select('*')
                .eq('id', paymentId)
                .single();

        if (fetchError) {
            throw new Error(
                `Failed to fetch payment: ${fetchError.message}`
            );
        }

        if (
            payment.status !== 'reported' &&
            payment.status !== 'pending_verification'
        ) {
            throw new Error(
                'Payment is not awaiting verification'
            );
        }

        const request = await this.getRequest(
            payment.procurement_request_id
        );

        if (!request) {
            throw new Error(
                'Procurement request not found'
            );
        }

        const now = new Date().toISOString();

        const { data: updatedPayment, error: updateError } =
            await supabase
                .from('procurement_payments')
                .update({
                    status:
                        'verified' as PaymentStatus,

                    verified_by: userId,
                    verified_at: now,

                    verification_notes:
                        notes?.trim() ?? null,

                    updated_at: now,
                })
                .eq('id', paymentId)
                .select('*')
                .single();

        if (updateError) {
            throw new Error(
                `Failed to verify payment: ${updateError.message}`
            );
        }

        const payments = await this.getPayments(
            payment.procurement_request_id
        );

        const totalVerified = payments
            .filter(
                (item) => item.status === 'verified'
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount ?? 0),
                0
            );

        const payableAmount =
            await this.getPayableAmount(request);

        const isFullyPaid =
            payableAmount > 0 &&
            totalVerified >= payableAmount;

        let updatedRequest: ProcurementRequest;

        if (isFullyPaid) {
            updatedRequest =
                await this.transitionRequest(
                    payment.procurement_request_id,
                    userId,
                    'paid' as ProcurementStatus,
                    notes
                );
        } else {
            updatedRequest = request;

            if (request.status !== 'payment_pending') {
                updatedRequest =
                    await this.transitionRequest(
                        payment.procurement_request_id,
                        userId,
                        'payment_pending' as ProcurementStatus,
                        notes
                    );
            }
        }

        return {
            payment: this.mapPayment(updatedPayment),
            request: updatedRequest,
        };
    }
    async rejectPayment(
        paymentId: string,
        userId: string,
        notes: string
    ): Promise<{
        payment: ProcurementPayment;
        request: ProcurementRequest;
    }> {
        if (!notes?.trim()) {
            throw new Error(
                'Payment rejection reason is required'
            );
        }

        const { data: payment, error: fetchError } =
            await supabase
                .from('procurement_payments')
                .select('*')
                .eq('id', paymentId)
                .single();

        if (fetchError) {
            throw new Error(
                `Failed to fetch payment: ${fetchError.message}`
            );
        }

        const now = new Date().toISOString();

        const {
            data: rejectedPayment,
            error: updateError,
        } = await supabase
            .from('procurement_payments')
            .update({
                status:
                    'rejected' as PaymentStatus,

                verified_by: userId,
                verified_at: now,

                verification_notes:
                    notes.trim(),

                updated_at: now,
            })
            .eq('id', paymentId)
            .select('*')
            .single();

        if (updateError) {
            throw new Error(
                `Failed to reject payment: ${updateError.message}`
            );
        }

        const request = await this.getRequest(
            payment.procurement_request_id
        );

        if (!request) {
            throw new Error(
                'Procurement request not found'
            );
        }

        // A rejected payment does NOT reject the procurement.
        // It remains payment_pending.
        let updatedRequest = request;

        if (
            request.status !==
            ('payment_pending' as ProcurementStatus)
        ) {
            updatedRequest =
                await this.transitionRequest(
                    payment.procurement_request_id,
                    userId,
                    'payment_pending' as ProcurementStatus,
                    notes
                );
        }

        return {
            payment: this.mapPayment(rejectedPayment),
            request: updatedRequest,
        };
    }

    // ============================================================
    // TRANSACTION SUMMARY
    // ============================================================

    async getTransactionSummary(
        procurementRequestId: string
    ) {
        const [
            request,
            deliveries,
            evidence,
            calculations,
            payments,
        ] = await Promise.all([
            this.getRequest(procurementRequestId),
            this.getDeliveries(procurementRequestId),
            this.getEvidence(procurementRequestId),
            this.getCalculations(procurementRequestId),
            this.getPayments(procurementRequestId),
        ]);

        if (!request) {
            throw new Error(
                'Procurement request not found'
            );
        }

        const orderedQuantity =
            Number(request.quantity ?? 0);

        const deliveredQuantity =
            deliveries.reduce(
                (sum, delivery) =>
                    sum +
                    Number(
                        delivery.quantityDelivered ?? 0
                    ),
                0
            );

        const deliveryPercentage =
            orderedQuantity > 0
                ? Math.min(
                    100,
                    (deliveredQuantity /
                        orderedQuantity) *
                    100
                )
                : 0;

        const totalPaymentReported =
            payments
                .filter(
                    (payment) =>
                        payment.status !==
                        'rejected'
                )
                .reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amount ?? 0),
                    0
                );

        const totalPaymentVerified =
            payments
                .filter(
                    (payment) =>
                        payment.status ===
                        'verified'
                )
                .reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amount ?? 0),
                    0
                );

        const payableAmount =
            await this.getPayableAmount(request);

        const balance = Math.max(
            0,
            payableAmount -
            totalPaymentVerified
        );

        return {
            request,

            deliveries,
            evidence,
            calculations,
            payments,

            orderedQuantity,

            deliveredQuantity,

            remainingQuantity: Math.max(
                0,
                orderedQuantity -
                deliveredQuantity
            ),

            deliveryPercentage,

            totalPaymentReported,

            totalPaymentVerified,

            budget:
                Number(request.budget ?? 0),

            payableAmount,

            balance,

            hasDeliveryEvidence:
                evidence.some(
                    (item) =>
                        item.type ===
                        'delivery_photo' ||
                        item.type ===
                        'delivery_note'
                ),

            hasPaymentEvidence:
                evidence.some(
                    (item) =>
                        item.type ===
                        'payment_receipt'
                ),

            isFullyDelivered:
                orderedQuantity > 0 &&
                deliveredQuantity >=
                orderedQuantity,

            isPaymentPending:
                payments.some(
                    (payment) =>
                        payment.status ===
                        'reported' ||
                        payment.status ===
                        'pending_verification'
                ),

            isPaid:
                payableAmount > 0 &&
                totalPaymentVerified >=
                payableAmount,

            isCompleted:
                request.status ===
                'completed',
        };
    }

    // ============================================================
    // PLATFORM COMPANIES
    // ============================================================

    async getPlatformCompanies(): Promise<
        Array<{ id: string; name: string }>
    > {
        try {
            const { data, error } =
                await supabase.rpc(
                    'get_platform_companies'
                );

            if (error) {
                console.error(
                    '[ProcurementRepository] Failed to load platform companies:',
                    error
                );

                return [];
            }

            return (data ?? []).map(
                (company: any) => ({
                    id: company.id,
                    name: company.name,
                })
            );
        } catch (error) {
            console.error(
                '[ProcurementRepository] Failed to load platform companies:',
                error
            );

            return [];
        }
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    async notifyCompaniesOfNewRFQ(
        requestId: string
    ): Promise<void> {
        try {
            const request =
                await this.getRequest(requestId);

            if (!request) {
                return;
            }

            // Only public requests are broadcast.
            if (request.supplierCompanyId) {
                return;
            }

            const { data: companies, error } =
                await supabase.rpc(
                    'get_platform_companies'
                );

            if (error || !companies?.length) {
                return;
            }

            const notifications =
                companies.map((company: any) => ({
                    company_id: company.id,

                    type: 'new_public_rfq',

                    title:
                        'New Public RFQ Available',

                    message:
                        `A new public procurement request has been posted: ${request.title}`,

                    procurement_request_id:
                        requestId,

                    is_read: false,

                    created_at:
                        new Date().toISOString(),
                }));

            const { error: insertError } =
                await supabase
                    .from('notifications')
                    .insert(notifications);

            if (insertError) {
                console.warn(
                    '[ProcurementRepository] Failed to create RFQ notifications:',
                    insertError
                );
            }
        } catch (error) {
            console.warn(
                '[ProcurementRepository] Failed to notify companies:',
                error
            );
        }
    }

    // ============================================================
    // MAPPERS
    // ============================================================

    private mapRequest(row: any): ProcurementRequest {
        return {
            id: row.id,
            projectId: row.project_id ?? undefined,
            workspaceId: row.workspace_id ?? undefined,
            supplierCompanyId: row.supplier_company_id ?? undefined,
            supplierCompanyName: row.supplier_company_name ?? undefined,
            assignedSupplierId: row.assigned_supplier_id ?? undefined,
            assignedSupplierName: row.assigned_supplier_name ?? undefined,
            reference: row.reference,
            title: row.title,
            supplierAcceptedAt: row.supplier_accepted_at ?? undefined,
            supplierAcceptedBy: row.supplier_accepted_by ?? undefined,
            description: row.description ?? '',
            category: row.category as ProcurementCategory,
            quantity: row.quantity ?? undefined,
            unit: row.unit ?? undefined,
            requiredDate: row.required_date ?? undefined,
            deliveryLocation: row.delivery_location ?? undefined,
            budget: row.budget ?? undefined,
            currency: row.currency ?? 'KES',
            specifications: row.specifications ?? {},
            status: row.status as ProcurementStatus,
            createdBy: row.created_by ?? undefined,
            linkedDrawingIds: row.linked_drawing_ids ?? [],
            linkedRFIIds: row.linked_rfi_ids ?? [],
            // ✅ ADD THIS - status history
            statusHistory: row.status_history ?? [],
            receivedBy: row.received_by ?? undefined,
            receivedAt: row.received_at ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        } as ProcurementRequest;
    }

    private mapRFQ(row: any): RFQ {
        return {
            id: row.id,

            requestId:
                row.request_id ??
                undefined,

            projectId:
                row.project_id,

            reference:
                row.reference,

            title:
                row.title,

            description:
                row.description ??
                '',

            suppliers:
                row.suppliers ??
                [],

            deadline:
                row.deadline,

            terms:
                row.terms ??
                undefined,

            status:
                row.status as RFQStatus,

            issuedAt:
                row.issued_at ??
                undefined,

            closedAt:
                row.closed_at ??
                undefined,

            createdBy:
                row.created_by ??
                undefined,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at,
        };
    }

    private mapQuotation(
        row: any
    ): Quotation {
        return {
            id: row.id,

            rfqId:
                row.rfq_id,

            supplierCompanyId:
                row.supplier_company_id ??
                undefined,

            providerName:
                row.provider_name,

            providerEmail:
                row.provider_email ??
                undefined,

            providerPhone:
                row.provider_phone ??
                undefined,

            items:
                row.items ??
                [],

            subtotal:
                Number(row.subtotal ?? 0),

            tax:
                row.tax !== null &&
                    row.tax !== undefined
                    ? Number(row.tax)
                    : undefined,

            deliveryCost:
                row.delivery_cost !== null &&
                    row.delivery_cost !== undefined
                    ? Number(
                        row.delivery_cost
                    )
                    : undefined,

            total:
                Number(row.total ?? 0),

            currency:
                row.currency ??
                'KES',

            deliveryTerms:
                row.delivery_terms ??
                undefined,

            paymentTerms:
                row.payment_terms ??
                undefined,

            validityDays:
                Number(
                    row.validity_days ?? 14
                ),

            notes:
                row.notes ??
                undefined,

            status:
                row.status as QuotationStatus,

            submittedAt:
                row.submitted_at ??
                undefined,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at,
        };
    }

    private mapAward(
        row: any
    ): Award {
        return {
            id: row.id,

            quotationId:
                row.quotation_id,

            rfqId:
                row.rfq_id,

            projectId:
                row.project_id,

            supplierCompanyId:
                row.supplier_company_id ??
                undefined,

            providerName:
                row.provider_name,

            title:
                row.title,

            description:
                row.description ??
                '',

            amount:
                Number(row.amount ?? 0),

            currency:
                row.currency ??
                'KES',

            status:
                row.status as AwardStatus,

            purchaseOrderReference:
                row.purchase_order_reference ??
                undefined,

            contractReference:
                row.contract_reference ??
                undefined,

            approvedBy:
                row.approved_by ??
                undefined,

            approvedAt:
                row.approved_at ??
                undefined,

            notes:
                row.notes ??
                undefined,

            createdAt:
                row.created_at,

            updatedAt:
                row.updated_at,
        };
    }

    private mapDelivery(row: any): ProcurementDelivery {
        return {
            id: row.id,
            procurementRequestId: row.procurement_request_id,
            workspaceId: row.workspace_id,
            deliveryNumber: row.delivery_number,
            deliveryDate: row.delivery_date,
            quantityOrdered: Number(row.quantity_ordered ?? 0),
            quantityDelivered: Number(row.quantity_delivered ?? 0),
            unit: row.unit ?? undefined,
            condition: row.condition,
            notes: row.notes ?? undefined,
            confirmedBy: row.confirmed_by ?? undefined,
            confirmedAt: row.confirmed_at ?? undefined,
            receivedBy: row.received_by ?? undefined,
            receivedAt: row.received_at ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapEvidence(row: any): ProcurementEvidence {
        return {
            id: row.id,
            procurementRequestId: row.procurement_request_id,
            deliveryId: row.delivery_id ?? undefined,
            workspaceId: row.workspace_id,
            type: row.type as EvidenceType,
            fileUrl: row.file_url ?? undefined,
            storagePath: row.storage_path ?? undefined,
            fileName: row.file_name ?? undefined,
            mimeType: row.mime_type ?? undefined,
            fileSize: row.file_size ?? undefined,
            description: row.description ?? undefined,
            uploadedBy: row.uploaded_by ?? undefined,
            uploadedAt: row.uploaded_at,
        } as ProcurementEvidence;
    }

    private mapCalculation(row: any): ProcurementCalculation {
        return {
            id: row.id,
            procurementRequestId: row.procurement_request_id,
            deliveryId: row.delivery_id ?? undefined,
            workspaceId: row.workspace_id,
            expression: row.expression,
            result: Number(row.result ?? 0),
            unit: row.unit ?? undefined,
            description: row.description ?? undefined,
            createdBy: row.created_by ?? undefined,
            createdAt: row.created_at,
        } as ProcurementCalculation;
    }

    private mapPayment(row: any): ProcurementPayment {
        return {
            id: row.id,
            procurementRequestId: row.procurement_request_id,
            workspaceId: row.workspace_id,
            amount: Number(row.amount ?? 0),
            currency: row.currency ?? 'KES',
            paymentMethod: row.payment_method as PaymentMethod,
            transactionReference: row.transaction_reference ?? undefined,
            paymentDate: row.payment_date ?? undefined,
            status: row.status as PaymentStatus,
            reportedBy: row.reported_by ?? undefined,
            reportedAt: row.reported_at ?? undefined,
            verifiedBy: row.verified_by ?? undefined,
            verifiedAt: row.verified_at ?? undefined,
            verificationNotes: row.verification_notes ?? undefined,
            notes: row.notes ?? undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        } as ProcurementPayment;
    }
}

// ============================================================
// SINGLETON
// ============================================================

export const procurementRepository =
    new ProcurementRepository();