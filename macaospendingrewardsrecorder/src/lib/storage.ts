import { Award } from '../types/award';

const STORAGE_KEY = 'macau-spending-rewards-awards';

export const getAwards = (): Award[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const awards = JSON.parse(stored);
    // Migrate old awards that don't have bank field or isThankYou field
    return awards.map((award: any) => ({
      ...award,
      bank: award.bank || '螞蟻銀行（澳門）股份有限公司', // Default to first bank for backward compatibility
      isThankYou: award.isThankYou !== undefined ? award.isThankYou : award.value === 0 // Set isThankYou based on value for old records
    }));
  } catch (error) {
    console.error('Error loading awards from localStorage:', error);
    return [];
  }
};

export const saveAwards = (awards: Award[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(awards));
  } catch (error) {
    console.error('Error saving awards to localStorage:', error);
  }
};

export const addAward = (award: Omit<Award, 'id'>): Award => {
  const awards = getAwards();
  const newAward: Award = {
    ...award,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  awards.push(newAward);
  saveAwards(awards);
  return newAward;
};

export const updateAward = (id: string, updates: Partial<Award>): Award | null => {
  const awards = getAwards();
  const index = awards.findIndex(award => award.id === id);
  if (index === -1) return null;

  awards[index] = { ...awards[index], ...updates };
  saveAwards(awards);
  return awards[index];
};

export const deleteAward = (id: string): boolean => {
  const awards = getAwards();
  const filteredAwards = awards.filter(award => award.id !== id);
  if (filteredAwards.length === awards.length) return false;

  saveAwards(filteredAwards);
  return true;
};

export const getAwardSummary = () => {
  const awards = getAwards();
  const totalAwards = awards.length;
  const redeemedAwards = awards.filter(award => award.redeemed).length;
  const pendingAwards = totalAwards - redeemedAwards;
  const totalValue = awards.reduce((sum, award) => sum + award.value, 0);
  const redeemedValue = awards
    .filter(award => award.redeemed)
    .reduce((sum, award) => sum + award.value, 0);
  const pendingValue = totalValue - redeemedValue;

  // Group by value
  const valueDistribution = awards.reduce((acc, award) => {
    acc[award.value] = (acc[award.value] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Group by bank
  const bankDistribution = awards.reduce((acc, award) => {
    acc[award.bank] = (acc[award.bank] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check for expired awards
  const now = new Date();
  const expiredAwards = awards.filter(award =>
    !award.redeemed && new Date(award.expiryDate) < now
  ).length;

  return {
    totalAwards,
    redeemedAwards,
    pendingAwards,
    totalValue,
    redeemedValue,
    pendingValue,
    valueDistribution,
    bankDistribution,
    expiredAwards,
  };
};
