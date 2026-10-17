// src/domain/work-items/WorkItem.ts

export type WorkItemType =
  | 'inspection'
  | 'concrete_pour'
  | 'survey'
  | 'drawing_revision'
  | 'material_delivery'
  | 'site_visit'
  | 'meeting'
  | 'daily_diary'
  | 'decision'
  | 'rfi'
  | 'submittal'
  | 'test'
  | 'lecture'
  | 'research'
  | 'assignment'
  | 'design_review'
  | 'quality_check'
  | 'safety_observation'
  | 'other';

export type WorkItemStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'delayed'
  | 'on_hold';

export interface WorkItem {
  id: string;
  workspaceId: string;
  
  // Identity
  type: WorkItemType;
  title: string;
  description?: string;
  
  // When and where
  occurredAt: Date;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    elevation?: number;
  };
  
  // Who
  performedBy: string;
  team?: string[];
  supervisor?: string;
  
  // The records created during this work
  recordIds: string[];
  
  // Status
  status: WorkItemStatus;
  
  // Context
  projectPhase?: string;
  weather?: WeatherInfo;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  
  // Timeline
  timeline: WorkItemTimelineEvent[];
}

export interface WeatherInfo {
  temperature?: number;
  condition?: string;
  windSpeed?: number;
  humidity?: number;
  precipitation?: number;
}

export interface WorkItemTimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'cancelled' | 'record_added';
  description: string;
  performedBy: string;
  performedAt: Date;
}

export const workItemLabels: Record<WorkItemType, string> = {
  inspection: 'Inspection',
  concrete_pour: 'Concrete Pour',
  survey: 'Survey',
  drawing_revision: 'Drawing Revision',
  material_delivery: 'Material Delivery',
  site_visit: 'Site Visit',
  meeting: 'Meeting',
  daily_diary: 'Daily Diary',
  decision: 'Decision',
  rfi: 'RFI',
  submittal: 'Submittal',
  test: 'Test',
  lecture: 'Lecture',
  research: 'Research',
  assignment: 'Assignment',
  design_review: 'Design Review',
  quality_check: 'Quality Check',
  safety_observation: 'Safety Observation',
  other: 'Other Work',
};

export const workItemIcons: Record<WorkItemType, string> = {
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
