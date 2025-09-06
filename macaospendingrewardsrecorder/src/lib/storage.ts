import { Award, BANKS } from '../types/award';

const STORAGE_KEY = 'macau-spending-rewards-awards';

export const getAwards = (): Award[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const awards = JSON.parse(stored);
    // Migrate old awards that don't have bank field or isThankYou field
    return awards.map((award: Partial<Award>) => ({
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
    const filteredAwards = awards.filter((award) => award.id !== id);
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
  const pendingValue = (totalValue - redeemedValue) * 3;

  // Group by value with redeemed/pending breakdown
  const valueDistribution = awards.reduce((acc, award) => {
    acc[award.value] = (acc[award.value] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Detailed value statistics with redeemed/pending breakdown
  const detailedValueStats = awards.reduce((acc, award) => {
    if (!acc[award.value]) {
      acc[award.value] = {
        total: 0,
        redeemed: 0,
        pending: 0,
        expired: 0,
        totalValue: 0,
        redeemedValue: 0,
        pendingValue: 0
      };
    }
    
    acc[award.value].total += 1;
    acc[award.value].totalValue += award.value;
    
    if (award.redeemed) {
      acc[award.value].redeemed += 1;
      acc[award.value].redeemedValue += award.value;
    } else {
      acc[award.value].pending += 1;
      acc[award.value].pendingValue += award.value;
      
      // Check if expired
      if (new Date(award.expiryDate) < new Date()) {
        acc[award.value].expired += 1;
      }
    }
    
    return acc;
  }, {} as Record<number, {
    total: number;
    redeemed: number;
    pending: number;
    expired: number;
    totalValue: number;
    redeemedValue: number;
    pendingValue: number;
  }>);

  // Group by bank
  const bankDistribution = awards.reduce((acc, award) => {
    acc[award.bank] = (acc[award.bank] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Bank-specific value distributions and big award analysis
  const bankValueDistribution = awards.reduce((acc, award) => {
    if (!acc[award.bank]) {
      acc[award.bank] = {
        totalAwards: 0,
        valueBreakdown: {} as Record<number, number>,
        bigAwards: 0, // awards >= 100 MOP
        totalValue: 0,
        bigAwardValue: 0,
        probability: 0
      };
    }
    acc[award.bank].totalAwards += 1;
    acc[award.bank].valueBreakdown[award.value] = (acc[award.bank].valueBreakdown[award.value] || 0) + 1;
    acc[award.bank].totalValue += award.value;

    if (award.value >= 100) {
      acc[award.bank].bigAwards += 1;
      acc[award.bank].bigAwardValue += award.value;
    }

    return acc;
  }, {} as Record<string, {
    totalAwards: number;
    valueBreakdown: Record<number, number>;
    bigAwards: number;
    totalValue: number;
    bigAwardValue: number;
    probability: number;
  }>);

  // Calculate probability for each bank
  Object.keys(bankValueDistribution).forEach(bank => {
    const bankData = bankValueDistribution[bank];
    bankData.probability = bankData.totalAwards > 0 ? (bankData.bigAwards / bankData.totalAwards) * 100 : 0;
  });

  // Get top 3 banks for big awards (by probability, then by total big awards)
  const topBigAwardBanks = Object.entries(bankValueDistribution)
    .filter(([, data]) => data.totalAwards > 0)
    .sort((a, b) => {
      // First sort by probability
      if (b[1].probability !== a[1].probability) {
        return b[1].probability - a[1].probability;
      }
      // Then by total big awards
      return b[1].bigAwards - a[1].bigAwards;
    })
    .slice(0, 3)
    .map(([bank, data]) => ({
      bank,
      probability: Math.round(data.probability * 100) / 100,
      bigAwards: data.bigAwards,
      totalAwards: data.totalAwards,
      bigAwardValue: data.bigAwardValue
    }));

  // Check for expired awards
  const now = new Date();
  const expiredAwards = awards.filter(award =>
    !award.redeemed && new Date(award.expiryDate) < now
  ).length;

  // Calculate expired value
  const expiredValue = awards
    .filter(award => !award.redeemed && new Date(award.expiryDate) < now)
    .reduce((sum, award) => sum + award.value, 0) * 3;

  return {
    totalAwards,
    redeemedAwards,
    pendingAwards,
    totalValue,
    redeemedValue,
    pendingValue,
    expiredValue,
    valueDistribution,
    detailedValueStats,
    bankDistribution,
    bankValueDistribution,
    topBigAwardBanks,
    expiredAwards,
  };
};

export const getBanksWithoutAwardsThisWeek = (): string[] => {
  const awards = getAwards();
  const now = new Date();

  // Get the start of the current week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  // Get the end of the current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get awards from this week
  const thisWeekAwards = awards.filter(award => {
    const drawDate = new Date(award.drawDate);
    return drawDate >= startOfWeek && drawDate <= endOfWeek;
  });

  // Get unique banks that have given awards this week
  const banksWithAwardsThisWeek = new Set(
    thisWeekAwards.map(award => award.bank)
  );

  // Return banks that haven't given awards this week
  return BANKS.filter(bank => !banksWithAwardsThisWeek.has(bank));
};
