'use client';

import { useState, useEffect } from 'react';
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
}

export default function AwardForm({ award, onSave, onCancel }: AwardFormProps) {
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

  const [awardForms, setAwardForms] = useState<AwardFormData[]>([createEmptyAwardForm()]);
  const [drawDateErrors, setDrawDateErrors] = useState<string[]>(['']);

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
      // Set default draw date to today
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];

      const defaultForm = createEmptyAwardForm();
      defaultForm.drawDate = todayString;
      defaultForm.expiryDate = calculateExpiryDate(todayString);

      setAwardForms([defaultForm]);
      setDrawDateErrors(['']);
    }
  }, [award]);

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
    if (awardForms.length < 3) {
      setAwardForms([...awardForms, createEmptyAwardForm()]);
      setDrawDateErrors([...drawDateErrors, '']);
    }
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商戶名稱
                </label>
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => handleFormChange(index, 'merchant', e.target.value)}
                  placeholder="可選"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

        {awardForms.length < 3 && !award && (
          <div className="text-center">
            <button
              type="button"
              onClick={addAwardForm}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              + 添加另一個獎品
            </button>
            <p className="text-sm text-gray-500 mt-2">最多可以添加 3 個獎品</p>
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
