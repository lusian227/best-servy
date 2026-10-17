import React, { useState, useEffect } from 'react';
import {
    X,
    CheckCircle,
    XCircle,
    Star,
    TrendingUp,
    Calendar,
    DollarSign,
    Truck,
    Award,
    AlertCircle,
    FileText,
    Building2,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

import { useRFQ } from '../hooks/useRFQ';
import type { Quotation, RFQ } from '../domain';

interface QuoteComparisonProps {
    isOpen: boolean;
    rfqId: string | null;
    projectId: string;
    onClose: () => void;
    onAward?: (quotationId: string) => void;
}

interface ComparisonRow {
    label: string;
    key: string;
    format?: (value: any) => string;
}

export function QuoteComparison({
    isOpen,
    rfqId,
    projectId,
    onClose,
    onAward,
}: QuoteComparisonProps) {
    const { rfq, quotations, loading, error, loadRFQ } = useRFQ(rfqId);
    const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
    const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && rfqId) {
            loadRFQ();
        }
    }, [isOpen, rfqId]);

    if (!isOpen || !rfqId) {
        return null;
    }

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 p-8 rounded-2xl">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading quotations...</p>
                </div>
            </div>
        );
    }

    if (error || !quotations || quotations.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quote Comparison</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                        <p className="text-slate-600 dark:text-slate-300">
                            {quotations.length === 0
                                ? 'No quotations have been submitted for this RFQ yet.'
                                : error || 'Failed to load quotations.'}
                        </p>
                        <button
                            onClick={loadRFQ}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Find best price (lowest total)
    const bestPrice = Math.min(...quotations.map((q) => q.total));

    // Find best delivery (shortest)
    const bestDelivery = Math.min(
        ...quotations.map((q) => {
            const days = parseInt(q.deliveryTerms?.match(/\d+/)?.[0] || '999');
            return days;
        })
    );

    // Find highest rated (based on provider rating if available)
    // For now, we'll use a simple heuristic

    const handleSelect = (quotationId: string) => {
        setSelectedQuotationId(quotationId === selectedQuotationId ? null : quotationId);
    };

    const handleAward = () => {
        if (selectedQuotationId) {
            onAward?.(selectedQuotationId);
            onClose();
        }
    };

    const getQuoteScore = (quotation: Quotation) => {
        let score = 0;
        // Price score (lower is better)
        if (quotation.total === bestPrice) score += 40;
        else if (quotation.total < bestPrice * 1.1) score += 30;
        else if (quotation.total < bestPrice * 1.2) score += 20;
        else score += 10;

        // Delivery score (lower is better)
        const deliveryDays = parseInt(quotation.deliveryTerms?.match(/\d+/)?.[0] || '999');
        if (deliveryDays === bestDelivery) score += 30;
        else if (deliveryDays < bestDelivery + 3) score += 20;
        else if (deliveryDays < bestDelivery + 7) score += 10;
        else score += 5;

        // Validity score (higher is better)
        if (quotation.validityDays >= 30) score += 20;
        else if (quotation.validityDays >= 14) score += 10;
        else score += 5;

        return score;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
        if (score >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Best Value';
        if (score >= 60) return 'Good Value';
        return 'Consider Other Options';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'under_review':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'accepted':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                {/* HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Quote Comparison
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {rfq?.reference} — {quotations.length} quotations received
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Lowest Price</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {quotations.find((q) => q.total === bestPrice)?.currency || 'KES'}{' '}
                                {bestPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400">
                                {quotations.find((q) => q.total === bestPrice)?.providerName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Fastest Delivery</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {bestDelivery} days
                            </p>
                            <p className="text-xs text-slate-400">
                                {quotations.find((q) => {
                                    const days = parseInt(q.deliveryTerms?.match(/\d+/)?.[0] || '999');
                                    return days === bestDelivery;
                                })?.providerName}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Quotes Received</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {quotations.length}
                            </p>
                            <p className="text-xs text-slate-400">
                                {quotations.filter((q) => q.status === 'submitted').length} pending review
                            </p>
                        </div>
                    </div>

                    {/* Quote Cards */}
                    <div className="space-y-4">
                        {quotations.map((quotation) => {
                            const score = getQuoteScore(quotation);
                            const isSelected = selectedQuotationId === quotation.id;
                            const isExpanded = expandedDetails === quotation.id;
                            const isBestPrice = quotation.total === bestPrice;
                            const deliveryDays = parseInt(quotation.deliveryTerms?.match(/\d+/)?.[0] || '999');
                            const isBestDelivery = deliveryDays === bestDelivery;

                            return (
                                <div
                                    key={quotation.id}
                                    className={`rounded-xl border-2 transition ${isSelected
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                                        } hover:shadow-md`}
                                    onClick={() => handleSelect(quotation.id)}
                                >
                                    {/* Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                                <Building2 className="h-6 w-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {quotation.providerName}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className={`rounded-full px-2 py-0.5 ${getStatusColor(quotation.status)}`}>
                                                        {quotation.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    {isBestPrice && (
                                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                            <Star className="h-3 w-3 fill-emerald-500" />
                                                            Best Price
                                                        </span>
                                                    )}
                                                    {isBestDelivery && !isBestPrice && (
                                                        <span className="text-blue-600 dark:text-blue-400">
                                                            Fastest Delivery
                                                        </span>
                                                    )}
                                                    {score >= 80 && (
                                                        <span className="text-amber-600 dark:text-amber-400">
                                                            ★ Top Value
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {quotation.currency} {quotation.total.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Score: <span className={`font-medium ${getScoreColor(score)}`}>{score}%</span>
                                                </p>
                                            </div>
                                            {isSelected ? (
                                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                                            ) : (
                                                <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isSelected && (
                                        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Subtotal</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {quotation.currency} {quotation.subtotal.toLocaleString()}
                                                    </p>
                                                </div>
                                                {quotation.tax && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Tax</p>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {quotation.currency} {quotation.tax.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                                {quotation.deliveryCost && (
                                                    <div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Delivery Cost</p>
                                                        <p className="font-medium text-slate-900 dark:text-white">
                                                            {quotation.currency} {quotation.deliveryCost.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Delivery Terms</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {quotation.deliveryTerms || 'Not specified'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Payment Terms</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {quotation.paymentTerms || 'Not specified'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Validity</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {quotation.validityDays} days
                                                    </p>
                                                </div>
                                            </div>

                                            {quotation.items && quotation.items.length > 0 && (
                                                <div className="mt-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedDetails(isExpanded ? null : quotation.id);
                                                        }}
                                                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        {isExpanded ? 'Hide' : 'Show'} Items
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="mt-3 space-y-2">
                                                            {quotation.items.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="grid grid-cols-4 gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                                                                >
                                                                    <span className="text-slate-600 dark:text-slate-300">{item.description}</span>
                                                                    <span className="text-slate-500 dark:text-slate-400">
                                                                        {item.quantity} {item.unit}
                                                                    </span>
                                                                    <span className="text-slate-500 dark:text-slate-400">
                                                                        {quotation.currency} {item.unitPrice.toFixed(2)}/unit
                                                                    </span>
                                                                    <span className="text-right font-medium text-slate-900 dark:text-white">
                                                                        {quotation.currency} {item.total.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {quotation.notes && (
                                                <div className="mt-4 rounded-lg border border-slate-200 bg-amber-50 p-3 text-sm dark:border-amber-800/30 dark:bg-amber-950/20">
                                                    <p className="text-amber-700 dark:text-amber-400">
                                                        <FileText className="inline h-4 w-4 mr-1.5" />
                                                        {quotation.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAward?.(quotation.id);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                                                >
                                                    <Award className="h-4 w-4" />
                                                    Award to {quotation.providerName}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Recommendation */}
                    {quotations.length > 1 && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                            <div className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                                        Recommendation
                                    </p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                        Based on price, delivery, and terms, the best overall value is:
                                        <span className="font-bold ml-1">
                                            {quotations.reduce((best, q) => {
                                                const bestScore = getQuoteScore(best);
                                                const currentScore = getQuoteScore(q);
                                                return currentScore > bestScore ? q : best;
                                            }).providerName}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Close
                    </button>
                    {selectedQuotationId && (
                        <button
                            onClick={handleAward}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                            <Award className="h-4 w-4" />
                            Award Selected Quote
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}