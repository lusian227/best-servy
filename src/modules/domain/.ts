export interface ProcurementDelivery {
  id: string;
  procurementRequestId: string;
  workspaceId: string;
  deliveryNumber: number;
  deliveryDate: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unit?: string;
  condition: DeliveryCondition;
  notes?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
}