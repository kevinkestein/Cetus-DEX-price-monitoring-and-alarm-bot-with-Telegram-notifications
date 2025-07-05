import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private dbPath: string;

  private constructor() {
    // Get the user data directory
    const userDataPath = app.getPath('userData');
    
    // Create database directory if it doesn't exist
    const dbDir = path.join(userDataPath, 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Set the database file path
    this.dbPath = path.join(dbDir, 'cetus-alarm-bot.db');
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public getDatabaseUrl(): string {
    return `file:${this.dbPath}`;
  }

  public getDatabasePath(): string {
    return this.dbPath;
  }
}