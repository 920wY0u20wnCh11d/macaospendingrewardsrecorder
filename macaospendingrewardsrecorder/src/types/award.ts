export interface Award {
  id: string;
  name: string;
  description: string;
  drawDate: string;
  expiryDate: string;
  status: 'pending' | 'claimed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface AwardFormData {
  name: string;
  description: string;
  drawDate: string;
}