// src/modules/procurement/components/EvidenceUpload.tsx

import React, { useState, useRef } from 'react';
import { X, Upload, Camera, FileImage, FileText, AlertCircle, Trash2 } from 'lucide-react';
import type { EvidenceType } from '../domain';

interface EvidenceUploadProps {
    isOpen: boolean;
    requestId: string;
    deliveryId?: string;
    workspaceId: string;
    onClose: () => void;
    onUpload: (data: {
        file: File;
        type: EvidenceType;
        description?: string;
    }) => Promise<void>;
    existingEvidence?: Array<{
        id: string;
        type: EvidenceType;
        fileName?: string;
        fileUrl?: string;
        storagePath?: string;
        uploadedAt: string;
    }>;
    onDelete?: (id: string, storagePath: string) => Promise<void>;
}

const evidenceTypes: { value: EvidenceType; label: string; icon: React.ReactNode }[] = [
    { value: 'delivery_photo', label: 'Delivery Photo', icon: <Camera className="h-4 w-4" /> },
    { value: 'delivery_note', label: 'Delivery Note', icon: <FileText className="h-4 w-4" /> },
    { value: 'invoice', label: 'Invoice', icon: <FileText className="h-4 w-4" /> },
    { value: 'payment_receipt', label: 'Payment Receipt', icon: <FileText className="h-4 w-4" /> },
    { value: 'calculation', label: 'Calculation', icon: <FileText className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <FileImage className="h-4 w-4" /> },
];

export function EvidenceUpload({
    isOpen,
    requestId,
    deliveryId,
    workspaceId,
    onClose,
    onUpload,
    existingEvidence = [],
    onDelete,
}: EvidenceUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [evidenceType, setEvidenceType] = useState<EvidenceType>('delivery_photo');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            setError('File size must be less than 20MB');
            return;
        }

        setSelectedFile(file);
        setError(null);

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        setLoading(true);
        try {
            await onUpload({
                file: selectedFile,
                type: evidenceType,
                description: description.trim() || undefined,
            });
            setSelectedFile(null);
            setPreview(null);
            setDescription('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload evidence');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, storagePath: string) => {
        if (!onDelete) return;
        if (!confirm('Are you sure you want to delete this evidence?')) return;

        try {
            await onDelete(id, storagePath);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete evidence');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <Upload className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Evidence</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add supporting documents and photos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* File Upload */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">File *</label>
                        <div className="flex items-center gap-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-6 py-4 text-sm text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20"
                            >
                                <Upload className="h-4 w-4" />
                                {selectedFile ? selectedFile.name : 'Choose File'}
                            </label>
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {selectedFile && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Size: {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        )}
                        {preview && (
                            <div className="mt-3 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                                <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Evidence Type */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Evidence Type *</label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {evidenceTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setEvidenceType(type.value)}
                                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${evidenceType === type.value
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    {type.icon}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Add a description for this evidence..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                    </div>

                    {/* Existing Evidence */}
                    {existingEvidence.length > 0 && (
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Uploaded Evidence</label>
                            <div className="space-y-2">
                                {existingEvidence.map((evidence) => (
                                    <div
                                        key={evidence.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                                                {evidence.type === 'delivery_photo' ? (
                                                    <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {evidence.fileName || evidence.type.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDate(evidence.uploadedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {evidence.fileUrl && (
                                                <a
                                                    href={evidence.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg px-3 py-1 text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                                >
                                                    View
                                                </a>
                                            )}
                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(evidence.id, evidence.storagePath || '')}
                                                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload Evidence
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}