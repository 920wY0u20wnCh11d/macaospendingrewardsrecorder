export interface Award {
  id: string;
  value: number; // 10, 20, 50, 100, or 200 MOP, or 0 for "謝謝惠顧"
  drawDate: string; // ISO date string
  expiryDate: string; // ISO date string
  redeemed: boolean;
  redeemedDate?: string; // ISO date string when redeemed
  merchant?: string; // Optional merchant name
  notes?: string; // Optional notes
  bank: Bank; // Bank/payment provider
  isThankYou?: boolean; // Special flag for "謝謝惠顧" awards
}

export type AwardValue = 10 | 20 | 50 | 100 | 200 | 0;

export const BANKS = [
  '螞蟻銀行',
  '中國銀行',
  '廣發銀行',
  '中國工商銀行',
  '澳門國際銀行',
  '澳門通',
  '大豐銀行',
  '極易付'
] as const;

export type Bank = typeof BANKS[number];
