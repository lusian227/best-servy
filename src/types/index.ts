// src/types/index.ts - Master barrel export

// Export all type files
export * from './asset';
export * from './calculation';
export * from './decision';
export * from './drawing';
export * from './lesson';
export * from './marketplace';
export * from './note';
export * from './project';
export * from './record';
export * from './report';
export * from './rfi';
export * from './siteDiary';
export * from './trace';
export * from './weather';
export * from './workspace';
export * from './company';

// ============================================================
// SIMPLE UI/PROFILE TYPES
// ============================================================

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  company?: string;
  department?: string;
}

// ✅ FIXED: World as type (not interface) - matches App.tsx
// src/types/index.ts or wherever World is defined

export type World =
  | 'workspace'
  | 'projects'
  | 'knowledge'
  | 'marketplace'
  | 'ai'
  | 'company'
  | 'records'
  | 'procurement'
  | 'supplier_procurement';  // ✅ ADD THIS

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  time?: string;
  author?: string;
  projectId?: string;
  projectName?: string;
  iconName?: string;
  linkedAssetCount?: number;
}

// ============================================================
// SINGLE SOURCE LINK
// ============================================================

export interface SingleSourceLink {
  id: string;
  type: 'project' | 'record' | 'decision' | 'drawing' | 'note' | 'lesson' | 'photo' | 'rfi' | 'specification' | 'report' | 'calculation' | 'element' | 'inspection' | 'test';
  title: string;
  subtitle?: string;
  url?: string;
  date?: string;
  status?: string;
  metadata?: Record<string, any>;
}

// ============================================================
// SITE DIARY
// ============================================================

export interface SiteDiaryEntry {
  id: string;
  projectId: string;
  date: string;
  weather: {
    temp: string;
    condition: string;
    impact: string;
  };
  workforceCount: number;
  keyActivities: string[];
  equipmentOnSite: Array<{ name: string; status: string }>;
  deliveries: Array<{ material: string; quantity: string; supplier: string }>;
  photosCount: number;
  aiSummary: string;
  preparedBy: string;
}

// ============================================================
// DIGITAL TWIN - ✅ FIXED with all properties
// ============================================================

export interface DigitalTwinNode {
  id: string;
  label?: string;
  elementName?: string;
  type: 'asset' | 'system' | 'process' | 'person' | 'location' | 'Beam' | 'Column' | 'Slab' | 'Wall' | 'Foundation';
  floor?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'warning' | 'Normal' | 'Warning' | 'Critical' | 'Good';
  stressRatio?: number;
  deflectionMm?: number;
  concreteGrade?: string;
  lastTestedDate?: string;
  sensorReading?: string;
  parentId?: string;
  children?: string[];
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  health?: number;
  temperature?: number;
  vibration?: number;
  lastInspection?: string;
  nextMaintenance?: string;
}

// ============================================================
// ❌ REMOVED: StandardDoc (no longer used - replaced by Records architecture)
// ❌ REMOVED: World interface (now a type alias)
// ============================================================