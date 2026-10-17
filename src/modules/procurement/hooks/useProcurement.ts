// src/modules/procurement/hooks/useProcurement.ts

import { useState, useEffect, useCallback } from 'react';

import { ProcurementService } from '../services/ProcurementService';
import { procurementRepository } from '../repositories/ProcurementRepository';
import { procurementStorage } from '../services/procurementStorage';

import type {
    ProcurementRequest,
    RFQ,
    RFQSupplier,
    RFQSupplierStatus,
    Award,
    Quotation,
    DeliveryCondition,
    PaymentMethod,
    EvidenceType,
} from '../domain';

const procurementService = new ProcurementService(procurementRepository);

interface UseProcurementOptions {
    projectId?: string;
    workspaceId?: string;
    autoLoad?: boolean;
    userId?: string;
}

export function useProcurement({
    projectId,
    workspaceId,
    autoLoad = true,
    userId,
}: UseProcurementOptions) {
    const [requests, setRequests] = useState<ProcurementRequest[]>([]);
    const [rfqs, setRFQs] = useState<RFQ[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAll = useCallback(async () => {
        if (!workspaceId) {
            setRequests([]);
            setRFQs([]);
            setAwards([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // ✅ Pass userId to getRequests
            const requestsPromise = procurementService.getRequests(
                projectId,
                workspaceId,
                userId  // ✅ Use the userId from options
            );

            const rfqsPromise = projectId ? procurementService.getRFQs(projectId) : Promise.resolve([]);
            const awardsPromise = projectId ? procurementService.getAwards(projectId) : Promise.resolve([]);

            const [requestsData, rfqsData, awardsData] = await Promise.all([
                requestsPromise,
                rfqsPromise,
                awardsPromise,
            ]);

            setRequests(requestsData);
            setRFQs(rfqsData);
            setAwards(awardsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load procurement data');
        } finally {
            setLoading(false);
        }
    }, [projectId, workspaceId, userId]);  // ✅ Add userId to dependencies

    useEffect(() => {
        if (autoLoad && workspaceId) {
            void loadAll();
        }
    }, [autoLoad, workspaceId, loadAll]);

    // ============================================================
    // CRUD
    // ============================================================

    const createRequest = useCallback(async (input: Omit<
        ProcurementRequest,
        'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'
    >) => {
        const normalizedInput = {
            ...input,
            supplierCompanyId: input.supplierCompanyId || null,
            supplierCompanyName: input.supplierCompanyName || undefined,
        };

        const result = await procurementService.createRequest(normalizedInput as ProcurementRequest);
        setRequests((prev) => [result, ...prev]);
        return result;
    }, []);

    const updateRequest = useCallback(async (id: string, updates: Partial<ProcurementRequest>) => {
        const result = await procurementService.updateRequest(id, updates);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const getRequest = useCallback(async (id: string) => {
        return procurementService.getRequest(id);
    }, []);

    // ============================================================
    // PROCUREMENT WORKFLOW
    // ============================================================

    const markReceived = useCallback(async (requestId: string, userId: string) => {
        const result = await procurementRepository.markReceived(requestId, userId);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const submitRequest = useCallback(async (requestId: string, userId: string, note?: string) => {
        const result = await procurementRepository.submitRequest(requestId, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const markOrdered = useCallback(async (requestId: string, userId: string) => {
        const result = await procurementRepository.markOrdered(requestId, userId);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const markDelivering = useCallback(async (requestId: string, userId: string) => {
        const result = await procurementRepository.markDelivering(requestId, userId);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const verifyDeliveryStatus = useCallback(async (requestId: string, userId: string, note?: string) => {
        const result = await procurementRepository.verifyDelivery(requestId, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const completeRequest = useCallback(async (requestId: string, userId: string) => {
        const result = await procurementRepository.completeRequest(requestId, userId);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const cancelRequest = useCallback(async (requestId: string, userId: string, reason: string) => {
        const result = await procurementRepository.cancelRequest(requestId, userId, reason);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    const rejectRequest = useCallback(async (requestId: string, userId: string, reason: string) => {
        const result = await procurementRepository.rejectRequest(requestId, userId, reason);
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // SUPPLIER WORKFLOW (NEW)
    // ============================================================

    /**
     * Supplier accepts a procurement request.
     * Only the supplier assigned to this request can accept it.
     */
    const acceptSupplierRequest = useCallback(async (
        requestId: string,
        supplierCompanyId: string,
        userId: string,
        note?: string
    ) => {
        const result = await procurementService.acceptSupplierRequest(
            requestId,
            supplierCompanyId,
            userId,
            note
        );
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    /**
     * Requester confirms receipt of delivered goods/services.
     * Only the requester (workspace owner) can confirm receipt.
     */
    const confirmRequesterReceipt = useCallback(async (
        requestId: string,
        requesterWorkspaceId: string,
        userId: string,
        note?: string
    ) => {
        const result = await procurementService.confirmRequesterReceipt(
            requestId,
            requesterWorkspaceId,
            userId,
            note
        );
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // SUPPLIER REQUESTS
    // ============================================================

    const getSupplierRequests = useCallback(async (supplierCompanyId: string) => {
        if (!supplierCompanyId) return [];
        return procurementRepository.getSupplierRequests(supplierCompanyId);
    }, []);

    const sendRequestToSupplier = useCallback(async (
        requestId: string,
        supplierCompanyId: string,
        supplierCompanyName?: string
    ) => {
        const result = await procurementRepository.sendRequestToSupplier(
            requestId,
            supplierCompanyId,
            supplierCompanyName
        );
        setRequests((prev) => prev.map((r) => (r.id === result.id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // RFQs
    // ============================================================

    const createRFQ = useCallback(async (input: Omit<RFQ, 'id' | 'reference' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const result = await procurementService.createRFQ(input as RFQ);
        setRFQs((prev) => [result, ...prev]);
        return result;
    }, []);

    const updateRFQ = useCallback(async (id: string, updates: Partial<RFQ>) => {
        const result = await procurementService.updateRFQ(id, updates);
        setRFQs((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const addSupplierToRFQ = useCallback(async (rfqId: string, supplier: RFQSupplier) => {
        const result = await procurementRepository.addSupplierToRFQ(rfqId, supplier);
        setRFQs((prev) => prev.map((r) => (r.id === rfqId ? result : r)));
        return result;
    }, []);

    const updateRFQSupplierStatus = useCallback(async (
        rfqId: string,
        supplierId: string,
        status: RFQSupplierStatus,
        quotationId?: string
    ) => {
        const result = await procurementRepository.updateRFQSupplierStatus(
            rfqId,
            supplierId,
            status,
            quotationId
        );
        setRFQs((prev) => prev.map((r) => (r.id === rfqId ? result : r)));
        return result;
    }, []);

    const issueRFQ = useCallback(async (id: string) => {
        const result = await procurementRepository.issueRFQ(id);
        setRFQs((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const closeRFQ = useCallback(async (id: string) => {
        const result = await procurementRepository.closeRFQ(id);
        setRFQs((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const expireRFQ = useCallback(async (id: string) => {
        const result = await procurementRepository.expireRFQ(id);
        setRFQs((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // QUOTATIONS
    // ============================================================

    const getQuotations = useCallback(async (rfqId: string) => {
        return procurementRepository.getQuotations(rfqId);
    }, []);

    const createQuotation = useCallback(async (input: Omit<Quotation, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const result = await procurementRepository.createQuotation(input);
        return result;
    }, []);

    const updateQuotation = useCallback(async (id: string, updates: Partial<Quotation>) => {
        const result = await procurementRepository.updateQuotation(id, updates);
        return result;
    }, []);

    // ============================================================
    // AWARDS
    // ============================================================

    const createAward = useCallback(async (input: Omit<Award, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const result = await procurementRepository.createAward(input);
        setAwards((prev) => [result, ...prev]);
        return result;
    }, []);

    const updateAward = useCallback(async (id: string, updates: Partial<Award>) => {
        const result = await procurementRepository.updateAward(id, updates);
        setAwards((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const getAwards = useCallback(async (projectId: string) => {
        return procurementRepository.getAwards(projectId);
    }, []);

    // ============================================================
    // DELIVERIES
    // ============================================================

    const getDeliveries = useCallback(async (requestId: string) => {
        return procurementRepository.getDeliveries(requestId);
    }, []);

    const confirmDelivery = useCallback(async (input: {
        procurementRequestId: string;
        workspaceId: string;
        quantityDelivered: number;
        unit?: string;
        condition: DeliveryCondition;
        notes?: string;
        userId: string;
        deliveryDate?: string;
    }) => {
        if (!input.workspaceId) {
            throw new Error('No request workspace ID');
        }

        const result = await procurementRepository.confirmDelivery({
            procurementRequestId: input.procurementRequestId,
            workspaceId: input.workspaceId,
            quantityDelivered: input.quantityDelivered,
            unit: input.unit,
            condition: input.condition,
            notes: input.notes,
            userId: input.userId,
            deliveryDate: input.deliveryDate,
        });

        setRequests((prev) =>
            prev.map((r) => (r.id === result.request.id ? result.request : r))
        );

        return result;
    }, []);

    // ============================================================
    // EVIDENCE
    // ============================================================

    const getEvidence = useCallback(async (requestId: string) => {
        return procurementRepository.getEvidence(requestId);
    }, []);

    const uploadEvidence = useCallback(async (input: {
        procurementRequestId: string;
        workspaceId: string;
        deliveryId?: string;
        type: EvidenceType;
        file: File;
        description?: string;
        userId: string;
    }) => {
        if (!input.workspaceId) {
            throw new Error('No request workspace ID');
        }

        const { url, path } = await procurementStorage.uploadEvidence(
            input.workspaceId,
            input.procurementRequestId,
            input.file
        );

        try {
            const result = await procurementRepository.uploadEvidence({
                procurementRequestId: input.procurementRequestId,
                deliveryId: input.deliveryId,
                workspaceId: input.workspaceId,
                type: input.type,
                storagePath: path,
                fileName: input.file.name,
                mimeType: input.file.type,
                fileSize: input.file.size,
                description: input.description,
                userId: input.userId,
            });
            return result;
        } catch (error) {
            await procurementStorage.deleteEvidence(path);
            throw error;
        }
    }, []);

    const deleteEvidence = useCallback(async (id: string, storagePath: string) => {
        await procurementStorage.deleteEvidence(storagePath);
        return procurementRepository.deleteEvidence(id);
    }, []);

    // ============================================================
    // CALCULATIONS
    // ============================================================

    const getCalculations = useCallback(async (requestId: string) => {
        return procurementRepository.getCalculations(requestId);
    }, []);

    const addCalculation = useCallback(async (input: {
        procurementRequestId: string;
        deliveryId?: string;
        expression: string;
        result: number;
        unit?: string;
        description?: string;
        userId: string;
    }) => {
        if (!workspaceId) throw new Error('No workspace ID');
        return procurementRepository.addCalculation({
            ...input,
            workspaceId,
        });
    }, [workspaceId]);

    // ============================================================
    // PAYMENTS
    // ============================================================

    const getPayments = useCallback(async (requestId: string) => {
        return procurementRepository.getPayments(requestId);
    }, []);

    const reportPayment = useCallback(async (input: {
        procurementRequestId: string;
        workspaceId: string;
        amount: number;
        currency?: string;
        paymentMethod: PaymentMethod;
        transactionReference?: string;
        paymentDate?: string;
        notes?: string;
        userId: string;
    }) => {
        if (!input.workspaceId) {
            throw new Error('No request workspace ID');
        }

        const result = await procurementRepository.reportPayment({
            procurementRequestId: input.procurementRequestId,
            workspaceId: input.workspaceId,
            amount: input.amount,
            currency: input.currency,
            paymentMethod: input.paymentMethod,
            transactionReference: input.transactionReference,
            paymentDate: input.paymentDate,
            notes: input.notes,
            userId: input.userId,
        });

        setRequests((prev) =>
            prev.map((r) => (r.id === result.request.id ? result.request : r))
        );

        return result;
    }, []);
    const verifyPayment = useCallback(async (paymentId: string, userId: string, notes?: string) => {
        const result = await procurementRepository.verifyPayment(paymentId, userId, notes);
        setRequests((prev) => prev.map((r) => (r.id === result.request.id ? result.request : r)));
        return result;
    }, []);

    const rejectPayment = useCallback(async (paymentId: string, userId: string, reason: string) => {
        const result = await procurementRepository.rejectPayment(paymentId, userId, reason);
        setRequests((prev) => prev.map((r) => (r.id === result.request.id ? result.request : r)));
        return result;
    }, []);
    // ============================================================
    // SUMMARY
    // ============================================================

    const getTransactionSummary = useCallback(async (requestId: string) => {
        return procurementRepository.getTransactionSummary(requestId);
    }, []);

    const getPlatformCompanies = useCallback(async () => {
        return procurementRepository.getPlatformCompanies();
    }, []);

    // ============================================================
    // STATUS HISTORY
    // ============================================================

    const getStatusHistory = useCallback(async (requestId: string) => {
        return procurementRepository.getStatusHistory(requestId);
    }, []);

    // ============================================================
    // RETURN
    // ============================================================

    return {
        // State
        requests,
        rfqs,
        awards,
        loading,
        error,

        // Actions
        loadAll,

        // CRUD
        createRequest,
        updateRequest,
        getRequest,

        // RFQ/Award
        createRFQ,
        updateRFQ,
        createAward,
        updateAward,
        getAwards,

        // Status workflow
        submitRequest,
        markReceived,
        markOrdered,
        markDelivering,
        verifyDeliveryStatus,
        completeRequest,
        cancelRequest,
        rejectRequest,

        // Supplier workflow (NEW)
        acceptSupplierRequest,
        confirmRequesterReceipt,

        // Supplier requests
        getSupplierRequests,
        sendRequestToSupplier,

        // RFQ operations
        addSupplierToRFQ,
        updateRFQSupplierStatus,
        issueRFQ,
        closeRFQ,
        expireRFQ,

        // Quotations
        getQuotations,
        createQuotation,
        updateQuotation,

        // Deliveries
        getDeliveries,
        confirmDelivery,

        // Evidence
        getEvidence,
        uploadEvidence,
        deleteEvidence,

        // Calculations
        getCalculations,
        addCalculation,

        // Payments
        getPayments,
        reportPayment,
        verifyPayment,
        rejectPayment,

        // Summary & History
        getTransactionSummary,
        getStatusHistory,
        getPlatformCompanies,
    };
}