import React, { useState } from 'react';
import { DecisionItem, ProjectItem } from '../../types';
import { Bookmark, X, CheckCircle, Clock, FileText, Camera, ShieldAlert } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (decision: DecisionItem) => void;
  editingItem?: DecisionItem | null;
  projects: ProjectItem[];
  currentProject?: ProjectItem | null;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  projects,
  currentProject,
}) => {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE RETURN
  const [title, setTitle] = useState(editingItem?.title || '');
  const [reason, setReason] = useState(editingItem?.reason || '');
  const [requestedBy, setRequestedBy] = useState(editingItem?.requestedBy || 'Eng. Martin Vance');
  const [reviewedBy, setReviewedBy] = useState(editingItem?.reviewedBy || 'Consultant Lead');
  const [approvedBy, setApprovedBy] = useState(editingItem?.approvedBy || 'Project Director');
  const [affectedDrawings, setAffectedDrawings] = useState(editingItem?.affectedDrawings?.join(', ') || 'S-12, S-14');
  const [relatedRFIs, setRelatedRFIs] = useState(editingItem?.relatedRFIs?.join(', ') || 'RFI-084');
  const [status, setStatus] = useState<DecisionItem['status']>(editingItem?.status || 'Approved');
  const [impactLevel, setImpactLevel] = useState<DecisionItem['impactLevel']>(editingItem?.impactLevel || 'High');
  const [costImpact, setCostImpact] = useState(editingItem?.costImpact || '+$15,000');
  const [scheduleImpact, setScheduleImpact] = useState(editingItem?.scheduleImpact || '+2 Days');

  // ✅ NOW return null after hooks
  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    console.log('🔴🔴🔴 DECISION MODAL: Form submitted');
    console.log('🔴🔴🔴 DECISION MODAL: onSave function exists?', typeof onSave === 'function');

    const decision: DecisionItem = {
      id: editingItem?.id || `dec-${Date.now().toString().slice(-4)}`,
      decisionNumber: editingItem?.decisionNumber || Math.floor(Math.random() * 50) + 45,
      projectId: currentProject?.id ?? '',
      projectName: currentProject?.name ?? '',
      title,
      reason,
      requestedBy,
      reviewedBy,
      approvedBy,
      implemented: status === 'Approved',
      status,
      affectedDrawings: affectedDrawings.split(',').map((s) => s.trim()).filter(Boolean),
      relatedRFIs: relatedRFIs.split(',').map((s) => s.trim()).filter(Boolean),
      relatedPhotosCount: editingItem?.relatedPhotosCount || 12,
      date: editingItem?.date || new Date().toISOString().split('T')[0],
      impactLevel,
      costImpact,
      scheduleImpact,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('🔴🔴🔴 DECISION MODAL: Decision to save:', decision);

    if (typeof onSave === 'function') {
      onSave(decision);
      console.log('🔴🔴🔴 DECISION MODAL: onSave called successfully');
    } else {
      console.log('🔴🔴🔴 DECISION MODAL: onSave is NOT a function!');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">
                {editingItem ? `Edit Decision #${editingItem.decisionNumber}` : 'Record Permanent Engineering Decision'}
              </h3>
              <p className="text-xs text-emerald-200">Single Source of Truth Decision Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-emerald-200 hover:text-white hover:bg-emerald-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-900 dark:text-slate-100 text-xs">
          <div>
            <label className="block font-bold mb-1">Decision Title / Statement *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Increase Transfer Slab Thickness from 200mm to 250mm"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Engineering Justification & Technical Reason *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why was this decision made? Reference calculations, deflection limits, or site conditions..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Requested By</label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Reviewed By</label>
              <input
                type="text"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> Affected Drawings (comma separated)
              </label>
              <input
                type="text"
                value={affectedDrawings}
                onChange={(e) => setAffectedDrawings(e.target.value)}
                placeholder="S-12, S-14, G-01"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Related RFIs
              </label>
              <input
                type="text"
                value={relatedRFIs}
                onChange={(e) => setRelatedRFIs(e.target.value)}
                placeholder="RFI-084, RFI-091"
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Impact Level</label>
              <select
                value={impactLevel}
                onChange={(e) => setImpactLevel(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Cost Impact</label>
              <input
                type="text"
                value={costImpact}
                onChange={(e) => setCostImpact(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Schedule Impact</label>
              <input
                type="text"
                value={scheduleImpact}
                onChange={(e) => setScheduleImpact(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Saving this decision permanently binds it to drawing records and makes it searchable in <strong>Company Memory</strong> for future projects.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
            >
              Save Decision Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};