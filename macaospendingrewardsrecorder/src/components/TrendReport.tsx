'use client';

import { useMemo } from 'react';
import { Award } from '../types/award';

interface TrendReportProps {
  awards: Award[];
}

interface WeeklyData {
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
  awardsObtained: Award[];
  awardsRedeemed: Award[];
  totalAwardValue: number;
  totalSpentValue: number;
  merchantBreakdown: { [merchant: string]: { obtained: number; spent: number; count: number } };
}

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

// Simple SVG-based trend chart component
function TrendChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        暫無數據
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;

  const points = data.map((point, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
    const y = chartHeight - padding - (point.value / maxValue) * (chartHeight - 2 * padding);
    return { x, y, ...point };
  });

  const pathData = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* X and Y axes */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#6b7280" strokeWidth="1" />
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#6b7280" strokeWidth="1" />

        {/* Trend line */}
        <path d={pathData} fill="none" stroke={data[0]?.color || '#3B82F6'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={point.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.x}
            y={chartHeight - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
            transform={`rotate(-45 ${point.x} ${chartHeight - 10})`}
          >
            {point.label}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const value = Math.round(maxValue * ratio);
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <text
              key={ratio}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
            >
              {value}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function TrendReport({ awards }: TrendReportProps) {
  const weeklyData = useMemo(() => {
    // Get all unique weeks from awards
    const weeks = new Map<string, WeeklyData>();

    awards.forEach(award => {
      const drawDate = new Date(award.drawDate);
      const weekStart = getWeekStart(drawDate);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks.has(weekKey)) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        weeks.set(weekKey, {
          weekStart,
          weekEnd,
          weekLabel: `${weekStart.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}-${weekEnd.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}`,
          awardsObtained: [],
          awardsRedeemed: [],
          totalAwardValue: 0,
          totalSpentValue: 0,
          merchantBreakdown: {}
        });
      }

      const weekData = weeks.get(weekKey)!;
      weekData.awardsObtained.push(award);
      weekData.totalAwardValue += award.value;

      // Track merchant data
      const merchant = award.merchant || '未指定商戶';
      if (!weekData.merchantBreakdown[merchant]) {
        weekData.merchantBreakdown[merchant] = { obtained: 0, spent: 0, count: 0 };
      }
      weekData.merchantBreakdown[merchant].obtained += award.value;
      weekData.merchantBreakdown[merchant].count += 1;

      // Track redeemed awards
      if (award.redeemed) {
        weekData.awardsRedeemed.push(award);
        weekData.totalSpentValue += award.value * 3; // 3x consumption multiplier
        weekData.merchantBreakdown[merchant].spent += award.value * 3;
      }
    });

    // Sort weeks chronologically
    return Array.from(weeks.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }, [awards]);

  // Get all unique merchants
  const allMerchants = useMemo(() => {
    const merchants = new Set<string>();
    awards.forEach(award => {
      merchants.add(award.merchant || '未指定商戶');
    });
    return Array.from(merchants).sort();
  }, [awards]);

  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">趨勢分析報告</h2>
        <p className="text-gray-600">按週統計的獎品獲得和消費趨勢</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Award Obtainment Trend */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">獎品獲得趨勢</h3>
            <div className="h-64">
              <TrendChart
                data={weeklyData.map(week => ({
                  label: week.weekLabel,
                  value: week.awardsObtained.length,
                  color: '#3B82F6'
                }))}
              />
            </div>
          </div>

          {/* Spending Trend */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">消費金額趨勢</h3>
            <div className="h-64">
              <TrendChart
                data={weeklyData.map(week => ({
                  label: week.weekLabel,
                  value: week.totalSpentValue,
                  color: '#10B981'
                }))}
              />
            </div>
          </div>
        </div>
        {/* Weekly Overview Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">週度趨勢總覽</h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      週期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      獲得獎品
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      已兌換
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      獎品總值
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      消費總額
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weeklyData.map((week, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {week.weekLabel}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {week.awardsObtained.length} 個
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {week.awardsRedeemed.length} 個
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                        {week.totalAwardValue} MOP
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {week.totalSpentValue} MOP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Merchant Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">商戶消費分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMerchants.map(merchant => {
              const merchantStats = weeklyData.reduce((acc, week) => {
                const merchantData = week.merchantBreakdown[merchant];
                if (merchantData) {
                  acc.totalObtained += merchantData.obtained;
                  acc.totalSpent += merchantData.spent;
                  acc.totalCount += merchantData.count;
                }
                return acc;
              }, { totalObtained: 0, totalSpent: 0, totalCount: 0 });

              return (
                <div key={merchant} className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">{merchant}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">獎品數量:</span>
                      <span className="font-medium text-gray-600">{merchantStats.totalCount} 個</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">獲得總值:</span>
                      <span className="font-medium text-blue-600">{merchantStats.totalObtained} MOP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">消費總額:</span>
                      <span className="font-medium text-green-600">{merchantStats.totalSpent} MOP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Merchant Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">週度商戶詳情</h3>
          <div className="space-y-6">
            {weeklyData.map((week, weekIndex) => (
              <div key={weekIndex} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{week.weekLabel}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(week.merchantBreakdown).map(([merchant, data]) => (
                    <div key={merchant} className="bg-white p-3 rounded border">
                      <div className="font-medium text-gray-900 mb-1">{merchant}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>獎品: {data.count} 個</div>
                        <div>獲得: {data.obtained} MOP</div>
                        <div>消費: {data.spent} MOP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">總結統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {awards.length}
              </div>
              <div className="text-sm text-gray-600">總獎品數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {awards.filter(a => a.redeemed).length}
              </div>
              <div className="text-sm text-gray-600">已兌換數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {awards.reduce((sum, a) => sum + a.value, 0)} MOP
              </div>
              <div className="text-sm text-gray-600">獎品總值</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {awards.filter(a => a.redeemed).reduce((sum, a) => sum + (a.value * 3), 0)} MOP
              </div>
              <div className="text-sm text-gray-600">消費總額</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get the Monday of the week containing the given date
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate days to subtract to get to Monday
  const daysToSubtract = day === 0 ? 6 : day - 1;

  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);

  return d;
}
