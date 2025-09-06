'use client';

import { BANKS, Bank } from '../types/award';

interface BankStatusPreviewProps {
  awards: Array<{
    id: string;
    value: number;
    bank: Bank;
    redeemed: boolean;
    drawDate: string;
    expiryDate: string;
  }>;
}

export default function BankStatusPreview({ awards }: BankStatusPreviewProps) {
  // Get current week's date range (Monday to Sunday)
  const getCurrentWeekRange = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate Monday of current week
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDay + 1);
    monday.setHours(0, 0, 0, 0);
    
    // Calculate Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  // Filter awards to only include those from this week
  const { monday, sunday } = getCurrentWeekRange();
  const thisWeekAwards = awards.filter(award => {
    const drawDate = new Date(award.drawDate);
    return drawDate >= monday && drawDate <= sunday;
  });

  // Calculate bank status using only this week's awards
  const bankStatus = BANKS.map(bank => {
    const bankAwards = thisWeekAwards.filter(award => award.bank === bank);
    const totalAwards = bankAwards.length;
    const redeemedAwards = bankAwards.filter(award => award.redeemed).length;
    const pendingAwards = totalAwards - redeemedAwards;
    
    // Calculate award amounts breakdown
    const awardAmounts = bankAwards.map(award => award.value);
    const totalAwardValue = awardAmounts.reduce((sum, value) => sum + value, 0);
    const awardAmountsStr = awardAmounts.length > 0 ? `(${awardAmounts.join('/')})` : '';
    const awardDisplay = totalAwardValue === 0 ? '0' : `${totalAwardValue}${awardAmountsStr}`;
    
    // Calculate consumption amounts (3x award value)
    const pendingValue = bankAwards
      .filter(award => !award.redeemed)
      .reduce((sum, award) => sum + (award.value * 3), 0);
    
    const redeemedValue = bankAwards
      .filter(award => award.redeemed)
      .reduce((sum, award) => sum + (award.value * 3), 0);

    return {
      bank,
      totalAwards,
      redeemedAwards,
      pendingAwards,
      totalAwardValue,
      awardDisplay,
      pendingValue,
      redeemedValue,
      status: totalAwards === 0 ? 'no-awards' :
              pendingAwards > 0 ? 'pending' : 'completed'
    };
  });

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'no-awards': return '❌';
      case 'pending': return '⏳';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'no-awards': return '❌尚未獲得獎品';
      case 'pending': return '⏳未消費';
      case 'completed': return '✅已消費';
      default: return '❓未知';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <span className="mr-2">🏦</span>
        銀行消費狀態快速預覽 (本周)
      </h2>

      {/* Mobile Simple List View */}
      <div className="block md:hidden">
        {/* Mobile Table Header */}
        <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              承辦單位
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-2">
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              消費金額
            </div>
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              狀態
            </div>
          </div>
        </div>
        
        {/* Mobile Table Rows */}
        <div className="space-y-2">
          {bankStatus.map((bank) => (
            <div key={bank.bank} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate" title={bank.bank}>
                  {bank.bank}
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-2">
                <span className="text-sm font-medium text-blue-600">
                  {bank.pendingValue + bank.redeemedValue} MOP
                </span>
                <span className="text-lg">
                  {getStatusEmoji(bank.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Status Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-2 font-medium">狀態說明:</div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="flex items-center">
              <span className="mr-1">❌</span>
              尚未獲得獎品
            </span>
            <span className="flex items-center">
              <span className="mr-1">⏳</span>
              未消費
            </span>
            <span className="flex items-center">
              <span className="mr-1">✅</span>
              已消費
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                承辦單位
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                獎品額度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                消費金額
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bankStatus.map((bank) => (
              <tr key={bank.bank} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {bank.bank}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-600">
                    {getStatusText(bank.status)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bank.awardDisplay}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-600">
                    {bank.pendingValue + bank.redeemedValue} MOP
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">
              {bankStatus.reduce((sum, b) => sum + b.pendingValue, 0)} MOP
            </div>
            <div className="text-sm text-blue-800">本周待消費金額</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-lg font-bold text-green-600">
              {bankStatus.reduce((sum, b) => sum + b.redeemedValue, 0)} MOP
            </div>
            <div className="text-sm text-green-800">本周已消費金額</div>
          </div>
        </div>
      </div>
    </div>
  );
}
