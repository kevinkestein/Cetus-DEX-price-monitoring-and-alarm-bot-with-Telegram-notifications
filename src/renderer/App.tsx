import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <MainContent activeTab={activeTab} onShowToast={showToast} />
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;