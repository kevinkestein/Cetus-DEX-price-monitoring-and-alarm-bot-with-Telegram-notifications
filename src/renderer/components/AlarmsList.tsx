import React, { useState, useEffect } from 'react';

interface Alarm {
  id: string;
  name: string;
  pair: string;
  alarmType: 'PERCENTAGE' | 'ABSOLUTE';
  condition: 'ABOVE' | 'BELOW';
  value: number;
  basePrice?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlarmsListProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
  refreshTrigger: number;
}

const AlarmsList: React.FC<AlarmsListProps> = ({ onShowToast, refreshTrigger }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadAlarms();
  }, [refreshTrigger]);

  const loadAlarms = async () => {
    try {
      setLoading(true);
      const result = await (window as any).electronAPI.database.getAlarms();
      
      if (result.success) {
        setAlarms(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load alarms');
      }
    } catch (error) {
      console.error('Error loading alarms:', error);
      onShowToast('Failed to load alarms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlarm = async (id: string) => {
    try {
      setTogglingId(id);
      const result = await (window as any).electronAPI.database.updateAlarm(id, {
        isActive: !alarms.find(a => a.id === id)?.isActive
      });
      
      if (result.success) {
        setAlarms(prev => prev.map(alarm => 
          alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
        ));
        onShowToast(
          `Alarm ${result.data.isActive ? 'activated' : 'deactivated'}`, 
          'success'
        );
      } else {
        throw new Error(result.error || 'Failed to toggle alarm');
      }
    } catch (error) {
      console.error('Error toggling alarm:', error);
      onShowToast('Failed to toggle alarm', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteAlarm = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the alarm "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const result = await (window as any).electronAPI.database.deleteAlarm(id);
      
      if (result.success) {
        setAlarms(prev => prev.filter(alarm => alarm.id !== id));
        onShowToast('Alarm deleted successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to delete alarm');
      }
    } catch (error) {
      console.error('Error deleting alarm:', error);
      onShowToast('Failed to delete alarm', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatValue = (alarm: Alarm) => {
    if (alarm.alarmType === 'PERCENTAGE') {
      return `${alarm.value}%`;
    } else {
      return `$${alarm.value.toFixed(2)}`;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-900 text-green-300 border border-green-700' 
          : 'bg-gray-900 text-gray-400 border border-gray-700'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getConditionDisplay = (condition: 'ABOVE' | 'BELOW') => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        condition === 'ABOVE' 
          ? 'bg-red-900 text-red-300' 
          : 'bg-blue-900 text-blue-300'
      }`}>
        {condition === 'ABOVE' ? '↗ Above' : '↙ Below'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Your Alarms</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading alarms...</div>
        </div>
      </div>
    );
  }

  if (alarms.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Your Alarms</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">No alarms created yet</h4>
          <p className="text-gray-500">Create your first price alarm to get started with monitoring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Your Alarms</h3>
        <span className="text-sm text-gray-400">
          {alarms.filter(a => a.isActive).length} of {alarms.length} active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-300">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300">Pair</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300">Condition</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300">Value</th>
              <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr key={alarm.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="py-3 px-4">
                  <div className="text-white font-medium">{alarm.name}</div>
                  <div className="text-xs text-gray-400">
                    Created {new Date(alarm.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-300">
                    {alarm.pair}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-300 text-sm">
                    {alarm.alarmType === 'PERCENTAGE' ? 'Percentage' : 'Absolute'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {getConditionDisplay(alarm.condition)}
                </td>
                <td className="py-3 px-4">
                  <span className="text-white font-mono">
                    {formatValue(alarm)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {getStatusBadge(alarm.isActive)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleAlarm(alarm.id)}
                      disabled={togglingId === alarm.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 ${
                        alarm.isActive ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                      title={alarm.isActive ? 'Deactivate alarm' : 'Activate alarm'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          alarm.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id, alarm.name)}
                      disabled={deletingId === alarm.id}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete alarm"
                    >
                      {deletingId === alarm.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlarmsList;