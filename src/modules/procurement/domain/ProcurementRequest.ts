// src/modules/procurement/hooks/useProcurement.ts

import { useState, useEffect, useCallback } from 'react';

import { ProcurementService } from '../services/ProcurementService';
import { procurementRepository } from '../repositories/ProcurementRepository';
import { procurementStorage } from '../services/procurementStorage';

import type {
    ProcurementRequest,
    RFQ,
    Award,
    DeliveryCondition,
    PaymentMethod,
    EvidenceType,
} from '../domain';

const procurementService = new ProcurementService(procurementRepository);

interface UseProcurementOptions {
    projectId?: string;
    workspaceId?: string;
    autoLoad?: boolean;
}

export function useProcurement({
    projectId,
    workspaceId,
    autoLoad = true,
}: UseProcurementOptions) {
    // ============================================================
    // STATE
    // ============================================================

    const [requests, setRequests] = useState<ProcurementRequest[]>([]);
    const [rfqs, setRFQs] = useState<RFQ[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ============================================================
    // LOAD ALL PROCUREMENT DATA
    // ============================================================

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
            const requestsPromise = procurementService.getRequests(projectId, workspaceId);
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
    }, [projectId, workspaceId]);

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
        const result = await procurementService.createRequest(input as ProcurementRequest);
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
    // RFQs & AWARDS
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

    const createAward = useCallback(async (input: Omit<Award, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const result = await procurementService.createAward(input as Award);
        setAwards((prev) => [result, ...prev]);
        return result;
    }, []);

    const updateAward = useCallback(async (id: string, updates: Partial<Award>) => {
        const result = await procurementService.updateAward(id, updates);
        setAwards((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // STATUS ACTIONS
    // ============================================================

    const submitRequest = useCallback(async (id: string, userId: string) => {
        const result = await procurementRepository.submitRequest(id, userId);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const markReceived = useCallback(async (id: string, userId: string, note?: string) => {
        const result = await procurementRepository.markReceived(id, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const markOrdered = useCallback(async (id: string, userId: string, note?: string) => {
        const result = await procurementRepository.markOrdered(id, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const markDelivering = useCallback(async (id: string, userId: string, note?: string) => {
        const result = await procurementRepository.markDelivering(id, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const verifyDeliveryStatus = useCallback(async (id: string, userId: string, note?: string) => {
        const result = await procurementRepository.verifyDelivery(id, userId, note);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const completeRequest = useCallback(async (id: string, userId: string) => {
        const result = await procurementRepository.completeRequest(id, userId);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const cancelRequest = useCallback(async (id: string, userId: string, reason: string) => {
        const result = await procurementRepository.cancelRequest(id, userId, reason);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    const rejectRequest = useCallback(async (id: string, userId: string, reason: string) => {
        const result = await procurementRepository.rejectRequest(id, userId, reason);
        setRequests((prev) => prev.map((r) => (r.id === id ? result : r)));
        return result;
    }, []);

    // ============================================================
    // DELIVERIES
    // ============================================================

    const getDeliveries = useCallback(async (requestId: string) => {
        return procurementRepository.getDeliveries(requestId);
    }, []);

    const confirmDelivery = useCallback(async (input: {
        procurementRequestId: string;
        quantityDelivered: number;
        unit?: string;
        condition: DeliveryCondition;
        notes?: string;
        userId: string;
        deliveryDate?: string;
    }) => {
        if (!workspaceId) throw new Error('No workspace ID');
        const result = await procurementRepository.confirmDelivery({
            ...input,
            workspaceId,
        });
        setRequests((prev) => prev.map((r) => (r.id === result.request.id ? result.request : r)));
        return result;
    }, [workspaceId]);

    // ============================================================
    // EVIDENCE
    // ============================================================

    const getEvidence = useCallback(async (requestId: string) => {
        return procurementRepository.getEvidence(requestId);
    }, []);

    const uploadEvidence = useCallback(async (input: {
        procurementRequestId: string;
        deliveryId?: string;
        type: EvidenceType;
        file: File;
        description?: string;
        userId: string;
    }) => {
        if (!workspaceId) throw new Error('No workspace ID');

        const { url, path } = await procurementStorage.uploadEvidence(
            workspaceId,
            input.procurementRequestId,
            input.file
        );

        try {
            const result = await procurementRepository.uploadEvidence({
                procurementRequestId: input.procurementRequestId,
                deliveryId: input.deliveryId,
                workspaceId,
                type: input.type,
                fileUrl: url,
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
    }, [workspaceId]);

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
        amount: number;
        currency?: string;
        paymentMethod: PaymentMethod;
        transactionReference?: string;
        paymentDate?: string;
        notes?: string;
        userId: string;
    }) => {
        if (!workspaceId) throw new Error('No workspace ID');
        const result = await procurementRepository.reportPayment({
            ...input,
            workspaceId,
        });
        setRequests((prev) => prev.map((r) => (r.id === result.request.id ? result.request : r)));
        return result;
    }, [workspaceId]);

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

    const getStatusHistory = useCallback(async (requestId: string) => {
        return procurementRepository.getStatusHistory(requestId);
    }, []);

    // ============================================================
    // SUPPLIER
    // ============================================================

    const getSupplierRequests = useCallback(async (supplierCompanyId: string) => {
        if (!supplierCompanyId) return [];
        return procurementRepository.getSupplierRequests(supplierCompanyId); // ✅ Only pass supplierCompanyId
    }, []); // ✅ No dependency on workspaceId

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

        // Status
        submitRequest,
        markReceived,
        markOrdered,
        markDelivering,
        verifyDeliveryStatus,
        completeRequest,
        cancelRequest,
        rejectRequest,

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

        // Summary
        getTransactionSummary,
        getStatusHistory,
        getSupplierRequests,
    };
}