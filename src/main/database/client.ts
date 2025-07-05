import { PrismaClient } from '../../generated/prisma';
import { DatabaseConfig } from './config';

class DatabaseClient {
  private static instance: DatabaseClient;
  private prisma: PrismaClient;

  private constructor() {
    const dbConfig = DatabaseConfig.getInstance();
    
    // Set the DATABASE_URL environment variable dynamically
    process.env.DATABASE_URL = dbConfig.getDatabaseUrl();
    
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbConfig.getDatabaseUrl()
        }
      }
    });
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  public async connect(): Promise<void> {
    await this.prisma.$connect();
  }
}

export const db = DatabaseClient.getInstance().getClient();
export { DatabaseClient };