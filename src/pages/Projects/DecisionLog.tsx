// src/components/projects/DecisionLog.tsx

import React from 'react';
import { DecisionItem, SingleSourceLink } from '../../types';
import { BookOpen, CheckCircle, Clock, XCircle, Plus, ArrowLeft, Eye, Edit2, Check } from 'lucide-react';

interface DecisionLogProps {
  decisions: DecisionItem[];
  onBack: () => void;
  onOpenModal: (decision?: DecisionItem) => void;
  onOpenTrace: (root: any, links?: SingleSourceLink[]) => void;
  onApproveDecision?: (decisionId: string) => void;
}

export const DecisionLog: React.FC<DecisionLogProps> = ({
  decisions,
  onBack,
  onOpenModal,
  onOpenTrace,
  onApproveDecision,
}) => {
  // ✅ FIXED: Use lowercase to match Decision type
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  // ✅ FIXED: Use lowercase to match Decision type
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleApprove = (e: React.MouseEvent, decisionId: string) => {
    e.stopPropagation();
    console.log('🔵 Approve clicked for decision:', decisionId);
    if (onApproveDecision) {
      onApproveDecision(decisionId);
    } else {
      console.log('🔴 onApproveDecision is undefined!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold text-slate-600 dark:text-slate-400"
      >
        <ArrowLeft size={16} />
        Back to Project Hub
      </button>

      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Decision Ledger</h3>
        <button
          onClick={() => onOpenModal()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition flex items-center gap-1.5"
        >
          <Plus size={14} />
          New Decision
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No decisions recorded for this project.</p>
          <button
            onClick={() => onOpenModal()}
            className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition"
          >
            + Log First Decision
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusIcon(decision.status)}
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      #{decision.decisionNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(decision.status)}`}>
                      {decision.status}
                    </span>
                    <span className="text-xs text-slate-400">{decision.impactLevel || 'Medium'} Impact</span>
                  </div>
                  <h4 className="font-semibold text-sm mt-1">{decision.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{decision.reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Requested by: {decision.requestedBy}</span>
                    <span>•</span>
                    <span>{decision.date || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {/* Approve Button */}
                  {decision.status !== 'approved' && onApproveDecision && (
                    <button
                      onClick={(e) => handleApprove(e, decision.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => onOpenModal(decision)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>

                  {/* Trace Button */}
                  <button
                    onClick={() =>
                      onOpenTrace(
                        { id: decision.id, type: 'decision', title: `Decision #${decision.decisionNumber}`, subtitle: decision.title },
                        []
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Trace
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};