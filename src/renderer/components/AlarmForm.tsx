import React, { useState } from 'react';

interface AlarmFormData {
  name: string;
  pair: string;
  customPair: string;
  alarmType: 'PERCENTAGE' | 'ABSOLUTE';
  condition: 'ABOVE' | 'BELOW';
  value: string;
}

interface AlarmFormProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onAlarmCreated: () => void;
}

const AlarmForm: React.FC<AlarmFormProps> = ({ onShowToast, onAlarmCreated }) => {
  const [formData, setFormData] = useState<AlarmFormData>({
    name: '',
    pair: 'SUI/USDC',
    customPair: '',
    alarmType: 'PERCENTAGE',
    condition: 'ABOVE',
    value: ''
  });

  const [loading, setLoading] = useState(false);
  const [showCustomPair, setShowCustomPair] = useState(false);
  const [errors, setErrors] = useState<Partial<AlarmFormData>>({});

  const popularPairs = [
    'SUI/USDC',
    'ETH/USDC', 
    'BTC/USDC',
    'SOL/USDC',
    'Custom'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<AlarmFormData> = {};

    // Name validation
    if (formData.name.trim() === '') {
      newErrors.name = 'Alarm name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Alarm name must be at least 3 characters';
    }

    // Pair validation
    const selectedPair = showCustomPair ? formData.customPair : formData.pair;
    if (showCustomPair && formData.customPair.trim() === '') {
      newErrors.customPair = 'Custom pair is required';
    } else if (showCustomPair && !formData.customPair.match(/^[A-Z]+\/[A-Z]+$/)) {
      newErrors.customPair = 'Pair format should be like BTC/USDC';
    }

    // Value validation
    if (formData.value.trim() === '') {
      newErrors.value = 'Value is required';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.value = 'Value must be a positive number';
      } else if (formData.alarmType === 'PERCENTAGE' && numValue > 100) {
        newErrors.value = 'Percentage cannot exceed 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const selectedPair = showCustomPair ? formData.customPair : formData.pair;
      const alarmData = {
        name: formData.name.trim(),
        pair: selectedPair,
        alarmType: formData.alarmType,
        condition: formData.condition,
        value: parseFloat(formData.value),
        basePrice: formData.alarmType === 'PERCENTAGE' ? 0 : null // Will be set when price monitoring starts
      };

      const result = await (window as any).electronAPI.database.createAlarm(alarmData);
      
      if (result.success) {
        onShowToast('Alarm created successfully', 'success');
        // Reset form
        setFormData({
          name: '',
          pair: 'SUI/USDC',
          customPair: '',
          alarmType: 'PERCENTAGE',
          condition: 'ABOVE',
          value: ''
        });
        setShowCustomPair(false);
        onAlarmCreated();
      } else {
        throw new Error(result.error || 'Failed to create alarm');
      }
    } catch (error) {
      console.error('Error creating alarm:', error);
      onShowToast('Failed to create alarm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AlarmFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePairChange = (value: string) => {
    if (value === 'Custom') {
      setShowCustomPair(true);
      setFormData(prev => ({ ...prev, pair: '', customPair: '' }));
    } else {
      setShowCustomPair(false);
      setFormData(prev => ({ ...prev, pair: value, customPair: '' }));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Create New Alarm</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alarm Name */}
        <div>
          <label htmlFor="alarmName" className="block text-sm font-medium text-gray-300 mb-2">
            Alarm Name
          </label>
          <input
            type="text"
            id="alarmName"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="e.g., SUI Price Alert"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Trading Pair */}
        <div>
          <label htmlFor="tradingPair" className="block text-sm font-medium text-gray-300 mb-2">
            Trading Pair
          </label>
          <select
            id="tradingPair"
            value={showCustomPair ? 'Custom' : formData.pair}
            onChange={(e) => handlePairChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {popularPairs.map(pair => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Pair Input */}
        {showCustomPair && (
          <div>
            <label htmlFor="customPair" className="block text-sm font-medium text-gray-300 mb-2">
              Custom Trading Pair
            </label>
            <input
              type="text"
              id="customPair"
              value={formData.customPair}
              onChange={(e) => handleInputChange('customPair', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customPair ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="e.g., DOT/USDC"
            />
            {errors.customPair && (
              <p className="mt-1 text-sm text-red-400">{errors.customPair}</p>
            )}
          </div>
        )}

        {/* Alarm Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Alarm Type
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="alarmType"
                value="PERCENTAGE"
                checked={formData.alarmType === 'PERCENTAGE'}
                onChange={(e) => handleInputChange('alarmType', e.target.value as 'PERCENTAGE')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">Percentage Change</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="alarmType"
                value="ABSOLUTE"
                checked={formData.alarmType === 'ABSOLUTE'}
                onChange={(e) => handleInputChange('alarmType', e.target.value as 'ABSOLUTE')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">Absolute Price</span>
            </label>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Condition
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="condition"
                value="ABOVE"
                checked={formData.condition === 'ABOVE'}
                onChange={(e) => handleInputChange('condition', e.target.value as 'ABOVE')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">Above</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="condition"
                value="BELOW"
                checked={formData.condition === 'BELOW'}
                onChange={(e) => handleInputChange('condition', e.target.value as 'BELOW')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-300">Below</span>
            </label>
          </div>
        </div>

        {/* Value */}
        <div>
          <label htmlFor="alarmValue" className="block text-sm font-medium text-gray-300 mb-2">
            {formData.alarmType === 'PERCENTAGE' ? 'Percentage (%)' : 'Price (USDC)'}
          </label>
          <div className="relative">
            <input
              type="number"
              id="alarmValue"
              step="0.01"
              min="0"
              max={formData.alarmType === 'PERCENTAGE' ? "100" : undefined}
              value={formData.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.value ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder={formData.alarmType === 'PERCENTAGE' ? '5.0' : '1.50'}
            />
            <span className="absolute right-3 top-2 text-gray-400">
              {formData.alarmType === 'PERCENTAGE' ? '%' : '$'}
            </span>
          </div>
          {errors.value && (
            <p className="mt-1 text-sm text-red-400">{errors.value}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.alarmType === 'PERCENTAGE' 
              ? 'Trigger when price changes by this percentage'
              : 'Trigger when price reaches this absolute value'
            }
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Alarm...</span>
            </>
          ) : (
            <>
              <span>🔔</span>
              <span>Create Alarm</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AlarmForm;