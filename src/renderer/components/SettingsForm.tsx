import React, { useState, useEffect } from 'react';

interface SettingsData {
  telegramBotToken: string;
  telegramChatId: string;
  checkInterval: number;
  notificationsEnabled: boolean;
}

interface SettingsFormProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onShowToast }) => {
  const [formData, setFormData] = useState<SettingsData>({
    telegramBotToken: '',
    telegramChatId: '',
    checkInterval: 60,
    notificationsEnabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [testingNotification, setTestingNotification] = useState(false);
  const [errors, setErrors] = useState<Partial<SettingsData>>({});

  const checkIntervalOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const result = await (window as any).electronAPI.database.getSettings();
      
      if (result.success && result.data) {
        const settings = result.data;
        setFormData({
          telegramBotToken: settings.telegramBotToken || '',
          telegramChatId: settings.telegramChatId || '',
          checkInterval: settings.checkInterval || 60,
          notificationsEnabled: settings.notificationsEnabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      onShowToast('Failed to load settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SettingsData> = {};

    if (formData.telegramBotToken.trim() === '') {
      newErrors.telegramBotToken = 'Telegram Bot Token is required';
    } else if (!formData.telegramBotToken.match(/^\d{8,10}:[a-zA-Z0-9_-]{35}$/)) {
      newErrors.telegramBotToken = 'Invalid bot token format';
    }

    if (formData.telegramChatId.trim() === '') {
      newErrors.telegramChatId = 'Telegram Chat ID is required';
    } else if (!formData.telegramChatId.match(/^-?\d+$/)) {
      newErrors.telegramChatId = 'Chat ID must be a number';
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
      
      const result = await (window as any).electronAPI.database.updateSettings({
        telegramBotToken: formData.telegramBotToken,
        telegramChatId: formData.telegramChatId,
        checkInterval: formData.checkInterval,
        notificationsEnabled: formData.notificationsEnabled
      });
      
      if (result.success) {
        onShowToast('Settings saved successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      onShowToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!validateForm()) {
      onShowToast('Please fix validation errors before testing', 'error');
      return;
    }

    try {
      setTestingNotification(true);
      
      // This will be connected to Telegram API later
      // await window.electronAPI.telegram.sendTestMessage({
      //   botToken: formData.telegramBotToken,
      //   chatId: formData.telegramChatId
      // });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onShowToast('Test notification sent successfully', 'success');
    } catch (error) {
      console.error('Error sending test notification:', error);
      onShowToast('Failed to send test notification', 'error');
    } finally {
      setTestingNotification(false);
    }
  };

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
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

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Telegram Bot Token */}
        <div>
          <label htmlFor="botToken" className="block text-sm font-medium text-gray-300 mb-2">
            Telegram Bot Token
          </label>
          <input
            type="password"
            id="botToken"
            value={formData.telegramBotToken}
            onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.telegramBotToken ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
          />
          {errors.telegramBotToken && (
            <p className="mt-1 text-sm text-red-400">{errors.telegramBotToken}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Get your bot token from @BotFather on Telegram
          </p>
        </div>

        {/* Telegram Chat ID */}
        <div>
          <label htmlFor="chatId" className="block text-sm font-medium text-gray-300 mb-2">
            Telegram Chat ID
          </label>
          <input
            type="text"
            id="chatId"
            value={formData.telegramChatId}
            onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.telegramChatId ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="-1001234567890"
          />
          {errors.telegramChatId && (
            <p className="mt-1 text-sm text-red-400">{errors.telegramChatId}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use @userinfobot to get your chat ID or group chat ID
          </p>
        </div>

        {/* Check Interval */}
        <div>
          <label htmlFor="checkInterval" className="block text-sm font-medium text-gray-300 mb-2">
            Price Check Interval
          </label>
          <select
            id="checkInterval"
            value={formData.checkInterval}
            onChange={(e) => handleInputChange('checkInterval', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {checkIntervalOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            How often to check prices for alarm conditions
          </p>
        </div>

        {/* Notifications Enabled Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notificationsEnabled" className="block text-sm font-medium text-gray-300">
                Enable Notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Turn on/off all Telegram notifications
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('notificationsEnabled', !formData.notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                formData.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testingNotification || loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {testingNotification ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <span>🔔</span>
                <span>Test Notification</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={loading || testingNotification}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;