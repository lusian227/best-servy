// src/modules/work-items/components/WorkItemList.tsx

import React, { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, WorkItemStatus } from '../../../domain/work-items/WorkItem';
import { WorkItemService } from '../services/WorkItemService';
import { Plus, Search, Calendar, User, MapPin, ChevronRight, X } from 'lucide-react';

const workItemService = new WorkItemService();

const workItemIcons: Record<WorkItemType, string> = {
  inspection: '🔍',
  concrete_pour: '🧱',
  survey: '📐',
  drawing_revision: '✏️',
  material_delivery: '📦',
  site_visit: '🏗️',
  meeting: '🤝',
  daily_diary: '📝',
  decision: '✅',
  rfi: '❓',
  submittal: '📄',
  test: '🧪',
  lecture: '📚',
  research: '🔬',
  assignment: '📋',
  design_review: '👁️',
  quality_check: '✅',
  safety_observation: '⚠️',
  other: '📌',
};

const statusColors: Record<WorkItemStatus, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  delayed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  on_hold: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

interface WorkItemListProps {
  workspaceId: string;
  onSelectWorkItem?: (workItem: WorkItem) => void;
  onAddRecord?: (workItemId: string) => void;
}

export function WorkItemList({ workspaceId, onSelectWorkItem, onAddRecord }: WorkItemListProps) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkItemStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadWorkItems();
  }, [workspaceId]);

  useEffect(() => {
    applyFilters();
  }, [workItems, searchQuery, statusFilter]);

  const loadWorkItems = async () => {
    setLoading(true);
    try {
      const items = await workItemService.getByWorkspace(workspaceId);
      setWorkItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Failed to load work items:', error);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = workItems;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleCreateWorkItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newItem = await workItemService.create({
      workspaceId,
      type: formData.get('type') as WorkItemType,
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      occurredAt: new Date(formData.get('occurredAt') as string),
      location: formData.get('location') as string || undefined,
      performedBy: 'user-001',
      team: [],
      notes: formData.get('notes') as string || undefined,
      priority: (formData.get('priority') as 'low' | 'medium' | 'high' | 'critical') || 'medium',
    });

    setWorkItems([newItem, ...workItems]);
    setShowCreateForm(false);
  };

  if (loading) {
    return <div className="text-slate-500 dark:text-slate-400">Loading work items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search work items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Work Item
        </button>
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p className="text-lg">No work items</p>
            <p className="text-sm">Create your first work item to track engineering work</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => onSelectWorkItem?.(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{workItemIcons[item.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900 dark:text-white">{item.title}</h3>
                      <span className={"px-2 py-0.5 text-xs rounded " + (statusColors[item.status] || '')}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          High Priority
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.occurredAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.performedBy}
                      </span>
                      <span>{item.recordIds.length} records</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onAddRecord && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddRecord(item.id);
                      }}
                      className="px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"
                    >
                      Add Record
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Work Item Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Work Item</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorkItem} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="inspection">🔍 Inspection</option>
                  <option value="concrete_pour">🧱 Concrete Pour</option>
                  <option value="survey">📐 Survey</option>
                  <option value="site_visit">🏗️ Site Visit</option>
                  <option value="meeting">🤝 Meeting</option>
                  <option value="daily_diary">📝 Daily Diary</option>
                  <option value="drawing_revision">✏️ Drawing Revision</option>
                  <option value="decision">✅ Decision</option>
                  <option value="quality_check">✅ Quality Check</option>
                  <option value="safety_observation">⚠️ Safety Observation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Foundation Inspection F3"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="What work was done?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    name="occurredAt"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Site A, Block 3"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  name="priority"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                >
                  Create Work Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
