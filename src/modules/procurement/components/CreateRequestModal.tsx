// src/modules/procurement/components/CreateRequestModal.tsx

import React, { useState, useEffect } from 'react';

import { supabase } from '../../../lib/supabase';
import { useCompanyStore } from '../../../stores/companyStore';
import {
    X,
    Package,
    Calendar,
    MapPin,
    DollarSign,
    FileText,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    Building2,
} from 'lucide-react';

import { useProcurement } from '../hooks/useProcurement';

import type {
    ProcurementCategory,
    ProcurementRequest,
} from '../domain';

interface CreateRequestModalProps {
    isOpen: boolean;
    projectId?: string;
    workspaceId?: string;
    onClose: () => void;
    onCreated?: (request: ProcurementRequest) => void;
}

interface SpecificationRow {
    id: string;
    key: string;
    value: string;
}

interface FormData {
    title: string;
    description: string;
    category: ProcurementCategory;
    quantity: string;
    unit: string;
    requiredDate: string;
    deliveryLocation: string;
    budget: string;
    currency: string;
}

const initialForm: FormData = {
    title: '',
    description: '',
    category: 'material',
    quantity: '',
    unit: '',
    requiredDate: '',
    deliveryLocation: '',
    budget: '',
    currency: 'KES',
};

// ✅ Helper: Validate UUID format
const isValidUUID = (str?: string | null): boolean => {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export function CreateRequestModal({
    isOpen,
    projectId,
    workspaceId,
    onClose,
    onCreated,
}: CreateRequestModalProps) {
    const { createRequest, loading, error } = useProcurement({
        projectId: projectId || '',
        workspaceId: workspaceId,
        autoLoad: false,
    });

    const [formData, setFormData] = useState<FormData>(initialForm);
    const [specifications, setSpecifications] = useState<SpecificationRow[]>([
        { id: crypto.randomUUID(), key: '', value: '' },
    ]);
    const [formError, setFormError] = useState<string | null>(null);

    // ✅ SUPPLIER STATE
    const [supplierCompanyId, setSupplierCompanyId] = useState('');
    const [supplierCompanyName, setSupplierCompanyName] = useState('');
    const [availableSuppliers, setAvailableSuppliers] = useState<Array<{ id: string; name: string }>>([]);

    // ✅ Track company loading state
    const [isCompanyLoading, setIsCompanyLoading] = useState(true);

    // ✅ Subscribe to company store changes
    useEffect(() => {
        const checkCompany = () => {
            const { activeCompanyId, loading: companyLoading } = useCompanyStore.getState();
            console.log('🏢 Company store state:', { activeCompanyId, companyLoading });

            if (!companyLoading && activeCompanyId) {
                setIsCompanyLoading(false);
            } else if (!companyLoading && !activeCompanyId) {
                setIsCompanyLoading(false);
            }
        };

        checkCompany();

        const unsubscribe = useCompanyStore.subscribe((state) => {
            console.log('🏢 Company store updated:', state);
            if (!state.loading && state.activeCompanyId) {
                setIsCompanyLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // ✅ Load suppliers when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadSuppliers = async () => {
                try {
                    // ✅ Use RPC to get ALL platform companies
                    const { data, error } = await supabase.rpc('get_platform_companies');

                    if (error) throw error;
                    if (data) {
                        setAvailableSuppliers(data);
                    }
                } catch (err) {
                    console.error('Failed to load suppliers:', err);
                }
            };

            loadSuppliers();
        }
    }, [isOpen]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialForm);
            setSpecifications([{ id: crypto.randomUUID(), key: '', value: '' }]);
            setFormError(null);
            setSupplierCompanyId('');
            setSupplierCompanyName('');

            const { activeCompanyId, loading: companyLoading } = useCompanyStore.getState();
            if (!companyLoading && activeCompanyId) {
                setIsCompanyLoading(false);
            }
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    // ============================================================
    // FORM FIELD UPDATES
    // ============================================================

    const updateField = <K extends keyof FormData>(
        field: K,
        value: FormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // ============================================================
    // SPECIFICATIONS
    // ============================================================

    const addSpecification = () => {
        setSpecifications((prev) => [
            ...prev,
            { id: crypto.randomUUID(), key: '', value: '' },
        ]);
    };

    const removeSpecification = (id: string) => {
        setSpecifications((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((item) => item.id !== id);
        });
    };

    const updateSpecification = (
        id: string,
        field: 'key' | 'value',
        value: string
    ) => {
        setSpecifications((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        // ✅ Check if company is still loading
        if (isCompanyLoading) {
            setFormError('Loading company data... Please wait.');
            return;
        }

        // Validation
        if (!formData.title.trim()) {
            setFormError('Procurement request title is required.');
            return;
        }

        if (!formData.description.trim()) {
            setFormError('Please provide a description.');
            return;
        }

        // ✅ Supplier is OPTIONAL now
        // If selected, validate it's a valid UUID
        if (supplierCompanyId && !isValidUUID(supplierCompanyId)) {
            setFormError('Selected supplier has an invalid ID. Please try again.');
            return;
        }

        const parsedQuantity = formData.quantity.trim() !== ''
            ? Number(formData.quantity)
            : undefined;

        const parsedBudget = formData.budget.trim() !== ''
            ? Number(formData.budget)
            : undefined;

        if (parsedQuantity !== undefined && (isNaN(parsedQuantity) || parsedQuantity < 0)) {
            setFormError('Quantity must be a valid positive number.');
            return;
        }

        if (parsedBudget !== undefined && (isNaN(parsedBudget) || parsedBudget < 0)) {
            setFormError('Budget must be a valid positive number.');
            return;
        }

        // Build specifications object
        const specificationObject: Record<string, unknown> = {};
        specifications.forEach((item) => {
            const key = item.key.trim();
            const value = item.value.trim();
            if (key) {
                specificationObject[key] = value;
            }
        });

        try {
            // ✅ Get company data
            const { activeCompanyId, workspaces, loading: companyLoading } = useCompanyStore.getState();

            // ✅ If company is still loading, show loading state
            if (companyLoading) {
                setFormError('Loading company data... Please wait.');
                return;
            }

            // ✅ CHECK: Does the user have ANY company?
            if (!activeCompanyId && (!workspaces || workspaces.length === 0)) {
                setFormError('No company found. Please create a company first.');
                return;
            }

            // ✅ Get workspace ID
            const storeWorkspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : null;
            const effectiveWorkspaceId = workspaceId || activeCompanyId || storeWorkspaceId;

            if (!isValidUUID(effectiveWorkspaceId)) {
                setFormError('No valid workspace found.');
                return;
            }

            // ✅ Get authenticated user
            let userId = null;
            try {
                const { data: authData } = await supabase.auth.getUser();
                userId = authData?.user?.id || null;
            } catch (authError) {
                console.warn('Auth error:', authError);
            }

            if (!userId || !isValidUUID(userId)) {
                userId = localStorage.getItem('engineeros_current_user_id');
            }

            if (!isValidUUID(userId)) {
                setFormError('Unable to identify user. Please log in again.');
                return;
            }

            const newRequest = await createRequest({
                projectId: projectId || null,
                workspaceId: effectiveWorkspaceId,
                supplierCompanyId: supplierCompanyId,
                supplierCompanyName: supplierCompanyName || undefined,
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                quantity: parsedQuantity,
                unit: formData.unit.trim() || undefined,
                requiredDate: formData.requiredDate || undefined,
                deliveryLocation: formData.deliveryLocation.trim() || undefined,
                budget: parsedBudget,
                currency: formData.currency || 'KES',
                specifications: specificationObject,
                createdBy: userId,
                linkedDrawingIds: [],
                linkedRFIIds: [],
            });

            onCreated?.(newRequest);
            setFormData(initialForm);
            setSpecifications([{ id: crypto.randomUUID(), key: '', value: '' }]);
            setSupplierCompanyId('');
            setSupplierCompanyName('');
            onClose();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to create procurement request.');
        }
    };

    // ============================================================
    // HANDLE CLOSE
    // ============================================================

    const handleClose = () => {
        if (loading) return;
        setFormData(initialForm);
        setSpecifications([{ id: crypto.randomUUID(), key: '', value: '' }]);
        setFormError(null);
        setSupplierCompanyId('');
        setSupplierCompanyName('');
        onClose();
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

                {/* HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                New Procurement Request
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Create a procurement requirement for this project.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">

                        {/* ERROR DISPLAY */}
                        {(formError || error) && (
                            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span>{formError || error}</span>
                            </div>
                        )}

                        {/* ✅ LOADING STATE FOR COMPANY */}
                        {isCompanyLoading && (
                            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                                <span>Loading company data... Please wait before submitting.</span>
                            </div>
                        )}

                        {/* BASIC INFORMATION */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Basic Information
                                </h3>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Request Title <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(event) => updateField('title', event.target.value)}
                                    placeholder="e.g. Supply of Reinforcement Steel Bars"
                                    disabled={loading || isCompanyLoading}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description <span className="text-red-500">*</span>
                                </label>

                                <textarea
                                    value={formData.description}
                                    onChange={(event) => updateField('description', event.target.value)}
                                    placeholder="Describe the procurement requirement, including technical specifications..."
                                    rows={4}
                                    disabled={loading || isCompanyLoading}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            {/* Category + Currency */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Procurement Category
                                    </label>

                                    <select
                                        value={formData.category}
                                        onChange={(event) =>
                                            updateField('category', event.target.value as ProcurementCategory)
                                        }
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="material">Material</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="professional">Professional</option>
                                        <option value="service">Service</option>
                                        <option value="technology">Technology</option>
                                        <option value="energy">Energy</option>
                                        <option value="transport">Transport</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Currency
                                    </label>

                                    <select
                                        value={formData.currency}
                                        onChange={(event) => updateField('currency', event.target.value)}
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="KES">KES — Kenyan Shilling</option>
                                        <option value="USD">USD — US Dollar</option>
                                        <option value="EUR">EUR — Euro</option>
                                        <option value="GBP">GBP — British Pound</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* QUANTITY & BUDGET */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Quantity & Budget
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={formData.quantity}
                                        onChange={(event) => updateField('quantity', event.target.value)}
                                        placeholder="0"
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Unit
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(event) => updateField('unit', event.target.value)}
                                        placeholder="e.g. tonnes, pcs, m³"
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Budget
                                    </label>

                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={formData.budget}
                                            onChange={(event) => updateField('budget', event.target.value)}
                                            placeholder="0.00"
                                            disabled={loading || isCompanyLoading}
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* DELIVERY REQUIREMENTS */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Delivery Requirements
                            </h3>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            Required Date
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={formData.requiredDate}
                                        onChange={(event) => updateField('requiredDate', event.target.value)}
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400" />
                                            Delivery Location
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.deliveryLocation}
                                        onChange={(event) => updateField('deliveryLocation', event.target.value)}
                                        placeholder="e.g. Main construction site"
                                        disabled={loading || isCompanyLoading}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* SPECIFICATIONS */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Specifications
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Add technical requirements for suppliers.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addSpecification}
                                    disabled={loading || isCompanyLoading}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Specification
                                </button>
                            </div>

                            <div className="space-y-3">
                                {specifications.map((specification) => (
                                    <div
                                        key={specification.id}
                                        className="grid grid-cols-[1fr_1fr_auto] gap-3"
                                    >
                                        <input
                                            type="text"
                                            value={specification.key}
                                            onChange={(event) =>
                                                updateSpecification(
                                                    specification.id,
                                                    'key',
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Specification (e.g. Grade)"
                                            disabled={loading || isCompanyLoading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <input
                                            type="text"
                                            value={specification.value}
                                            onChange={(event) =>
                                                updateSpecification(
                                                    specification.id,
                                                    'value',
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Requirement (e.g. Y16)"
                                            disabled={loading || isCompanyLoading}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(specification.id)}
                                            disabled={loading || isCompanyLoading || specifications.length === 1}
                                            className="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SUPPLIER SELECTION */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Supplier Assignment
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select Company (Optional)
                                </label>
                                <select
                                    value={supplierCompanyId}
                                    onChange={(e) => {
                                        const selected = availableSuppliers.find(s => s.id === e.target.value);
                                        setSupplierCompanyId(e.target.value);
                                        setSupplierCompanyName(selected?.name || '');
                                    }}
                                    disabled={loading || isCompanyLoading}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="">Public RFQ - All companies can respond</option>
                                    {availableSuppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    Leave empty to publish as Public RFQ. Select a company to send privately to them.
                                </p>
                            </div>
                        </section>

                        {/* TECHNICAL NOTE */}
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                Technical specifications, drawings, RFIs, and linked
                                project records can be attached after the procurement
                                request has been created.
                            </p>
                        </section>

                    </div>

                    {/* FOOTER */}
                    <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || isCompanyLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </>
                            ) : isCompanyLoading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Loading Company...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Procurement Request
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}