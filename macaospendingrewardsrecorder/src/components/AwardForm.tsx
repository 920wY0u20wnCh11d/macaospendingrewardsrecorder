'use client';

import { useState } from 'react';
import { Award, AwardFormData } from '@/types/award';
import { validateDrawDate, calculateExpiryDate, generateId } from '@/utils/dateUtils';

interface AwardFormProps {
  onSubmit: (award: Award) => void;
  editingAward?: Award | null;
  onCancel?: () => void;
}

export default function AwardForm({ onSubmit, editingAward, onCancel }: AwardFormProps) {
  const [formData, setFormData] = useState<AwardFormData>({
    name: editingAward?.name || '',
    description: editingAward?.description || '',
    drawDate: editingAward?.drawDate || ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Award name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Award description is required';
    }

    if (!formData.drawDate) {
      newErrors.drawDate = 'Draw date is required';
    } else {
      const dateValidation = validateDrawDate(formData.drawDate);
      if (!dateValidation.isValid) {
        newErrors.drawDate = dateValidation.error || 'Invalid draw date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const expiryDate = calculateExpiryDate(formData.drawDate);

    const award: Award = {
      id: editingAward?.id || generateId(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      drawDate: formData.drawDate,
      expiryDate,
      status: editingAward?.status || 'pending',
      createdAt: editingAward?.createdAt || now,
      updatedAt: now
    };

    onSubmit(award);
    
    if (!editingAward) {
      // Reset form for new awards
      setFormData({ name: '', description: '', drawDate: '' });
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof AwardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editingAward ? 'Edit Award' : 'Add New Award'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Award Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter award name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter award description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="drawDate" className="block text-sm font-medium text-gray-700 mb-1">
            Draw Date *
          </label>
          <input
            type="date"
            id="drawDate"
            value={formData.drawDate}
            onChange={(e) => handleInputChange('drawDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.drawDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.drawDate && <p className="text-red-500 text-sm mt-1">{errors.drawDate}</p>}
          <p className="text-gray-500 text-sm mt-1">
            Note: Draw date cannot be on weekends and expiry will be automatically set to 30 days after draw date.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : editingAward ? 'Update Award' : 'Add Award'}
          </button>
          
          {editingAward && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}