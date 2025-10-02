export interface ServiceRequest {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  requestedOn: string;
  scheduledDateTime: string;
  accountId: string;
  srType: string;
  recipientEmail: string;
  recipientPhone?: string;
  debitAmount: number;
  isComplete: boolean;
  requestAnnotations: string[];
  fulfilmentDetails: any;
}

export interface ServiceRequestDisplay {
  id: string;
  type: string;
  requestedOn: string;
  scheduledDateTime: string;
  srType: string;
  recipientEmail: string;
  isComplete: boolean;
  requestAnnotations: string[];
  debitAmount: string;
  accountId: string;
}