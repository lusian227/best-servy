import {
    useState,
    useEffect,
    useCallback,
} from 'react';

import { ProcurementService } from '../services/ProcurementService';
import { procurementRepository } from '../repositories/ProcurementRepository';

import type {
    RFQ,
    Quotation,
} from '../domain';

const procurementService =
    new ProcurementService(procurementRepository);

export function useRFQ(
    rfqId: string | null
) {
    const [rfq, setRFQ] =
        useState<RFQ | null>(null);

    const [quotations, setQuotations] =
        useState<Quotation[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    // ============================================================
    // LOAD RFQ + QUOTATIONS
    // ============================================================

    const loadRFQ = useCallback(async () => {
        if (!rfqId) {
            setRFQ(null);
            setQuotations([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                rfqData,
                quotationsData,
            ] = await Promise.all([
                procurementService.getRFQ(rfqId),
                procurementService.getQuotations(rfqId),
            ]);

            setRFQ(rfqData);
            setQuotations(quotationsData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load RFQ'
            );
        } finally {
            setLoading(false);
        }
    }, [rfqId]);

    // ============================================================
    // UPDATE RFQ
    // ============================================================

    const updateRFQ = useCallback(
        async (
            updates: Partial<RFQ>
        ) => {
            if (!rfqId) {
                return null;
            }

            setLoading(true);
            setError(null);

            try {
                const updatedRFQ =
                    await procurementService.updateRFQ(
                        rfqId,
                        updates
                    );

                setRFQ(updatedRFQ);

                return updatedRFQ;
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to update RFQ'
                );

                throw err;
            } finally {
                setLoading(false);
            }
        },
        [rfqId]
    );

    // ============================================================
    // ADD QUOTATION
    // ============================================================

    const addQuotation = useCallback(
        async (
            input: Omit<
                Quotation,
                | 'id'
                | 'status'
                | 'createdAt'
                | 'updatedAt'
            >
        ) => {
            setLoading(true);
            setError(null);

            try {
                const newQuotation =
                    await procurementService.createQuotation(
                        input as Quotation
                    );

                setQuotations((previous) => [
                    ...previous,
                    newQuotation,
                ]);

                return newQuotation;
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to add quotation'
                );

                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ============================================================
    // UPDATE QUOTATION
    // ============================================================

    const updateQuotation = useCallback(
        async (
            id: string,
            updates: Partial<Quotation>
        ) => {
            setLoading(true);
            setError(null);

            try {
                const updatedQuotation =
                    await procurementService.updateQuotation(
                        id,
                        updates
                    );

                setQuotations((previous) =>
                    previous.map((quotation) =>
                        quotation.id === id
                            ? updatedQuotation
                            : quotation
                    )
                );

                return updatedQuotation;
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to update quotation'
                );

                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // ============================================================
    // AUTO LOAD
    // ============================================================

    useEffect(() => {
        void loadRFQ();
    }, [loadRFQ]);

    // ============================================================
    // RETURN
    // ============================================================

    return {
        rfq,
        quotations,

        loading,
        error,

        loadRFQ,

        updateRFQ,

        addQuotation,
        updateQuotation,
    };
}