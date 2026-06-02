export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface StoredAttachment {
  originalName: string;
  size: number;
  mimeType: string;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  name: string;
  phone: string;
  email: string;
  location: string;
  packageType: string;
  startDate: string;
  additionalInfo: string;
  consentGDPR: boolean;
  consentContact: boolean;
  attachment: StoredAttachment | null;
}

export interface CreateOrderInput {
  name: string;
  phone: string;
  email: string;
  location?: string;
  packageType?: string;
  startDate?: string;
  additionalInfo?: string;
  consentGDPR: boolean;
  consentContact: boolean;
  attachment: StoredAttachment | null;
}
