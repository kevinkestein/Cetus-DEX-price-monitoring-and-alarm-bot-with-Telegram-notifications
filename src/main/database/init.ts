import { DatabaseClient, db } from './client';
import { DatabaseConfig } from './config';
import { settingsService } from './services';

export class DatabaseInitializer {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing database...');
      
      // Get database configuration
      const dbConfig = DatabaseConfig.getInstance();
      console.log(`Database path: ${dbConfig.getDatabasePath()}`);
      
      // Connect to database
      const dbClient = DatabaseClient.getInstance();
      await dbClient.connect();
      
      // Run migrations (create tables if they don't exist)
      await this.runMigrations();
      
      // Initialize default settings
      await settingsService.initializeDefaultSettings();
      
      console.log('Database initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private static async runMigrations(): Promise<void> {
    try {
      // Check if we can connect and query
      await db.$queryRaw`SELECT 1`;
      console.log('Database connection verified');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      await db.$connect();
      
      // Test basic operations
      const settingsCount = await db.settings.count();
      const alarmsCount = await db.alarm.count();
      const historyCount = await db.alarmHistory.count();
      
      console.log('Database test results:', {
        settingsCount,
        alarmsCount,
        historyCount,
        status: 'Connected'
      });
      
      return true;
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      const dbClient = DatabaseClient.getInstance();
      await dbClient.disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}