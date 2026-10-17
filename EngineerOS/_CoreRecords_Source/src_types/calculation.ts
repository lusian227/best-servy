export interface CalculationHistory {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  calculationType: string;
  inputs: Record<string, any>;
  result: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type CalculationItem = CalculationHistory;
