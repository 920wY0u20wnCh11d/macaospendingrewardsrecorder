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
    valueDistribution: Record<number, number>;
    bankDistribution: Record<string, number>;
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">{formatCurrency(summary.totalValue)}</div>
          <div className="text-sm text-gray-600">總價值</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{formatCurrency(summary.redeemedValue)}</div>
          <div className="text-sm text-gray-600">已兌換價值</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{formatCurrency(summary.pendingValue)}</div>
          <div className="text-sm text-gray-600">待兌換價值</div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">面值分佈</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[10, 20, 50, 100, 200].map(value => (
            <div key={value} className="text-center">
              <div className="text-xl font-bold text-gray-800">
                {summary.valueDistribution[value] || 0}
              </div>
              <div className="text-sm text-gray-600">{value} MOP</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">承辦單位分佈</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BANKS.map(bank => (
            <div key={bank} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-800">
                {summary.bankDistribution[bank] || 0}
              </div>
              <div className="text-sm text-gray-600 truncate" title={bank}>
                {bank}
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary.totalAwards > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">兌換進度</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(summary.redeemedAwards, summary.totalAwards)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-2 text-center">
            {summary.redeemedAwards} / {summary.totalAwards} 獎品已兌換
          </div>
        </div>
      )}
    </div>
  );
}
