// src/core/sagas/sagas/DrawingApprovalSaga.ts
import { supabase } from '../../../lib/supabase';
import { generateUUID } from '../../../utils/uuid';

// ✅ Define the SagaState type locally if it's not imported
export interface SagaState {
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
  currentStep: number;
  steps: {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    action: (data: any) => Promise<{ success: boolean }>;
    compensation?: (data: any) => Promise<void>;
  }[];
}

// ✅ Define the Saga interface locally
export interface Saga<T = any> {
  id: string;
  name: string;
  state: SagaState;
  data: T;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrawingApprovalSagaData {
  drawingId: string;
  projectId: string;
  userId: string;
  companyId: string;
  approvedBy: string;
  comments?: string;
}

export class DrawingApprovalSaga implements Saga<DrawingApprovalSagaData> {
  id: string;
  name = 'DrawingApprovalSaga';
  state: SagaState;
  data: DrawingApprovalSagaData;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: DrawingApprovalSagaData) {
    this.id = generateUUID();  // ✅ FIXED
    this.data = data;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.state = {
      status: 'pending',
      currentStep: 0,
      steps: [
        {
          id: '1',
          name: 'Update drawing status to approved',
          status: 'pending',
          action: async (data: DrawingApprovalSagaData) => {
            const { error } = await supabase
              .from('drawings')
              .update({
                status: 'approved',
                approved_by: data.approvedBy,
                approved_at: new Date().toISOString(),
                comments: data.comments,
              })
              .eq('id', data.drawingId)
              .eq('project_id', data.projectId);

            if (error) throw error;
            return { success: true };
          },
          compensation: async (data: DrawingApprovalSagaData) => {
            await supabase
              .from('drawings')
              .update({
                status: 'in_review',
                approved_by: null,
                approved_at: null,
                comments: null,
              })
              .eq('id', data.drawingId);
          },
        },
        {
          id: '2',
          name: 'Create audit log',
          status: 'pending',
          action: async (data: DrawingApprovalSagaData) => {
            const { error } = await supabase
              .from('audit_logs')
              .insert({
                user_id: data.userId,
                company_id: data.companyId,
                action: 'drawing_approved',
                entity_type: 'drawing',
                entity_id: data.drawingId,
                metadata: {
                  approvedBy: data.approvedBy,
                  comments: data.comments,
                },
              });

            if (error) throw error;
            return { success: true };
          },
        },
        {
          id: '3',
          name: 'Send notification',
          status: 'pending',
          action: async (data: DrawingApprovalSagaData) => {
            // ✅ Notification logic (simplified)
            console.log('Notification sent for drawing:', data.drawingId);
            return { success: true };
          },
        },
        {
          id: '4',
          name: 'Update project dashboard',
          status: 'pending',
          action: async (data: DrawingApprovalSagaData) => {
            // ✅ Dashboard update logic (simplified)
            console.log('Dashboard updated for project:', data.projectId);
            return { success: true };
          },
        },
      ],
    };
  }
}