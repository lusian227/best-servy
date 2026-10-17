// src/core/sagas/Saga.interface.ts
import { Event } from '../events/EventTypes';

export interface Saga<T = any> {
  id: string;
  name: string;
  state: SagaState;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}

export interface SagaState {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensating' | 'compensated';
  currentStep: number;
  steps: SagaStep[];
  error?: string;
}

export interface SagaStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  action: (data: any) => Promise<any>;
  compensation?: (data: any) => Promise<any>;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  result?: any;
}

export interface SagaCoordinator {
  start(saga: Saga): Promise<void>;
  compensate(sagaId: string): Promise<void>;
  getStatus(sagaId: string): Promise<SagaState | null>;
}
