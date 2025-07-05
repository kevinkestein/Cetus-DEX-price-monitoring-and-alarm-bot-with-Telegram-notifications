import React, { useState } from 'react';
import AlarmForm from './AlarmForm';
import AlarmsList from './AlarmsList';

interface AlarmsPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const AlarmsPage: React.FC<AlarmsPageProps> = ({ onShowToast }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAlarmCreated = () => {
    // Trigger refresh of the alarms list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Price Alarms</h2>
        <p className="text-gray-400">
          Monitor cryptocurrency prices and get notified when conditions are met
        </p>
      </div>

      {/* Create New Alarm Form */}
      <AlarmForm 
        onShowToast={onShowToast} 
        onAlarmCreated={handleAlarmCreated}
      />

      {/* Alarms List */}
      <AlarmsList 
        onShowToast={onShowToast}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default AlarmsPage;