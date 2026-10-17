export interface CalculationHistory {
  id: string;

  type: string;

  date: string;

  expression: string;

  description?: string;

  notes?: string;

  metadata?: Record<string, any>;

  title: string;

  result: string | Record<string, any>;

  createdAt?: string;
}
