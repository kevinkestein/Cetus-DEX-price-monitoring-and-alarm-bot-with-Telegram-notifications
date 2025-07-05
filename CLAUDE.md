# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Electron + TypeScript + React desktop application for monitoring cryptocurrency prices on the Cetus DEX (decentralized exchange) with Telegram notification capabilities.

## Technology Stack

- **Electron**: Desktop application framework
- **TypeScript**: Type-safe development
- **React**: UI framework with Tailwind CSS styling
- **Webpack**: Module bundler
- **Prisma**: Database ORM with SQLite
- **Node.js**: Runtime environment

## Project Structure

```
├── src/
│   ├── main/
│   │   ├── main.ts       # Electron main process
│   │   ├── preload.ts    # Preload script for security
│   │   └── database/     # Database layer
│   │       ├── index.ts  # Database exports
│   │       ├── config.ts # Database configuration
│   │       ├── client.ts # Prisma client setup
│   │       ├── init.ts   # Database initialization
│   │       ├── services.ts # Database service layer
│   │       └── test.ts   # Database tests
│   ├── renderer/
│   │   ├── components/   # React components
│   │   ├── index.tsx     # React entry point
│   │   ├── App.tsx       # Main React component
│   │   └── index.css     # Global styles with Tailwind
│   └── generated/
│       └── prisma/       # Generated Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── dist/                 # Compiled output
├── webpack.config.js     # Webpack configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json         # Project dependencies and scripts
```

## Common Commands

- `npm install` - Install all dependencies
- `npm run dev` - Start development server with hot reload (opens Electron window with React dev server)
- `npm run build` - Build production version
- `npm start` - Build and run production version
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio for database management

## Development Workflow

1. Run `npm run dev` to start the development environment
2. The app will automatically reload when you make changes to the renderer process (React)
3. For main process changes, you'll need to restart the dev server

## Architecture Notes

- **Main Process** (`src/main/main.ts`): Handles Electron window creation and system-level operations
- **Database Layer** (`src/main/database/`): Prisma ORM with SQLite for persistent data storage
- **Renderer Process** (`src/renderer/`): React application with Tailwind CSS styling
- **Preload Script** (`src/main/preload.ts`): Secure IPC communication bridge
- **Database Storage**: SQLite database stored in user's app data directory
- In development mode, the app loads from webpack-dev-server at http://localhost:3000
- In production mode, the app loads the built static files from the dist directory

## Database Schema

- **Alarm**: Store price monitoring alarms with conditions and thresholds
- **AlarmHistory**: Track when alarms are triggered with price data
- **Settings**: Application settings including Telegram configuration

## Database Operations

The database is automatically initialized on app startup. In development mode, comprehensive tests are run to verify database functionality. All database operations are handled through service classes with proper error handling.

## Alarms Management

The Alarms page provides a complete interface for creating and managing price alerts:

### Alarm Creation Form
- **Alarm Name**: Custom name for easy identification
- **Trading Pair**: Dropdown with popular pairs (SUI/USDC, ETH/USDC, BTC/USDC, SOL/USDC) + custom option
- **Alarm Type**: Choose between Percentage Change or Absolute Price
- **Condition**: Set trigger condition (Above/Below)
- **Value Input**: Specify percentage or price threshold
- **Form Validation**: Real-time validation with helpful error messages

### Alarms List & Management
- **Table View**: Clean table showing all alarm details (Name, Pair, Type, Condition, Value, Status)
- **Toggle Activation**: Quick switch to enable/disable alarms
- **Delete Functionality**: Remove alarms with confirmation dialog
- **Status Indicators**: Visual badges showing active/inactive status
- **Empty State**: Helpful message when no alarms exist
- **Real-time Updates**: List refreshes automatically after operations

## Settings Configuration

The Settings page provides a complete interface for configuring Telegram notifications:

- **Telegram Bot Token**: Secure input for bot authentication token from @BotFather
- **Telegram Chat ID**: Configuration for target chat/group (use @userinfobot to get ID)
- **Check Interval**: Configurable price monitoring frequency (1-60 minutes)
- **Notifications Toggle**: Enable/disable all Telegram notifications
- **Test Notification**: Send test message to verify configuration
- **Form Validation**: Real-time validation with helpful error messages
- **Toast Notifications**: Success/error feedback for user actions

## Components Architecture

- **AlarmsPage**: Combined alarm creation and management interface
- **AlarmForm**: Alarm creation form with validation and database integration
- **AlarmsList**: Table-based alarm management with toggle/delete actions
- **SettingsForm**: Complete form with validation and database integration
- **Toast System**: Notification system with success/error/info types
- **IPC Communication**: Secure main-renderer process communication for database operations
- **Database Integration**: Full CRUD operations with SQLite persistence

## Future Implementation Areas

- Telegram Bot API integration for sending notifications
- Web3/blockchain libraries for Cetus DEX interaction
- Price monitoring and alerting logic
- Alarm creation and management UI
- Real-time price data integration