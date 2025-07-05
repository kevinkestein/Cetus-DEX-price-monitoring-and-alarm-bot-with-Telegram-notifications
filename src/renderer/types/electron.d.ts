interface ElectronAPI {
  platform: string;
  database: {
    testConnection: () => Promise<{ success: boolean; connected?: boolean; error?: string }>;
    getAlarms: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
    createAlarm: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    updateAlarm: (id: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
    deleteAlarm: (id: string) => Promise<{ success: boolean; error?: string }>;
    getSettings: () => Promise<{ success: boolean; data?: any; error?: string }>;
    updateSettings: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}