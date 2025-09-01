import { Award } from '@/types/award';

const STORAGE_KEY = 'macao-awards';

export const storageUtils = {
  // Get all awards from localStorage
  getAwards: (): Award[] => {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading awards from localStorage:', error);
      return [];
    }
  },

  // Save awards to localStorage
  saveAwards: (awards: Award[]): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(awards));
    } catch (error) {
      console.error('Error saving awards to localStorage:', error);
    }
  },

  // Add a new award
  addAward: (award: Award): void => {
    const awards = storageUtils.getAwards();
    awards.push(award);
    storageUtils.saveAwards(awards);
  },

  // Update an existing award
  updateAward: (updatedAward: Award): void => {
    const awards = storageUtils.getAwards();
    const index = awards.findIndex(award => award.id === updatedAward.id);
    if (index !== -1) {
      awards[index] = updatedAward;
      storageUtils.saveAwards(awards);
    }
  },

  // Delete an award
  deleteAward: (id: string): void => {
    const awards = storageUtils.getAwards();
    const filtered = awards.filter(award => award.id !== id);
    storageUtils.saveAwards(filtered);
  },

  // Clear all awards
  clearAllAwards: (): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing awards from localStorage:', error);
    }
  }
};