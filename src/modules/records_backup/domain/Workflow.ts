// src/modules/records/domain/Workflow.ts

export interface WorkflowDefinition {
  id: string;
  name: string;
  recordCategory: RecordCategory;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  action: string;
  requiredRoles: string[];
  requiresSignature: boolean;
  conditions?: WorkflowCondition[];
  notifications: NotificationConfig[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}

export interface NotificationConfig {
  type: 'email' | 'websocket' | 'push';
  recipients: string[];
  template: string;
}
