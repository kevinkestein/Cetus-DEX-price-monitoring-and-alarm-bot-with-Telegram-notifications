import { db } from './client';
import { Alarm, AlarmHistory, Settings, AlarmType, AlarmCondition } from '../../generated/prisma';

export class AlarmService {
  async createAlarm(data: {
    name: string;
    pair: string;
    alarmType: AlarmType;
    condition: AlarmCondition;
    value: number;
    basePrice?: number;
  }): Promise<Alarm> {
    return await db.alarm.create({
      data: {
        ...data,
        basePrice: data.basePrice || null
      }
    });
  }

  async getAllAlarms(): Promise<Alarm[]> {
    return await db.alarm.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getActiveAlarms(): Promise<Alarm[]> {
    return await db.alarm.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateAlarm(id: string, data: Partial<Alarm>): Promise<Alarm> {
    return await db.alarm.update({
      where: { id },
      data
    });
  }

  async deleteAlarm(id: string): Promise<void> {
    await db.alarm.delete({
      where: { id }
    });
  }

  async toggleAlarm(id: string): Promise<Alarm> {
    const alarm = await db.alarm.findUnique({ where: { id } });
    if (!alarm) throw new Error('Alarm not found');
    
    return await db.alarm.update({
      where: { id },
      data: { isActive: !alarm.isActive }
    });
  }
}

export class AlarmHistoryService {
  async createHistoryEntry(data: {
    alarmId: string;
    currentPrice: number;
    previousPrice?: number;
    message: string;
  }): Promise<AlarmHistory> {
    return await db.alarmHistory.create({
      data: {
        ...data,
        previousPrice: data.previousPrice || null
      }
    });
  }

  async getAlarmHistory(alarmId: string, limit = 100): Promise<AlarmHistory[]> {
    return await db.alarmHistory.findMany({
      where: { alarmId },
      orderBy: { triggeredAt: 'desc' },
      take: limit
    });
  }

  async getAllHistory(limit = 100): Promise<AlarmHistory[]> {
    return await db.alarmHistory.findMany({
      include: {
        alarm: {
          select: {
            name: true,
            pair: true
          }
        }
      },
      orderBy: { triggeredAt: 'desc' },
      take: limit
    });
  }
}

export class SettingsService {
  async getSettings(): Promise<Settings | null> {
    const settings = await db.settings.findFirst();
    return settings;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      return await db.settings.update({
        where: { id: existingSettings.id },
        data
      });
    } else {
      return await db.settings.create({
        data: data as any
      });
    }
  }

  async initializeDefaultSettings(): Promise<Settings> {
    const existingSettings = await this.getSettings();
    if (existingSettings) {
      return existingSettings;
    }

    return await db.settings.create({
      data: {
        checkInterval: 60,
        notificationsEnabled: true
      }
    });
  }
}

// Service instances
export const alarmService = new AlarmService();
export const alarmHistoryService = new AlarmHistoryService();
export const settingsService = new SettingsService();