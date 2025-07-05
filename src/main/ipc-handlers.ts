import { ipcMain } from 'electron';
import { alarmService, settingsService, alarmHistoryService } from './database';
import { AlarmType, AlarmCondition } from '../generated/prisma';

export function setupIpcHandlers() {
  // Database test connection
  ipcMain.handle('db:test-connection', async () => {
    try {
      const settings = await settingsService.getSettings();
      return { success: true, connected: true };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Settings handlers
  ipcMain.handle('db:get-settings', async () => {
    try {
      const settings = await settingsService.getSettings();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:update-settings', async (_, settingsData) => {
    try {
      const settings = await settingsService.updateSettings(settingsData);
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Alarm handlers
  ipcMain.handle('db:get-alarms', async () => {
    try {
      const alarms = await alarmService.getAllAlarms();
      return { success: true, data: alarms };
    } catch (error) {
      console.error('Error getting alarms:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:create-alarm', async (_, alarmData) => {
    try {
      const alarm = await alarmService.createAlarm({
        name: alarmData.name,
        pair: alarmData.pair,
        alarmType: alarmData.alarmType as AlarmType,
        condition: alarmData.condition as AlarmCondition,
        value: alarmData.value,
        basePrice: alarmData.basePrice
      });
      return { success: true, data: alarm };
    } catch (error) {
      console.error('Error creating alarm:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:update-alarm', async (_, id, alarmData) => {
    try {
      const alarm = await alarmService.updateAlarm(id, alarmData);
      return { success: true, data: alarm };
    } catch (error) {
      console.error('Error updating alarm:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:delete-alarm', async (_, id) => {
    try {
      await alarmService.deleteAlarm(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting alarm:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('db:toggle-alarm', async (_, id) => {
    try {
      const alarm = await alarmService.toggleAlarm(id);
      return { success: true, data: alarm };
    } catch (error) {
      console.error('Error toggling alarm:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Alarm history handlers
  ipcMain.handle('db:get-alarm-history', async (_, alarmId, limit) => {
    try {
      const history = alarmId 
        ? await alarmHistoryService.getAlarmHistory(alarmId, limit)
        : await alarmHistoryService.getAllHistory(limit);
      return { success: true, data: history };
    } catch (error) {
      console.error('Error getting alarm history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  console.log('IPC handlers set up successfully');
}