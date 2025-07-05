import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Logo placeholder */}
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Cetus Alarm Bot</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Future status indicators or user menu */}
          <div className="text-sm text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Connected
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;