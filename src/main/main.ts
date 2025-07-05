import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { DatabaseInitializer } from './database/init';
import { runDatabaseTests } from './database/test';
import { setupIpcHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from webpack dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built file
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Set up IPC handlers first
    setupIpcHandlers();
    
    // Initialize database
    await DatabaseInitializer.initialize();
    
    // Test database connection
    const dbConnected = await DatabaseInitializer.testConnection();
    if (!dbConnected) {
      console.error('Database connection failed, but continuing...');
    } else {
      // Run comprehensive database tests in development
      if (process.env.NODE_ENV === 'development') {
        await runDatabaseTests();
      }
    }
    
    // Create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Continue with window creation even if database fails
    createWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    // Disconnect from database before quitting
    await DatabaseInitializer.disconnect();
    app.quit();
  }
});