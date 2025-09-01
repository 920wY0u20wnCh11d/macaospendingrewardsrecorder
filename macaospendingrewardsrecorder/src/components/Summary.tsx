'use client';

import { BANKS } from '../types/award';

interface SummaryProps {
  summary: {
    totalAwards: number;
    redeemedAwards: number;
    pendingAwards: number;
    totalValue: number;
    redeemedValue: number;
    pendingValue: number;
    expiredValue: number;
    valueDistribution: Record<number, number>;
    detailedValueStats: Record<number, {
      total: number;
      redeemed: number;
      pending: number;
      expired: number;
      totalValue: number;
      redeemedValue: number;
      pendingValue: number;
    }>;
    bankDistribution: Record<string, number>;
    bankValueDistribution: Record<string, {
      totalAwards: number;
      valueBreakdown: Record<number, number>;
      bigAwards: number;
      totalValue: number;
      bigAwardValue: number;
      probability: number;
    }>;
    topBigAwardBanks: Array<{
      bank: string;
      probability: number;
      bigAwards: number;
      totalAwards: number;
      bigAwardValue: number;
    }>;
    expiredAwards: number;
  };
}

export default function Summary({ summary }: SummaryProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} MOP`;
  };

  const getProgressPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h2 className="text-xl font-bold mb-6 text-gray-800">獎品統計</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{summary.totalAwards}</div>
          <div className="text-sm text-blue-800">總獎品數</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.redeemedAwards}</div>
          <div className="text-sm text-green-800">已兌換</div>
          <div className="text-xs text-green-600 mt-1">
            {getProgressPercentage(summary.redeemedAwards, summary.totalAwards)}%
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{summary.pendingAwards}</div>
          <div className="text-sm text-yellow-800">待兌換</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{summary.expiredAwards}</div>
          <div className="text-sm text-red-800">已過期</div>
        </div>
      </div>

      {/* Value Summary - Moved to top for prominence */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
          💰 價值統計總覽
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <div className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalValue)}</div>
            <div className="text-sm text-gray-600">總價值</div>
          </div>

          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <div className="text-xl font-bold text-green-600">{formatCurrency(summary.redeemedValue)}</div>
            <div className="text-sm text-gray-600">已兌換價值</div>
          </div>

          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(summary.pendingValue)}</div>
            <div className="text-sm text-gray-600">待兌換價值</div>
          </div>

          <div className="text-center bg-white p-4 rounded-lg shadow-sm">
            <div className="text-xl font-bold text-red-600">{formatCurrency(summary.expiredValue)}</div>
            <div className="text-sm text-gray-600">已過期價值</div>
          </div>
        </div>
      </div>

      {/* 兌換進度 - Moved up for better visibility */}
      {summary.totalAwards > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🎯 兌換進度</h3>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium"
              style={{ width: `${getProgressPercentage(summary.redeemedAwards, summary.totalAwards)}%` }}
            >
              {getProgressPercentage(summary.redeemedAwards, summary.totalAwards)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {summary.redeemedAwards} / {summary.totalAwards}
            </div>
            <div className="text-sm text-gray-600">獎品已兌換</div>
          </div>
        </div>
      )}

      {/* 大獎機率最高的銀行 TOP 3 - Moved up for prominence */}
      {summary.topBigAwardBanks.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">🏆 大獎機率最高的銀行 TOP 3</h3>
          <div className="space-y-3">
            {summary.topBigAwardBanks.map((bank, index) => (
              <div key={bank.bank} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg' :
                      index === 1 ? 'bg-gray-400 text-white shadow-lg' :
                      'bg-orange-400 text-orange-900 shadow-lg'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 truncate max-w-xs" title={bank.bank}>
                        {bank.bank}
                      </div>
                      <div className="text-sm text-gray-600">
                        大獎機率: <span className="font-bold text-green-600">{bank.probability}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      {bank.bigAwards}/{bank.totalAwards}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bank.bigAwardValue} MOP
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 銀行獎品詳情 - Moved up for detailed analysis */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 銀行獎品詳情</h3>
        <div className="space-y-4">
          {BANKS.map(bank => {
            const bankData = summary.bankValueDistribution[bank];
            if (!bankData || bankData.totalAwards === 0) return null;

            const hasBigAwards = bankData.bigAwards > 0;

            return (
              <div key={bank} className={`border rounded-lg p-4 ${hasBigAwards ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800 truncate" title={bank}>
                      {bank}
                    </h4>
                    {hasBigAwards && <span className="text-yellow-600">🎯</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    總計: <span className="font-bold">{bankData.totalAwards}</span> 獎品
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                  {[0, 10, 20, 50, 100, 200].map(value => {
                    const count = bankData.valueBreakdown[value] || 0;
                    const percentage = bankData.totalAwards > 0 ? (count / bankData.totalAwards) * 100 : 0;

                    return (
                      <div key={value} className="text-center">
                        <div className={`text-sm font-medium px-2 py-2 rounded-lg ${
                          value === 0 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          value >= 100 ? 'bg-green-100 text-green-800 border border-green-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {value === 0 ? '謝謝惠顧' : `${value}MOP`}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">
                          {count} ({Math.round(percentage)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">
                      大獎機率: <span className={`font-bold ${hasBigAwards ? 'text-green-600' : 'text-gray-500'}`}>
                        {Math.round(bankData.probability * 100) / 100}%
                      </span>
                    </span>
                    <span className="text-gray-600">
                      總價值: <span className="font-bold text-blue-600">{bankData.totalValue} MOP</span>
                    </span>
                  </div>
                  {hasBigAwards && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      大獎銀行
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">💰 面值統計詳情</h3>
        
        {/* Overall Value Distribution */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">總體面值分佈</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[0, 10, 20, 50, 100, 200].map(value => {
              const count = summary.valueDistribution[value] || 0;
              const percentage = summary.totalAwards > 0 ? (count / summary.totalAwards) * 100 : 0;
              
              return (
                <div key={value} className="text-center">
                  <div className={`p-3 rounded-lg border-2 ${
                    value === 0 ? 'bg-orange-50 border-orange-200' :
                    value >= 100 ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="text-lg font-bold text-gray-800">
                      {count}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {value === 0 ? '謝謝惠顧' : `${value} MOP`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Value Breakdown */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-700">兌換狀態詳情</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 10, 20, 50, 100, 200].map(value => {
              const stats = summary.detailedValueStats[value];
              const totalCount = stats ? stats.total : 0;
              
              if (totalCount === 0) {
                return (
                  <div key={value} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-center text-gray-400">
                      <div className="font-medium">
                        {value === 0 ? '謝謝惠顧' : `${value} MOP`}
                      </div>
                      <div className="text-sm">無記錄</div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={value} className={`p-4 rounded-lg border ${
                  value === 0 ? 'bg-orange-50 border-orange-200' :
                  value >= 100 ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-800">
                      {value === 0 ? '謝謝惠顧' : `${value} MOP`}
                    </h5>
                    <span className="text-sm font-bold text-gray-600">
                      {totalCount}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">總數:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">已兌換:</span>
                      <span className="font-medium text-green-600">{stats.redeemed}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">待兌換:</span>
                      <span className="font-medium text-yellow-600">{stats.pending}</span>
                    </div>
                    
                    {stats.expired > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">已過期:</span>
                        <span className="font-medium text-red-600">{stats.expired}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>總價值:</span>
                        <span>{stats.totalValue} MOP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Value Statistics Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium mb-3 text-gray-700">統計摘要</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Object.values(summary.detailedValueStats).reduce((sum, stats) => sum + stats.total, 0)}
              </div>
              <div className="text-gray-600">總獎品數</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {(summary.detailedValueStats[100]?.total || 0) + (summary.detailedValueStats[200]?.total || 0)}
              </div>
              <div className="text-gray-600">大獎數量</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {summary.detailedValueStats[0]?.total || 0}
              </div>
              <div className="text-gray-600">謝謝惠顧</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {Object.keys(summary.detailedValueStats).filter(value => 
                  summary.detailedValueStats[Number(value)].total > 0
                ).length}
              </div>
              <div className="text-gray-600">不同面值</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">承辦單位分佈</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BANKS.map(bank => {
            const bankData = summary.bankValueDistribution[bank];
            const hasBigAwards = bankData && bankData.bigAwards > 0;
            return (
              <div key={bank} className={`p-4 rounded-lg ${hasBigAwards ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-bold text-gray-800">
                    {summary.bankDistribution[bank] || 0}
                  </div>
                  {hasBigAwards && (
                    <span className="text-yellow-600 text-sm font-semibold">🎯</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate mb-2" title={bank}>
                  {bank}
                </div>
                {bankData && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>大獎: {bankData.bigAwards} ({Math.round(bankData.probability * 100) / 100}%)</div>
                    <div>總值: {bankData.totalValue} MOP</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="inline-flex items-center">
            <span className="w-3 h-3 bg-yellow-300 border border-yellow-600 rounded mr-2"></span>
            提供大獎 (≥100 MOP) 的銀行
          </span>
        </div>
      </div>
    </div>
  );
}
