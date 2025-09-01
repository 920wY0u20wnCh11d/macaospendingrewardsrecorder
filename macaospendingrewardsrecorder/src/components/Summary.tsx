'use client';

import { Award } from '@/types/award';
import { isAwardExpired } from '@/utils/dateUtils';

interface SummaryProps {
  awards: Award[];
}

export default function Summary({ awards }: SummaryProps) {
  // Calculate statistics
  const totalAwards = awards.length;
  const pendingAwards = awards.filter(award => 
    award.status === 'pending' && !isAwardExpired(award.expiryDate)
  ).length;
  const claimedAwards = awards.filter(award => award.status === 'claimed').length;
  const expiredAwards = awards.filter(award => 
    isAwardExpired(award.expiryDate) || award.status === 'expired'
  ).length;

  const upcomingDraws = awards.filter(award => {
    const drawDate = new Date(award.drawDate);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return drawDate >= today && drawDate <= nextWeek && award.status === 'pending';
  }).length;

  const stats = [
    {
      label: 'Total Awards',
      value: totalAwards,
      color: 'bg-blue-100 text-blue-800',
      icon: '🎁'
    },
    {
      label: 'Pending',
      value: pendingAwards,
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    },
    {
      label: 'Claimed',
      value: claimedAwards,
      color: 'bg-green-100 text-green-800',
      icon: '✅'
    },
    {
      label: 'Expired',
      value: expiredAwards,
      color: 'bg-gray-100 text-gray-800',
      icon: '❌'
    },
    {
      label: 'Upcoming Draws',
      value: upcomingDraws,
      color: 'bg-purple-100 text-purple-800',
      icon: '📅'
    }
  ];

  const claimRate = totalAwards > 0 ? ((claimedAwards / totalAwards) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Summary & Statistics</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-lg p-4 text-center`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      {totalAwards > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Progress Overview</h3>
          
          <div className="space-y-4">
            {/* Claim Rate */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Claim Rate</span>
                <span>{claimRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${claimRate}%` }}
                ></div>
              </div>
            </div>

            {/* Pending vs Completed */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Completion Progress</span>
                <span>{totalAwards - pendingAwards} of {totalAwards}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalAwards > 0 ? ((totalAwards - pendingAwards) / totalAwards) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Active Awards</h4>
            <p className="text-sm text-blue-600">
              You have {pendingAwards} awards waiting to be claimed
              {upcomingDraws > 0 && ` with ${upcomingDraws} draws happening this week`}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Attention Needed</h4>
            <p className="text-sm text-orange-600">
              {expiredAwards > 0 
                ? `${expiredAwards} awards have expired and may need attention`
                : 'All awards are in good standing'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}