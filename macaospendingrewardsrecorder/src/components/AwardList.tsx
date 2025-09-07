'use client';

import { useState, useCallback } from 'react';
import { Award } from '../types/award';

interface AwardListProps {
  awards: Award[];
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
  onToggleRedeemed: (id: string) => void;
  onUpdateMerchant: (id: string, merchant: string | undefined) => void;
}

export default function AwardList({ awards, onEdit, onDelete, onToggleRedeemed, onUpdateMerchant }: AwardListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'status' | 'bank' | 'merchant' | 'expiry'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'pending' | 'redeemed' | 'expired'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMerchant, setEditingMerchant] = useState<string | null>(null);
  const [merchantValue, setMerchantValue] = useState('');
  const [showMerchantSuggestions, setShowMerchantSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Get unique merchants from existing awards
  const getUniqueMerchants = useCallback(() => {
    const merchants = awards
      .map(award => award.merchant)
      .filter((merchant): merchant is string => merchant !== undefined && merchant.trim() !== '')
      .filter((merchant, index, arr) => arr.indexOf(merchant) === index) // Remove duplicates
      .sort();
    return merchants;
  }, [awards]);

  const merchantSuggestions = getUniqueMerchants();

  const getFilteredMerchantSuggestions = (input: string) => {
    if (!input) return [];
    return merchantSuggestions.filter((merchant: string) =>
      merchant.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const isExpired = (award: Award) => {
    // Compare only the date part (ignore time)
    const expiry = new Date(award.expiryDate);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return !award.redeemed && expiry < today;
  };

  const filteredAndSortedAwards = awards
    .filter(award => {
      // First apply status filter
      switch (filter) {
        case 'pending':
          if (award.redeemed || isExpired(award)) return false;
          break;
        case 'redeemed':
          if (!award.redeemed) return false;
          break;
        case 'expired':
          if (!isExpired(award)) return false;
          break;
      }
      
      // Then apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesMerchant = award.merchant?.toLowerCase().includes(searchLower);
        const matchesBank = award.bank.toLowerCase().includes(searchLower);
        const matchesNotes = award.notes?.toLowerCase().includes(searchLower);
        const matchesValue = award.value.toString().includes(searchTerm);
        
        if (!matchesMerchant && !matchesBank && !matchesNotes && !matchesValue) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime();
          break;
        case 'value':
          comparison = b.value - a.value;
          break;
        case 'status':
          // Define status priority: usable > waiting > redeemed > expired
          const getStatusPriority = (award: Award) => {
            if (award.redeemed) return 2; // 已兌換
            if (isExpired(award)) return 3; // 已過期
            
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
            const isUsagePeriod = dayOfWeek === 0 || dayOfWeek === 6;
            
            if (isUsagePeriod) return 0; // 可使用 (highest priority)
            return 1; // 等待使用期
          };
          
          const priorityA = getStatusPriority(a);
          const priorityB = getStatusPriority(b);
          
          if (priorityA !== priorityB) {
            comparison = priorityA - priorityB;
          } else {
            // Same priority, sort by date
            comparison = new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime();
          }
          break;
        case 'bank':
          comparison = a.bank.localeCompare(b.bank);
          break;
        case 'merchant':
          const merchantA = a.merchant || '';
          const merchantB = b.merchant || '';
          comparison = merchantA.localeCompare(merchantB);
          break;
        case 'expiry':
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (award: Award) => {
    if (award.redeemed) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已兌換</span>;
    }
    if (isExpired(award)) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">已過期</span>;
    }

    // Check if we're in usage period (Saturday or Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const isUsagePeriod = dayOfWeek === 0 || dayOfWeek === 6;

    if (isUsagePeriod) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">可使用</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">等待使用期</span>;
    }
  };

  const handleEditMerchant = (award: Award) => {
    setEditingMerchant(award.id);
    setMerchantValue(award.merchant || '');
    setShowMerchantSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleMerchantValueChange = (value: string) => {
    setMerchantValue(value);
    setShowMerchantSuggestions(value.length > 0 && merchantSuggestions.length > 0);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  const handleMerchantKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = getFilteredMerchantSuggestions(merchantValue);
    
    if (!showMerchantSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleMerchantSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowMerchantSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleMerchantSuggestionSelect = (suggestion: string) => {
    setMerchantValue(suggestion);
    setShowMerchantSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSaveMerchant = (awardId: string) => {
    onUpdateMerchant(awardId, merchantValue.trim() || undefined);
    setEditingMerchant(null);
    setMerchantValue('');
    setShowMerchantSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleCancelMerchantEdit = () => {
    setEditingMerchant(null);
    setMerchantValue('');
    setShowMerchantSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">獎品記錄</h2>
            <span className="text-sm text-gray-500">
              顯示 {filteredAndSortedAwards.length} / {awards.length} 筆記錄
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索商戶、銀行、備註或面值..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 min-h-[44px]"
                suppressHydrationWarning
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 min-h-[44px]"
              suppressHydrationWarning
            >
              <option value="all">全部</option>
              <option value="pending">未兌換</option>
              <option value="redeemed">已兌換</option>
              <option value="expired">已過期</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 min-h-[44px]"
              suppressHydrationWarning
            >
              <option value="date">按日期排序</option>
              <option value="value">按面值排序</option>
              <option value="status">按狀態排序</option>
              <option value="bank">按銀行排序</option>
              <option value="merchant">按商戶排序</option>
              <option value="expiry">按到期日期排序</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={`切換排序順序 (${sortOrder === 'asc' ? '升序' : '降序'})`}
              suppressHydrationWarning
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredAndSortedAwards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' ? '還沒有記錄任何獎品' : '沒有符合條件的獎品'}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
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
                          <div className="relative">
                            <div className="flex items-center space-x-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={merchantValue}
                                  onChange={(e) => handleMerchantValueChange(e.target.value)}
                                  onKeyDown={handleMerchantKeyDown}
                                  onFocus={() => {
                                    if (merchantValue && merchantSuggestions.length > 0) {
                                      setShowMerchantSuggestions(true);
                                    }
                                  }}
                                  onBlur={() => {
                                    // Delay hiding suggestions to allow click on suggestion
                                    setTimeout(() => {
                                      setShowMerchantSuggestions(false);
                                      setSelectedSuggestionIndex(-1);
                                    }, 200);
                                  }}
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-800"
                                  placeholder="輸入商戶名稱"
                                  autoFocus
                                  suppressHydrationWarning
                                />
                                {merchantSuggestions.length > 0 && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                                    💡
                                  </div>
                                )}
                                
                                {/* Merchant Suggestions Dropdown */}
                                {showMerchantSuggestions && (
                                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                                    {getFilteredMerchantSuggestions(merchantValue).length > 0 ? (
                                      getFilteredMerchantSuggestions(merchantValue).map((suggestion, index) => (
                                        <div
                                          key={index}
                                          onClick={() => handleMerchantSuggestionSelect(suggestion)}
                                          className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                                            index === selectedSuggestionIndex
                                              ? 'bg-blue-100 text-blue-900'
                                              : 'hover:bg-gray-100'
                                          }`}
                                        >
                                          {suggestion}
                                        </div>
                                      ))
                                    ) : merchantValue && (
                                      <div className="px-3 py-2 text-sm text-gray-500">
                                        無匹配的商戶建議
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
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
                          {award.redeemed ? '取消兌換' : '標記已使用'}
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredAndSortedAwards.map((award) => (
                <div key={award.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {award.isThankYou ? (
                          <span className="text-orange-600">謝謝惠顧</span>
                        ) : (
                          `${award.value} MOP`
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate" title={award.bank}>
                        {award.bank}
                      </div>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(award)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">抽獎日期:</span>
                      <div className="text-gray-900">{formatDate(award.drawDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">到期日期:</span>
                      <div className={`font-medium ${isExpired(award) ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(award.expiryDate)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm text-gray-500">商戶:</span>
                    {editingMerchant === award.id ? (
                      <div className="relative mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={merchantValue}
                              onChange={(e) => handleMerchantValueChange(e.target.value)}
                              onKeyDown={handleMerchantKeyDown}
                              onFocus={() => {
                                if (merchantValue && merchantSuggestions.length > 0) {
                                  setShowMerchantSuggestions(true);
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setShowMerchantSuggestions(false);
                                  setSelectedSuggestionIndex(-1);
                                }, 200);
                              }}
                              className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-800 min-h-[44px]"
                              placeholder="輸入商戶名稱"
                              autoFocus
                              suppressHydrationWarning
                            />
                            {merchantSuggestions.length > 0 && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                                💡
                              </div>
                            )}
                            
                            {showMerchantSuggestions && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                                {getFilteredMerchantSuggestions(merchantValue).length > 0 ? (
                                  getFilteredMerchantSuggestions(merchantValue).map((suggestion, index) => (
                                    <div
                                      key={index}
                                      onClick={() => handleMerchantSuggestionSelect(suggestion)}
                                      className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                                        index === selectedSuggestionIndex
                                          ? 'bg-blue-100 text-blue-900'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      {suggestion}
                                    </div>
                                  ))
                                ) : merchantValue && (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    無匹配的商戶建議
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleSaveMerchant(award.id)}
                            className="text-green-600 hover:text-green-800 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelMerchantEdit}
                            className="text-red-600 hover:text-red-800 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-900">
                          {award.merchant || '未設定'}
                        </span>
                        <button
                          onClick={() => handleEditMerchant(award)}
                          className="text-blue-600 hover:text-blue-800 text-sm ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="編輯商戶"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onToggleRedeemed(award.id)}
                      className={`px-3 py-2 rounded text-sm font-medium min-h-[44px] flex-1 ${
                        award.redeemed
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {award.redeemed ? '取消兌換' : '標記已使用'}
                    </button>
                    <button
                      onClick={() => onEdit(award)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 min-h-[44px] flex-1"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => onDelete(award.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 min-h-[44px] flex-1"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
