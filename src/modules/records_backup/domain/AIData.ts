// src/modules/records/domain/AIData.ts

export interface AIData {
  summary?: string;
  keywords: string[];
  entities: AIEntity[];
  embeddings?: number[];
  extractedText?: string;
  confidence: number;
  processedAt?: Date;
  modelVersion?: string;
  suggestions: string[];
  recommendations: string[];
  similarRecords: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  riskFactors?: string[];
  metadata?: Record<string, any>;
}

export interface AIEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
  metadata?: Record<string, any>;
}

export enum EntityType {
  PERSON = 'person',
  ORGANIZATION = 'organization',
  LOCATION = 'location',
  DATE = 'date',
  MATERIAL = 'material',
  SPECIFICATION = 'specification',
  MEASUREMENT = 'measurement',
  STANDARD = 'standard',
  EQUIPMENT = 'equipment',
  SYSTEM = 'system',
  COMPONENT = 'component',
  PROJECT = 'project',
  CONTRACT = 'contract',
  REGULATION = 'regulation'
}
