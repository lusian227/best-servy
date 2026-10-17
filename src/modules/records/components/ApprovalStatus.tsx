// src/modules/records/components/ApprovalStatus.tsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, Send, MessageSquare } from 'lucide-react';
import { ApprovalService, ApprovalWorkflow } from '../services/ApprovalService';
import {
  EngineeringRecord,
  RecordStatus,
} from '../domain/EngineeringRecord';

interface ApprovalStatusProps {
  record: EngineeringRecord;
  onApprove?: () => void;
  onReject?: () => void;
  onSubmit?: () => void;
}

export function ApprovalStatus({ record, onApprove, onReject, onSubmit }: ApprovalStatusProps) {
  const [workflow, setWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const approvalService = new ApprovalService();

  useEffect(() => {
    loadWorkflow();
  }, [record.id]);

  const loadWorkflow = async () => {
    setLoading(true);
    try {
      const data = await approvalService.getApprovalStatus(record.id);
      setWorkflow(data);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit this record for approval?')) return;
    try {
      await approvalService.submitForApproval(record.id, 'current-user');
      if (onSubmit) onSubmit();
      await loadWorkflow();
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit for approval. Please try again.');
    }
  };

  const handleApprove = async () => {
    if (!confirm('Approve this record?')) return;
    try {
      await approvalService.approveRecord(record.id, 'current-user', comment || undefined);
      if (onApprove) onApprove();
      await loadWorkflow();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    if (!confirm('Reject this record?')) return;
    try {
      await approvalService.rejectRecord(record.id, 'current-user', comment);
      if (onReject) onReject();
      await loadWorkflow();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'submitted':
      case 'in_review': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'rejected': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'submitted':
      case 'in_review': return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      default: return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const isDraft = record.status === 'draft';
  const isApproved = record.status === 'approved';
  const isRejected = record.status === 'rejected';
  const isPending = record.status === 'in_review';

  if (isDraft && !workflow) {
    return (
      <div className="text-center py-6">
        <Send className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Submit for approval to start the workflow</p>
        <button
          onClick={handleSubmit}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Submit for Approval
        </button>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <p className="text-sm">No approval workflow found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={'p-4 rounded-lg border ' + getStatusColor(workflow.status) + ' flex items-center gap-3'}>
        {getStatusIcon(workflow.status)}
        <div>
          <p className="font-medium">
            {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Under Review'}
          </p>
          <p className="text-sm opacity-75">
            {isApproved && workflow.steps[workflow.steps.length - 1]?.approvedBy && 'Approved by ' + workflow.steps[workflow.steps.length - 1].approvedBy}
            {isRejected && 'Needs revisions'}
            {isPending && 'Step ' + (workflow.currentStep + 1) + ' of ' + workflow.steps.length}
          </p>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-2">
        {workflow.steps.map((step, index) => {
          const isCompleted = step.status === 'approved';
          const isRejectedStep = step.status === 'rejected';
          const isCurrent = index === workflow.currentStep && isPending;
          const isPendingStep = step.status === 'pending' && !isCurrent;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className={'mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ' + (
                isCompleted ? 'bg-green-500 text-white' :
                  isRejectedStep ? 'bg-red-500 text-white' :
                    isCurrent ? 'bg-yellow-500 text-white animate-pulse' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              )}>
                {isCompleted ? <CheckCircle className="h-3 w-3" /> :
                  isRejectedStep ? <XCircle className="h-3 w-3" /> :
                    isCurrent ? <Clock className="h-3 w-3" /> :
                      index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={'font-medium text-sm ' + (
                    isCompleted ? 'text-green-700 dark:text-green-400' :
                      isRejectedStep ? 'text-red-700 dark:text-red-400' :
                        isCurrent ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-gray-500 dark:text-gray-400'
                  )}>
                    {step.name}
                  </span>
                  <span className={'text-xs px-2 py-0.5 rounded ' + (
                    isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      isRejectedStep ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        isCurrent ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {isCompleted ? 'Approved' :
                      isRejectedStep ? 'Rejected' :
                        isCurrent ? 'In Progress' :
                          'Pending'}
                  </span>
                </div>
                {step.approvedBy && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                    <User className="h-3 w-3" />
                    {step.approvedBy}
                    {step.approvedAt && (
                      <>
                        <span>�</span>
                        <Calendar className="h-3 w-3" />
                        {new Date(step.approvedAt).toLocaleDateString()}
                      </>
                    )}
                  </div>
                )}
                {step.comment && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">"{step.comment}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
            >
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Approve
            </button>
            <button
              onClick={() => setShowComment(!showComment)}
              className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition text-sm"
            >
              <XCircle className="h-4 w-4 inline mr-1" />
              Reject
            </button>
          </div>

          {showComment && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Reason for rejection:</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                rows={2}
              />
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Confirm Rejection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      {workflow.comments.length > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Comments</p>
          {workflow.comments.map((comment, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-2 rounded mb-1">
              {comment.author}: {comment.text} <span className="text-xs text-gray-400 dark:text-gray-500">({new Date(comment.createdAt).toLocaleString()})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
