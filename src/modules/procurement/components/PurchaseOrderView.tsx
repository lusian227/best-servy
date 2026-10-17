import React, { useState } from 'react';
import {
    X,
    FileText,
    Building2,
    DollarSign,
    Calendar,
    User,
    Download,
    Printer,
    Send,
    CheckCircle,
    Truck,
    Clock,
    AlertCircle,
    FileCheck,
    Mail,
} from 'lucide-react';

import type { Award } from '../domain';

interface PurchaseOrderViewProps {
    isOpen: boolean;
    award: Award | null;
    onClose: () => void;
    onUpdate?: (award: Award) => void;
}

export function PurchaseOrderView({
    isOpen,
    award,
    onClose,
    onUpdate,
}: PurchaseOrderViewProps) {
    const [status, setStatus] = useState<'draft' | 'issued' | 'signed' | 'completed'>(
        award?.status as any || 'draft'
    );
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(award?.notes || '');

    if (!isOpen || !award) {
        return null;
    }

    const handleStatusChange = (newStatus: 'draft' | 'issued' | 'signed' | 'completed') => {
        setStatus(newStatus);
        // Update award status
        onUpdate?.({ ...award, status: newStatus as any });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Generate PDF or download
        alert('Downloading Purchase Order...');
    };

    const handleEmail = () => {
        // Email PO to supplier
        alert('Emailing Purchase Order...');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            case 'issued':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'signed':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'completed':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <Clock className="h-4 w-4" />;
            case 'issued':
                return <Send className="h-4 w-4" />;
            case 'signed':
                return <FileCheck className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                {/* HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                Purchase Order
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {award.purchaseOrderReference || 'PO Draft'}
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

                    {/* Status Banner */}
                    <div className={`mb-6 flex items-center justify-between rounded-xl border p-4 ${getStatusColor(status)}`}>
                        <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            <span className="font-medium">Status: {formatStatus(status)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {status === 'draft' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('issued')}
                                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Issue PO
                                    </button>
                                </>
                            )}
                            {status === 'issued' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('signed')}
                                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                                    >
                                        Mark as Signed
                                    </button>
                                </>
                            )}
                            {status === 'signed' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('completed')}
                                        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-green-700"
                                    >
                                        Mark as Completed
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* PO Content */}
                    <div className="space-y-6">

                        {/* Header */}
                        <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    PURCHASE ORDER
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {award.purchaseOrderReference || 'PO Draft'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Date Issued</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {award.approvedAt ? new Date(award.approvedAt).toLocaleDateString() : 'Pending'}
                                </p>
                            </div>
                        </div>

                        {/* Supplier & Project */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Supplier</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {award.providerName}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Project</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {award.projectId}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Description</p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                {award.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Amount */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Amount</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {award.currency} {award.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Contract Reference */}
                        {award.contractReference && (
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Contract Reference</p>
                                <p className="mt-1 font-medium text-slate-900 dark:text-white">
                                    {award.contractReference}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Notes</p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {award.notes || 'No additional notes.'}
                            </p>
                        </div>

                        {/* Approved By */}
                        {award.approvedBy && (
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Approved By</p>
                                <p className="mt-1 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    {award.approvedBy}
                                </p>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Timeline</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Created:</span>
                                    <span className="ml-2 text-slate-700 dark:text-slate-300">
                                        {new Date(award.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                {award.approvedAt && (
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Approved:</span>
                                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                                            {new Date(award.approvedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                        <button
                            onClick={handleEmail}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Mail className="h-4 w-4" />
                            Email
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}