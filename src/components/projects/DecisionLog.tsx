// src/components/projects/DecisionLog.tsx

import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { DecisionItem, SingleSourceLink } from '../../types';
import { Bookmark, Plus, Search, Filter, ShieldCheck, CheckCircle, Clock, AlertTriangle, ArrowRight, FileText, Eye, Edit2, Check, X } from 'lucide-react';

interface DecisionLogProps {
  decisions: DecisionItem[];
  onBack: () => void;
  onOpenModal: (decision?: DecisionItem) => void;
  onOpenTrace: (root: { id: string; type: string; title: string; subtitle?: string }, links: SingleSourceLink[]) => void;
  onApproveDecision?: (decisionId: string) => void;
}

// ✅ Helper to display status labels
const statusLabels: Record<string, string> = {
  'approved': 'Approved',
  'pending': 'Pending',
  'in-review': 'In Review',
  'rejected': 'Rejected',
};

export const DecisionLog: React.FC<DecisionLogProps> = ({
  decisions,
  onBack,
  onOpenModal,
  onOpenTrace,
  onApproveDecision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q) ||
        d.decisionNumber.toString().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (e: React.MouseEvent, decisionId: string) => {
    e.stopPropagation();
    if (onApproveDecision) {
      onApproveDecision(decisionId);
    }
  };

  const toggleExpand = (decisionId: string) => {
    setExpandedDecision(expandedDecision === decisionId ? null : decisionId);
  };

  // ✅ FIXED: Use lowercase status values
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'in-review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  // ✅ FIXED: Use lowercase status values
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'in-review':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-600 dark:text-slate-400"
        >
          <ArrowLeft size={16} />
          Back to Project Hub
        </button>
      </div>

      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Single Source Decision Engine</span>
          </div>
          <h2 className="text-xl font-bold">Permanent Engineering Decision Ledger</h2>
          <p className="text-xs text-slate-300 mt-1">
            Permanent audit record of every design change, structural decision, justification, and approval history.
          </p>
        </div>

        <button
          onClick={() => onOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Record Decision Entry
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search decisions by title, reason, or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Filter Status:</span>
          {/* ✅ FIXED: Use lowercase status values */}
          {['All', 'approved', 'pending', 'in-review', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${statusFilter === st
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
            >
              {st === 'All' ? 'All' : statusLabels[st] || st}
            </button>
          ))}
        </div>
      </div>

      {/* Decisions List Grid */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No decisions found matching your criteria.</p>
          </div>
        ) : (
          filteredDecisions.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                    Decision #{d.decisionNumber}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{d.projectName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1 ${getStatusColor(d.status)}`}>
                    {getStatusIcon(d.status)}
                    {statusLabels[d.status] || d.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{d.date}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{d.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{d.reason}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Requested By</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{d.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reviewed By</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{d.reviewedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Approved By</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{d.approvedBy}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <span>Drawings: {d.affectedDrawings?.join(', ') || 'None'}</span>
                  <span>•</span>
                  <span>RFIs: {d.relatedRFIs?.join(', ') || 'None'}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cost: {d.costImpact || 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(d.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                  >
                    <Eye size={14} />
                    {expandedDecision === d.id ? 'Hide Details' : 'Read'}
                  </button>

                  {/* ✅ FIXED: Use lowercase for comparison */}
                  {d.status !== 'approved' && onApproveDecision && (
                    <button
                      onClick={(e) => handleApprove(e, d.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  )}

                  <button
                    onClick={() => onOpenModal(d)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      onOpenTrace(
                        { id: d.id, type: 'decision', title: `Decision #${d.decisionNumber}`, subtitle: d.title },
                        []
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Trace
                  </button>
                </div>
              </div>

              {expandedDecision === d.id && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Full Reason</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-1">{d.reason}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Impact Level</span>
                      <p className={`font-bold ${d.impactLevel === 'High' ? 'text-red-500' : d.impactLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {d.impactLevel || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {/* ✅ FIXED: Use date instead of decisionDate */}
                    <p><strong>Decision Date:</strong> {d.date || 'N/A'}</p>
                    <p><strong>Implemented:</strong> {d.implemented ? '✅ Yes' : '❌ No'}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};