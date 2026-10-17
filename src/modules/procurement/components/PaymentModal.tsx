// src/modules/procurement/components/PaymentModal.tsx

import React, { useEffect, useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    requestId: string;
    requestTitle?: string | null;
    budget?: number;
    onClose: () => void;
    onReport: (data: {
        amount: number;
        currency: string;
        paymentMethod: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Other';
        transactionReference?: string;
        paymentDate: string;
        notes?: string;
    }) => Promise<void>;
}

const paymentMethods: PaymentModalProps['onReport'] extends (
    data: infer T
) => Promise<void>
    ? T extends { paymentMethod: infer M }
    ? M[]
    : never
    : never = [
        'M-Pesa',
        'Bank Transfer',
        'Cash',
        'Cheque',
        'Other',
    ];

export function PaymentModal({
    isOpen,
    requestId,
    requestTitle,
    budget,
    onClose,
    onReport,
}: PaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('KES');
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentModalProps['onReport'] extends (
            data: infer T
        ) => Promise<void>
            ? T extends { paymentMethod: infer M }
            ? M
            : never
            : never>('M-Pesa');
    const [transactionReference, setTransactionReference] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const today = new Date().toISOString().split('T')[0];

        setAmount('');
        setCurrency('KES');
        setPaymentMethod('M-Pesa');
        setTransactionReference('');
        setPaymentDate(today);
        setNotes('');
        setError(null);
        setSubmitting(false);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        setError(null);

        const numericAmount = Number(amount);

        if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid payment amount.');
            return;
        }

        if (!paymentDate) {
            setError('Please select the payment date.');
            return;
        }

        setSubmitting(true);

        try {
            await onReport({
                amount: numericAmount,
                currency,
                paymentMethod,
                transactionReference:
                    transactionReference.trim() || undefined,
                paymentDate,
                notes: notes.trim() || undefined,
            });

            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to report payment.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div>
                            <h2
                                id="payment-modal-title"
                                className="font-semibold text-slate-900 dark:text-white"
                            >
                                Report Payment
                            </h2>

                            {requestTitle && (
                                <p className="max-w-sm truncate text-xs text-slate-500 dark:text-slate-400">
                                    {requestTitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-6 py-5">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Amount */}
                        <div>
                            <label
                                htmlFor="payment-amount"
                                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Amount
                            </label>

                            <div className="flex gap-2">
                                <select
                                    value={currency}
                                    onChange={(e) =>
                                        setCurrency(e.target.value)
                                    }
                                    disabled={submitting}
                                    className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="KES">KES</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>

                                <input
                                    id="payment-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(e.target.value)
                                    }
                                    placeholder="0.00"
                                    disabled={submitting}
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {budget !== undefined && (
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    Request budget:{' '}
                                    <span className="font-medium">
                                        {budget.toLocaleString()}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Payment method */}
                        <div>
                            <label
                                htmlFor="payment-method"
                                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Payment Method
                            </label>

                            <select
                                id="payment-method"
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target
                                            .value as PaymentModalProps['onReport'] extends (
                                                data: infer T
                                            ) => Promise<void>
                                        ? T extends {
                                            paymentMethod: infer M;
                                        }
                                        ? M
                                        : never
                                        : never
                                    )
                                }
                                disabled={submitting}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                {paymentMethods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Transaction reference */}
                        <div>
                            <label
                                htmlFor="transaction-reference"
                                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Transaction Reference
                                <span className="ml-1 font-normal text-slate-400">
                                    (optional)
                                </span>
                            </label>

                            <input
                                id="transaction-reference"
                                type="text"
                                value={transactionReference}
                                onChange={(e) =>
                                    setTransactionReference(e.target.value)
                                }
                                placeholder="e.g. MPESA123456"
                                disabled={submitting}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Payment date */}
                        <div>
                            <label
                                htmlFor="payment-date"
                                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Payment Date
                            </label>

                            <input
                                id="payment-date"
                                type="date"
                                value={paymentDate}
                                onChange={(e) =>
                                    setPaymentDate(e.target.value)
                                }
                                disabled={submitting}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="payment-notes"
                                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                Notes
                                <span className="ml-1 font-normal text-slate-400">
                                    (optional)
                                </span>
                            </label>

                            <textarea
                                id="payment-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Add any payment details or notes..."
                                disabled={submitting}
                                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {submitting
                                ? 'Reporting...'
                                : 'Report Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}