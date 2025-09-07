'use client';

import { useState, useEffect } from 'react';
import { Award } from '../types/award';
import { getAwards, addAward, updateAward, deleteAward, getAwardSummary } from '../lib/storage';
import AwardForm from '../components/AwardForm';
import AwardList from '../components/AwardList';
import Summary from '../components/Summary';
import BankStatusPreview from '../components/BankStatusPreview';
import TrendReport from '../components/TrendReport';

export default function Home() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | undefined>();
  const [currentView, setCurrentView] = useState<'list' | 'summary' | 'trend'>('list');

  useEffect(() => {
    const loadedAwards = getAwards();
    setAwards(loadedAwards);
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

  const handleExportData = () => {
    try {
      const dataToExport = {
        awards: awards,
        exportDate: new Date().toISOString(),
        version: '1.0',
        app: '澳門消費獎賞記錄器'
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `macau-spending-rewards-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('數據已成功導出！');
    } catch (error) {
      console.error('Export failed:', error);
      alert('導出失敗，請重試。');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Validate the imported data structure
        if (!importedData.awards || !Array.isArray(importedData.awards)) {
          throw new Error('無效的數據格式');
        }

        // Validate each award has required fields
        const validAwards = importedData.awards.filter((award: Partial<Award>) => {
          return award.id && award.value !== undefined && award.drawDate && award.expiryDate && award.bank;
        });

        if (validAwards.length === 0) {
          throw new Error('沒有找到有效的獎品數據');
        }

        // Confirm import
        const confirmed = confirm(
          `確定要匯入 ${validAwards.length} 個獎品記錄嗎？\n\n` +
          `這將會覆蓋現有的所有數據。\n` +
          `建議先導出現有數據作為備份。`
        );

        if (!confirmed) return;

        // Clear existing data and import new data
        // Note: In a real app, you might want to merge data instead of replacing
        localStorage.setItem('macau-spending-rewards-awards', JSON.stringify(validAwards));
        setAwards(validAwards);

        alert(`成功匯入 ${validAwards.length} 個獎品記錄！`);
      } catch (error) {
        console.error('Import failed:', error);
        alert(`匯入失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    };

    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    event.target.value = '';
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
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 sm:p-1 rounded-lg shadow-sm border">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] sm:min-h-auto ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              獎品記錄
            </button>
            <button
              onClick={() => setCurrentView('summary')}
              className={`px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] sm:min-h-auto ${
                currentView === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              統計摘要
            </button>
            <button
              onClick={() => setCurrentView('trend')}
              className={`px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] sm:min-h-auto ${
                currentView === 'trend'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              趨勢分析
            </button>
          </div>
        </div>

        {/* Add Award Button */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setEditingAward(undefined);
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[48px] text-base font-medium"
            >
              + 新增獎品
            </button>
            
            <button
              onClick={handleExportData}
              disabled={awards.length === 0}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors min-h-[48px] text-base font-medium ${
                awards.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={awards.length === 0 ? '沒有數據可導出' : '導出所有獎品數據'}
            >
              📥 導出數據
            </button>
            
            <label className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors cursor-pointer min-h-[48px] text-base font-medium flex items-center justify-center">
              📤 匯入數據
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden text-gray-800"
              />
            </label>
          </div>
        </div>

        {/* Bank Status Preview */}
        {currentView === 'list' && <BankStatusPreview awards={awards} />}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 modal-overlay">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <AwardForm
                  award={editingAward}
                  onSave={editingAward ? handleUpdateAward : handleAddAward}
                  onCancel={handleCancelForm}
                  existingAwards={awards}
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
        ) : currentView === 'summary' ? (
          <Summary summary={summary} />
        ) : (
          <TrendReport awards={awards} />
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">活動資訊</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>活動期間：</strong>2025年9月1日 00:00 至 2025年11月30日 23:59</p>
            <p><strong>抽獎時間：</strong>星期一至星期五</p>
            <p><strong>使用期限：</strong>只能在星期六或星期日使用</p>
            <p><strong>新一輪開始：</strong>下一個星期一淩晨重新開始新一輪</p>
            <p><strong>電子優惠面值：</strong>10、20、50、100 或 200 澳門元</p>
            <p><strong>兌換期限：</strong>獲得後緊接的周六及周日</p>
            <p><strong>注意：</strong>逾期無效，不可轉讓或兌現</p>
            <p>Don’t thank me, give a hug to Grok!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
