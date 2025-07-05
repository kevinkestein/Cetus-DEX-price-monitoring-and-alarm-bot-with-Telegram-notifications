// Database exports for main process
export { DatabaseConfig } from './config';
export { DatabaseClient, db } from './client';
export { DatabaseInitializer } from './init';
export {
  AlarmService,
  AlarmHistoryService,
  SettingsService,
  alarmService,
  alarmHistoryService,
  settingsService
} from './services';

// Re-export Prisma types
export type {
  Alarm,
  AlarmHistory,
  Settings,
  AlarmType,
  AlarmCondition
} from '../../generated/prisma';