// src/core/types/index.ts

export interface IEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DomainEvent = {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  companyId?: string;
  aggregateId?: string;
  aggregateType?: string;
  version?: number;
  metadata?: Record<string, any>;
};