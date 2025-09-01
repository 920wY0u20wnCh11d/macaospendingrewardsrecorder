'use client';

import { useState, useEffect } from 'react';
import { Award } from '@/types/award';
import { storageUtils } from '@/utils/storage';
import { isAwardExpired } from '@/utils/dateUtils';
import AwardForm from '@/components/AwardForm';
import AwardList from '@/components/AwardList';
import Summary from '@/components/Summary';

export default function Home() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load awards from localStorage on component mount
  useEffect(() => {
    const loadedAwards = storageUtils.getAwards();
    // Update expired awards status
    const updatedAwards = loadedAwards.map(award => {
      if (isAwardExpired(award.expiryDate) && award.status !== 'expired') {
        return { ...award, status: 'expired' as const };
      }
      return award;
    });
    
    // Save updated awards if any status changed
    if (updatedAwards.some((award, index) => award.status !== loadedAwards[index]?.status)) {
      storageUtils.saveAwards(updatedAwards);
    }
    
    setAwards(updatedAwards);
    setIsLoading(false);
  }, []);

  const handleAddOrUpdateAward = (award: Award) => {
    if (editingAward) {
      // Update existing award
      storageUtils.updateAward(award);
      setAwards(prev => prev.map(a => a.id === award.id ? award : a));
      setEditingAward(null);
    } else {
      // Add new award
      storageUtils.addAward(award);
      setAwards(prev => [...prev, award]);
    }
  };

  const handleEditAward = (award: Award) => {
    setEditingAward(award);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAward = (id: string) => {
    if (window.confirm('Are you sure you want to delete this award?')) {
      storageUtils.deleteAward(id);
      setAwards(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: Award['status']) => {
    const award = awards.find(a => a.id === id);
    if (award) {
      const updatedAward = { ...award, status, updatedAt: new Date().toISOString() };
      storageUtils.updateAward(updatedAward);
      setAwards(prev => prev.map(a => a.id === id ? updatedAward : a));
    }
  };

  const handleCancelEdit = () => {
    setEditingAward(null);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL awards? This action cannot be undone.')) {
      storageUtils.clearAllAwards();
      setAwards([]);
      setEditingAward(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Macao Lucky Draw Recorder</h1>
              <p className="text-gray-600 mt-1">Manage and track your lucky draw awards</p>
            </div>
            {awards.length > 0 && (
              <button
                onClick={handleClearAllData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                Clear All Data
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Summary */}
          <Summary awards={awards} />
          
          {/* Award Form */}
          <AwardForm
            onSubmit={handleAddOrUpdateAward}
            editingAward={editingAward}
            onCancel={handleCancelEdit}
          />
          
          {/* Awards List */}
          <AwardList
            awards={awards}
            onEdit={handleEditAward}
            onDelete={handleDeleteAward}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Macao Lucky Draw Recorder. All data is stored locally in your browser.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
