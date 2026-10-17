// src/modules/work-items/services/WorkItemService.ts

import { WorkItem, WorkItemType, WorkItemStatus } from '../../../domain/work-items/WorkItem';

// In-memory store
let workItems: WorkItem[] = [];
let idCounter = 1;

export interface CreateWorkItemInput {
  workspaceId: string;
  type: WorkItemType;
  title: string;
  description?: string;
  occurredAt: Date;
  location?: string;
  performedBy: string;
  team?: string[];
  supervisor?: string;
  projectPhase?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateWorkItemInput {
  title?: string;
  description?: string;
  status?: WorkItemStatus;
  location?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export class WorkItemService {
  
  async create(input: CreateWorkItemInput): Promise<WorkItem> {
    const now = new Date();
    const workItem: WorkItem = {
      id: 'wi-' + String(idCounter++).padStart(4, '0'),
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      description: input.description,
      occurredAt: input.occurredAt,
      location: input.location,
      performedBy: input.performedBy,
      team: input.team || [],
      supervisor: input.supervisor,
      recordIds: [],
      status: 'planned',
      projectPhase: input.projectPhase,
      notes: input.notes,
      priority: input.priority || 'medium',
      createdAt: now,
      updatedAt: now,
      createdBy: input.performedBy,
      updatedBy: input.performedBy,
      timeline: [{
        id: 't' + Date.now(),
        type: 'created',
        description: 'Work item created',
        performedBy: input.performedBy,
        performedAt: now,
      }],
    };
    
    workItems.push(workItem);
    console.log('🏗️ WorkItem created:', workItem.title);
    return workItem;
  }

  async getAll(): Promise<WorkItem[]> {
    return workItems;
  }

  async getByWorkspace(workspaceId: string): Promise<WorkItem[]> {
    return workItems.filter(wi => wi.workspaceId === workspaceId);
  }

  async getById(id: string): Promise<WorkItem | undefined> {
    return workItems.find(wi => wi.id === id);
  }

  async update(id: string, input: UpdateWorkItemInput): Promise<WorkItem | undefined> {
    const existing = workItems.find(wi => wi.id === id);
    if (!existing) return undefined;

    const updated: WorkItem = {
      ...existing,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      status: input.status ?? existing.status,
      location: input.location ?? existing.location,
      notes: input.notes ?? existing.notes,
      priority: input.priority ?? existing.priority,
      updatedAt: new Date(),
      updatedBy: 'system',
      timeline: [
        ...existing.timeline,
        {
          id: 't' + Date.now(),
          type: 'updated',
          description: 'Work item updated',
          performedBy: 'system',
          performedAt: new Date(),
        }
      ],
    };

    const index = workItems.findIndex(wi => wi.id === id);
    workItems[index] = updated;
    console.log('✏️ WorkItem updated:', updated.title);
    return updated;
  }

  async addRecord(workItemId: string, recordId: string): Promise<WorkItem | undefined> {
    const existing = workItems.find(wi => wi.id === workItemId);
    if (!existing) return undefined;

    if (!existing.recordIds.includes(recordId)) {
      existing.recordIds.push(recordId);
      existing.updatedAt = new Date();
      existing.timeline.push({
        id: 't' + Date.now(),
        type: 'record_added',
        description: 'Record added to work item',
        performedBy: 'system',
        performedAt: new Date(),
      });
      console.log('📎 Record added to WorkItem:', existing.title);
    }
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const index = workItems.findIndex(wi => wi.id === id);
    if (index === -1) return false;
    workItems.splice(index, 1);
    console.log('🗑️ WorkItem deleted:', id);
    return true;
  }
}
