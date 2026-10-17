import React, { useEffect, useState } from 'react';
import { Truck, X } from 'lucide-react';

interface DeliveryModalProps {
    isOpen: boolean;
    requestId: string;
    requestTitle?: string | null;
    quantityOrdered?: number;
    unit?: string;
    onClose: () => void;
    onConfirm: (data: {
        quantityDelivered: number;
        condition: 'good' | 'damaged' | 'partial' | 'rejected';
        notes?: string;
    }) => Promise<void> | void;
}

export function DeliveryModal({
    isOpen,
    requestId,
    requestTitle,
    quantityOrdered,
    unit,
    onClose,
    onConfirm,
}: DeliveryModalProps) {
    const [quantityDelivered, setQuantityDelivered] = useState('');
    const [condition, setCondition] = useState<
        'good' | 'damaged' | 'partial' | 'rejected'
    >('good');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setQuantityDelivered('');
            setCondition('good');
            setNotes('');
            setError(null);
            setSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const quantity = Number(quantityDelivered);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            setError('Enter a valid delivered quantity.');
            return;
        }

        try {
            setSaving(true);

            await onConfirm({
                quantityDelivered: quantity,
                condition,
                notes: notes.trim() || undefined,
            });

            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to confirm delivery.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                            <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Confirm Delivery
                            </h2>

                            {requestTitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {requestTitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {quantityOrdered !== undefined && (
                        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
                            <span className="text-slate-500 dark:text-slate-400">
                                Quantity ordered:{' '}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {quantityOrdered} {unit || ''}
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor={`delivery-quantity-${requestId}`}
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Quantity Delivered
                        </label>

                        <div className="flex">
                            <input
                                id={`delivery-quantity-${requestId}`}
                                type="number"
                                min="0.0001"
                                step="any"
                                value={quantityDelivered}
                                onChange={(event) =>
                                    setQuantityDelivered(event.target.value)
                                }
                                placeholder="Enter quantity"
                                className="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                required
                            />

                            {unit && (
                                <div className="flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                    {unit}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor={`delivery-condition-${requestId}`}
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Condition
                        </label>

                        <select
                            id={`delivery-condition-${requestId}`}
                            value={condition}
                            onChange={(event) =>
                                setCondition(
                                    event.target.value as
                                    | 'good'
                                    | 'damaged'
                                    | 'partial'
                                    | 'rejected'
                                )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="good">Good</option>
                            <option value="damaged">Damaged</option>
                            <option value="partial">Partial</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor={`delivery-notes-${requestId}`}
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Notes
                        </label>

                        <textarea
                            id={`delivery-notes-${requestId}`}
                            value={notes}
                            onChange={(event) =>
                                setNotes(event.target.value)
                            }
                            rows={4}
                            placeholder="Add delivery notes, discrepancies, damage details, etc."
                            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Confirming...' : 'Confirm Delivery'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}