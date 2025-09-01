'use client';

import { useState } from 'react';
import { Award } from '../types/award';

interface AwardListProps {
  awards: Award[];
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
  onToggleRedeemed: (id: string) => void;
  onUpdateMerchant: (id: string, merchant: string | undefined) => void;
}

export default function AwardList({ awards, onEdit, onDelete, onToggleRedeemed, onUpdateMerchant }: AwardListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'status'>('date');
  const [filter, setFilter] = useState<'all' | 'pending' | 'redeemed' | 'expired'>('pending');
  const [editingMerchant, setEditingMerchant] = useState<string | null>(null);
  const [merchantValue, setMerchantValue] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isExpired = (award: Award) => {
    return !award.redeemed && new Date(award.expiryDate) < new Date();
  };

  const filteredAndSortedAwards = awards
    .filter(award => {
      switch (filter) {
        case 'pending':
          return !award.redeemed;
        case 'redeemed':
          return award.redeemed;
        case 'expired':
          return isExpired(award);
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime();
        case 'value':
          return b.value - a.value;
        case 'status':
          if (a.redeemed === b.redeemed) {
            return new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime();
          }
          return a.redeemed ? 1 : -1;
        default:
          return 0;
      }
    });

  const getStatusBadge = (award: Award) => {
    if (award.redeemed) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已兌換</span>;
    }
    if (isExpired(award)) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">已過期</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">待兌換</span>;
  };

  const handleEditMerchant = (award: Award) => {
    setEditingMerchant(award.id);
    setMerchantValue(award.merchant || '');
  };

  const handleSaveMerchant = (awardId: string) => {
    onUpdateMerchant(awardId, merchantValue.trim() || undefined);
    setEditingMerchant(null);
    setMerchantValue('');
  };

  const handleCancelMerchantEdit = () => {
    setEditingMerchant(null);
    setMerchantValue('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">獎品記錄</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="pending">待兌換</option>
              <option value="redeemed">已兌換</option>
              <option value="expired">已過期</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">按日期排序</option>
              <option value="value">按面值排序</option>
              <option value="status">按狀態排序</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredAndSortedAwards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' ? '還沒有記錄任何獎品' : '沒有符合條件的獎品'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  面值
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  承辦單位
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  抽獎日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  到期日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商戶
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedAwards.map((award) => (
                <tr key={award.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {award.isThankYou ? (
                        <span className="text-orange-600 font-semibold">謝謝惠顧</span>
                      ) : (
                        `${award.value} MOP`
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={award.bank}>
                      {award.bank}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(award.drawDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isExpired(award) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(award.expiryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {editingMerchant === award.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={merchantValue}
                          onChange={(e) => setMerchantValue(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="輸入商戶名稱"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveMerchant(award.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                          title="保存"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelMerchantEdit}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="取消"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {award.merchant || '-'}
                        </span>
                        <button
                          onClick={() => handleEditMerchant(award)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="編輯商戶"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(award)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onToggleRedeemed(award.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        award.redeemed
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {award.redeemed ? '取消兌換' : '標記兌換'}
                    </button>
                    <button
                      onClick={() => onEdit(award)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => onDelete(award.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
