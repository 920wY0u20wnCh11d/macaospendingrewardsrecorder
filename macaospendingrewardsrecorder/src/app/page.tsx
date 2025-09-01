'use client';

import { useState, useEffect } from 'react';
import { Award } from '../types/award';
import { getAwards, addAward, updateAward, deleteAward, getAwardSummary } from '../lib/storage';
import AwardForm from '../components/AwardForm';
import AwardList from '../components/AwardList';
import Summary from '../components/Summary';

export default function Home() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | undefined>();
  const [currentView, setCurrentView] = useState<'list' | 'summary'>('list');

  useEffect(() => {
    setAwards(getAwards());
  }, []);

  const handleAddAward = (awardData: Omit<Award, 'id'> | Omit<Award, 'id'>[]) => {
    if (Array.isArray(awardData)) {
      // Handle multiple awards
      const newAwards = awardData.map(data => addAward(data));
      setAwards(prev => [...prev, ...newAwards]);
    } else {
      // Handle single award (for editing existing awards)
      const newAward = addAward(awardData);
      setAwards(prev => [...prev, newAward]);
    }
    setShowForm(false);
  };

  const handleUpdateAward = (awardData: Omit<Award, 'id'> | Omit<Award, 'id'>[]) => {
    if (!editingAward) return;

    // For editing, we only handle single award updates
    if (Array.isArray(awardData)) {
      // If somehow we get multiple awards during edit, just use the first one
      const updatedAward = updateAward(editingAward.id, awardData[0]);
      if (updatedAward) {
        setAwards(prev => prev.map(award =>
          award.id === editingAward.id ? updatedAward : award
        ));
      }
    } else {
      const updatedAward = updateAward(editingAward.id, awardData);
      if (updatedAward) {
        setAwards(prev => prev.map(award =>
          award.id === editingAward.id ? updatedAward : award
        ));
      }
    }
    setEditingAward(undefined);
    setShowForm(false);
  };

  const handleDeleteAward = (id: string) => {
    if (confirm('確定要刪除這個獎品記錄嗎？')) {
      const success = deleteAward(id);
      if (success) {
        setAwards(prev => prev.filter(award => award.id !== id));
      }
    }
  };

  const handleToggleRedeemed = (id: string) => {
    const award = awards.find(a => a.id === id);
    if (!award) return;

    const updates = {
      redeemed: !award.redeemed,
      redeemedDate: !award.redeemed ? new Date().toISOString() : undefined,
    };

    const updatedAward = updateAward(id, updates);
    if (updatedAward) {
      setAwards(prev => prev.map(award =>
        award.id === id ? updatedAward : award
      ));
    }
  };

  const handleEditAward = (award: Award) => {
    setEditingAward(award);
    setShowForm(true);
  };

  const handleUpdateMerchant = (id: string, merchant: string | undefined) => {
    const updatedAward = updateAward(id, { merchant });
    if (updatedAward) {
      setAwards(prev => prev.map(award =>
        award.id === id ? updatedAward : award
      ));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAward(undefined);
  };

  const summary = getAwardSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            澳門消費獎賞記錄器(個人版)
          </h1>
          <p className="text-gray-600">
            記錄和管理您的電子優惠券
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              獎品記錄
            </button>
            <button
              onClick={() => setCurrentView('summary')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              統計摘要
            </button>
          </div>
        </div>

        {/* Add Award Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingAward(undefined);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            + 新增獎品
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <AwardForm
                  award={editingAward}
                  onSave={editingAward ? handleUpdateAward : handleAddAward}
                  onCancel={handleCancelForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {currentView === 'list' ? (
          <AwardList
            awards={awards}
            onEdit={handleEditAward}
            onDelete={handleDeleteAward}
            onToggleRedeemed={handleToggleRedeemed}
            onUpdateMerchant={handleUpdateMerchant}
          />
        ) : (
          <Summary summary={summary} />
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">活動資訊</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>活動期間：</strong>2025年9月1日 00:00 至 2025年11月30日 23:59</p>
            <p><strong>電子優惠面值：</strong>10、20、50、100 或 200 澳門元</p>
            <p><strong>兌換期限：</strong>獲得後緊接的周六及周日</p>
            <p><strong>注意：</strong>逾期無效，不可轉讓或兌現</p>
          </div>
        </div>
      </div>
    </div>
  );
}
