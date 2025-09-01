'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, AwardValue, BANKS, Bank } from '../types/award';

interface AwardFormData {
  value: AwardValue;
  drawDate: string;
  expiryDate: string;
  redeemed: boolean;
  redeemedDate: string;
  merchant: string;
  notes: string;
  bank: Bank;
  isThankYou: boolean;
}

interface AwardFormProps {
  award?: Award;
  onSave: (awards: Omit<Award, 'id'>[]) => void;
  onCancel: () => void;
  existingAwards?: Award[]; // Add this to get existing merchants
}

export default function AwardForm({ award, onSave, onCancel, existingAwards = [] }: AwardFormProps) {
  const createEmptyAwardForm = (): AwardFormData => ({
    value: 10,
    drawDate: '',
    expiryDate: '',
    redeemed: false,
    redeemedDate: '',
    merchant: '',
    notes: '',
    bank: BANKS[0],
    isThankYou: false,
  });

  const createAwardFormWithToday = useCallback((inheritBank?: Bank): AwardFormData => {
    // Set default draw date to today
    const today = new Date();

    // If today is Saturday or Sunday, set to next Monday
    const defaultDate = new Date(today);
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) { // Sunday
      defaultDate.setDate(today.getDate() + 1); // Monday
    } else if (dayOfWeek === 6) { // Saturday
      defaultDate.setDate(today.getDate() + 2); // Monday
    }

    const defaultDateString = defaultDate.toISOString().split('T')[0];

    const form = createEmptyAwardForm();
    form.drawDate = defaultDateString;
    form.expiryDate = calculateExpiryDate(defaultDateString);
    
    // Inherit bank from previous form if provided
    if (inheritBank) {
      form.bank = inheritBank;
    }
    
    return form;
  }, []);

  const [awardForms, setAwardForms] = useState<AwardFormData[]>([createEmptyAwardForm()]);
  const [drawDateErrors, setDrawDateErrors] = useState<string[]>(['']);
  const [merchantSuggestions, setMerchantSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Get unique merchants from existing awards
  const getUniqueMerchants = useCallback(() => {
    const merchants = existingAwards
      .map(award => award.merchant)
      .filter((merchant): merchant is string => merchant !== undefined && merchant.trim() !== '')
      .filter((merchant, index, arr) => arr.indexOf(merchant) === index) // Remove duplicates
      .sort();
    return merchants;
  }, [existingAwards]);

  useEffect(() => {
    setMerchantSuggestions(getUniqueMerchants());
  }, [getUniqueMerchants]);

  const handleMerchantChange = (index: number, value: string) => {
    const newForms = [...awardForms];
    newForms[index] = {
      ...newForms[index],
      merchant: value,
    };
    setAwardForms(newForms);
    
    // Show suggestions if there's input and we have suggestions
    setShowSuggestions(value.length > 0 && merchantSuggestions.length > 0 ? index : null);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  const handleMerchantKeyDown = (index: number, e: React.KeyboardEvent) => {
    const suggestions = getFilteredSuggestions(awardForms[index].merchant);
    
    if (!showSuggestions || suggestions.length === 0) return;
    
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
          handleMerchantSuggestionSelect(index, suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(null);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleMerchantSuggestionSelect = (index: number, suggestion: string) => {
    const newForms = [...awardForms];
    newForms[index] = {
      ...newForms[index],
      merchant: suggestion,
    };
    setAwardForms(newForms);
    setShowSuggestions(null);
  };

  const getFilteredSuggestions = (input: string) => {
    if (!input) return [];
    return merchantSuggestions.filter(merchant =>
      merchant.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const calculateExpiryDate = (drawDate: string): string => {
    const date = new Date(drawDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // If draw date is Monday-Friday, expiry is the following Sunday
    // If draw date is Saturday, expiry is the next Sunday
    // If draw date is Sunday, expiry is the following Sunday
    let daysToAdd = 0;

    if (dayOfWeek === 0) { // Sunday
      daysToAdd = 7; // Next Sunday
    } else if (dayOfWeek === 6) { // Saturday
      daysToAdd = 1; // Next Sunday
    } else { // Monday-Friday
      daysToAdd = 7 - dayOfWeek; // Days until Sunday
    }

    const expiryDate = new Date(date);
    expiryDate.setDate(date.getDate() + daysToAdd);
    return expiryDate.toISOString().split('T')[0];
  };

  const validateDrawDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    // 0 = Sunday, 6 = Saturday - these are not allowed
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  useEffect(() => {
    if (award) {
      const awardForm: AwardFormData = {
        value: award.value as AwardValue,
        drawDate: award.drawDate.split('T')[0], // Convert to date input format
        expiryDate: award.expiryDate.split('T')[0],
        redeemed: award.redeemed,
        redeemedDate: award.redeemedDate ? award.redeemedDate.split('T')[0] : '',
        merchant: award.merchant || '',
        notes: award.notes || '',
        bank: (award.bank as Bank) || BANKS[0],
        isThankYou: award.isThankYou || false,
      };
      setAwardForms([awardForm]);
      setDrawDateErrors(['']);
    } else {
      const defaultForm = createAwardFormWithToday();
      setAwardForms([defaultForm]);
      setDrawDateErrors(['']);
    }
  }, [award, createAwardFormWithToday]);

  const handleDrawDateChange = (index: number, newDrawDate: string) => {
    const isValid = validateDrawDate(newDrawDate);
    const newErrors = [...drawDateErrors];
    newErrors[index] = isValid ? '' : '抽獎日期不能是星期六或星期日';

    setDrawDateErrors(newErrors);

    const newExpiryDate = calculateExpiryDate(newDrawDate);
    const newForms = [...awardForms];
    newForms[index] = {
      ...newForms[index],
      drawDate: newDrawDate,
      expiryDate: newExpiryDate,
    };
    setAwardForms(newForms);
  };

  const handleValueChange = (index: number, value: AwardValue) => {
    const newForms = [...awardForms];
    newForms[index] = {
      ...newForms[index],
      value,
      isThankYou: value === 0,
    };
    setAwardForms(newForms);
  };

  const handleFormChange = (index: number, field: keyof AwardFormData, value: string | boolean | Bank) => {
    const newForms = [...awardForms];
    newForms[index] = {
      ...newForms[index],
      [field]: value,
    };
    setAwardForms(newForms);
  };

  const addAwardForm = () => {
    // Get the bank from the last form to inherit
    const lastForm = awardForms[awardForms.length - 1];
    const inheritBank = lastForm ? lastForm.bank : undefined;
    
    setAwardForms([...awardForms, createAwardFormWithToday(inheritBank)]);
    setDrawDateErrors([...drawDateErrors, '']);
  };

  const removeAwardForm = (index: number) => {
    if (awardForms.length > 1) {
      const newForms = awardForms.filter((_, i) => i !== index);
      const newErrors = drawDateErrors.filter((_, i) => i !== index);
      setAwardForms(newForms);
      setDrawDateErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (drawDateErrors.some(error => error)) {
      alert('請修正日期錯誤後再提交');
      return;
    }

    const awardsData: Omit<Award, 'id'>[] = awardForms.map(form => ({
      value: form.value,
      drawDate: new Date(form.drawDate).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),
      redeemed: form.redeemed,
      redeemedDate: form.redeemed && form.redeemedDate
        ? new Date(form.redeemedDate).toISOString()
        : undefined,
      merchant: form.merchant || undefined,
      notes: form.notes || undefined,
      bank: form.bank,
      isThankYou: form.isThankYou,
    }));

    onSave(awardsData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {award ? '編輯獎品' : '新增獎品'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {awardForms.map((formData, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                獎品 {index + 1}
                {formData.isThankYou && (
                  <span className="ml-2 text-orange-600 font-normal">(謝謝惠顧)</span>
                )}
              </h3>
              {awardForms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAwardForm(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  移除
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  獎品面值 (MOP)
                </label>
                <select
                  value={formData.value}
                  onChange={(e) => handleValueChange(index, parseInt(e.target.value) as AwardValue)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>謝謝惠顧</option>
                  <option value={10}>10 MOP</option>
                  <option value={20}>20 MOP</option>
                  <option value={50}>50 MOP</option>
                  <option value={100}>100 MOP</option>
                  <option value={200}>200 MOP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  承辦單位
                </label>
                <select
                  value={formData.bank}
                  onChange={(e) => handleFormChange(index, 'bank', e.target.value as Bank)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  抽獎日期
                </label>
                <input
                  type="date"
                  value={formData.drawDate}
                  onChange={(e) => handleDrawDateChange(index, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    drawDateErrors[index] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {drawDateErrors[index] && (
                  <p className="text-red-500 text-sm mt-1">{drawDateErrors[index]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到期日期
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  title="到期日期根據抽獎日期自動計算"
                />
                <p className="text-gray-500 text-xs mt-1">根據抽獎日期自動計算</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商戶名稱
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => handleMerchantChange(index, e.target.value)}
                    onKeyDown={(e) => handleMerchantKeyDown(index, e)}
                    onFocus={() => {
                      if (formData.merchant && merchantSuggestions.length > 0) {
                        setShowSuggestions(index);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click on suggestion
                      setTimeout(() => {
                        setShowSuggestions(null);
                        setSelectedSuggestionIndex(-1);
                      }, 200);
                    }}
                    placeholder="可選"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {merchantSuggestions.length > 0 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      💡
                    </div>
                  )}
                </div>
                
                {/* Merchant Suggestions Dropdown */}
                {showSuggestions === index && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {getFilteredSuggestions(formData.merchant).length > 0 ? (
                      getFilteredSuggestions(formData.merchant).map((suggestion, suggestionIndex) => (
                        <div
                          key={suggestionIndex}
                          onClick={() => handleMerchantSuggestionSelect(index, suggestion)}
                          className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                            suggestionIndex === selectedSuggestionIndex
                              ? 'bg-blue-100 text-blue-900'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {suggestion}
                        </div>
                      ))
                    ) : formData.merchant && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        無匹配的商戶建議
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleFormChange(index, 'notes', e.target.value)}
                  placeholder="可選"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id={`redeemed-${index}`}
                checked={formData.redeemed}
                onChange={(e) => handleFormChange(index, 'redeemed', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`redeemed-${index}`} className="text-sm font-medium text-gray-700">
                已兌換
              </label>
            </div>

            {formData.redeemed && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  兌換日期
                </label>
                <input
                  type="date"
                  value={formData.redeemedDate}
                  onChange={(e) => handleFormChange(index, 'redeemedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.redeemed}
                />
              </div>
            )}
          </div>
        ))}

        {awardForms.length >= 1 && !award && (
          <div className="text-center">
            <button
              type="button"
              onClick={addAwardForm}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              + 添加另一個獎品
            </button>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={drawDateErrors.some(error => error)}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              drawDateErrors.some(error => error)
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {award ? '更新' : `新增 ${awardForms.length} 個獎品`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
