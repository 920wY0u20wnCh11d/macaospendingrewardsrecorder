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
  '螞蟻銀行（澳門）股份有限公司',
  '中國銀行（澳門）股份有限公司',
  '廣發銀行股份有限公司澳門分行',
  '中國工商銀行（澳門）股份有限公司',
  '澳門國際銀行股份有限公司',
  '澳門通股份有限公司',
  '大豐銀行股份有限公司',
  '澳門極易付股份有限公司'
] as const;

export type Bank = typeof BANKS[number];
