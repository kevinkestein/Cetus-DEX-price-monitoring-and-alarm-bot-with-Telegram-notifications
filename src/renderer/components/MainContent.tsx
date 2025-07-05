import React from 'react';
import SettingsForm from './SettingsForm';
import AlarmsPage from './AlarmsPage';

interface MainContentProps {
  activeTab: string;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab, onShowToast }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Dashboard</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300">Price monitoring dashboard will be displayed here.</p>
            </div>
          </div>
        );
      case 'alarms':
        return <AlarmsPage onShowToast={onShowToast} />;
      case 'settings':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <SettingsForm onShowToast={onShowToast} />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to Cetus Alarm Bot</h1>
              <p className="text-xl text-gray-400">Monitor Cetus DEX prices and get notified on Telegram</p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      {renderContent()}
    </main>
  );
};

export default MainContent;