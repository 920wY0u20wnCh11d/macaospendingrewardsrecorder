'use client';

import { Award } from '@/types/award';
import { formatDate, isAwardExpired } from '@/utils/dateUtils';

interface AwardListProps {
  awards: Award[];
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Award['status']) => void;
}

export default function AwardList({ awards, onEdit, onDelete, onStatusChange }: AwardListProps) {
  if (awards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🎁</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Awards Yet</h3>
        <p className="text-gray-500">Start by adding your first lucky draw award above!</p>
      </div>
    );
  }

  const getStatusColor = (award: Award): string => {
    if (isAwardExpired(award.expiryDate)) {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
    
    switch (award.status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'claimed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'expired':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (award: Award): string => {
    if (isAwardExpired(award.expiryDate) && award.status !== 'expired') {
      return 'Expired';
    }
    return award.status.charAt(0).toUpperCase() + award.status.slice(1);
  };

  const handleStatusChange = (award: Award, newStatus: Award['status']) => {
    // Don't allow status changes for expired awards
    if (isAwardExpired(award.expiryDate)) {
      return;
    }
    onStatusChange(award.id, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Awards List ({awards.length})</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {awards.map((award) => {
          const expired = isAwardExpired(award.expiryDate);
          
          return (
            <div key={award.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{award.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(award)}`}>
                      {getStatusText(award)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{award.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                      <strong>Draw:</strong> {formatDate(award.drawDate)}
                    </span>
                    <span>
                      <strong>Expires:</strong> {formatDate(award.expiryDate)}
                      {expired && <span className="text-red-500 ml-1">(Expired)</span>}
                    </span>
                    <span>
                      <strong>Created:</strong> {formatDate(award.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                  {!expired && award.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(award, 'claimed')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      Mark Claimed
                    </button>
                  )}
                  
                  {!expired && award.status === 'claimed' && (
                    <button
                      onClick={() => handleStatusChange(award, 'pending')}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                    >
                      Mark Pending
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEdit(award)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(award.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}