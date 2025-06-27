# TimeFlow - Minimalist Productivity Platform

## Overview

TimeFlow is a minimalist productivity platform focused on essential task management and time tracking. Built with React, TypeScript, and Express.js, it provides a clean, distraction-free interface for organizing tasks, tracking time, and viewing productivity metrics without complex AI features.

## Recent Changes

### Notification & Prioritization Features Implementation (June 2025)
- **Smart Notification System**: Real-time notifications for task reminders and schedule alerts
- **Browser Notifications**: Permission-based browser notifications with customizable settings
- **Task Prioritization Algorithms**: Implementation of Eisenhower Matrix, Eat the Frog, and 80/20 rule
- **AI-Powered Prioritization**: Composite scoring system combining all three methodologies
- **Schedule Suggestions**: User feedback system for optimizing AI-generated schedules
- **Reminder Management**: Automatic reminders based on due dates and priority levels

### Project Migration to Replit Environment (January 2025)
- **Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment
- **Dependencies Verified**: All Node.js packages and TypeScript dependencies properly installed
- **Server Configuration**: Express server running on port 5000 with proper host binding (0.0.0.0)
- **Development Environment**: Vite integration working with hot module replacement
- **Security Practices**: Client/server separation maintained with robust architecture
- **Database Integration**: PostgreSQL database provisioned and migrations completed
- **Authentication System**: Replit Auth integration working with secure session management
- **Build Process**: All workflows and development tools functioning correctly

### Advanced Productivity Features (January 2025)
- **Smart Task Management**: AI-enhanced task creation with priority, complexity, and impact scoring
- **Intelligent Time Tracking**: Advanced time tracking with productivity analytics
- **Auto-Schedule Generation**: AI-powered schedule optimization based on task attributes
- **User Feedback Integration**: Learning system that improves recommendations based on user input

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state and local React state
- **Routing**: React Router for client-side navigation
- **Development Environment**: Replit with live reload and error overlay

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API endpoints
- **Development Mode**: Custom Vite integration for SSR during development
- **Build Process**: ESBuild for production bundling
- **Database**: Supabase PostgreSQL with serverless connection pooling
- **ORM**: Drizzle ORM with Zod validation

### Database Design
- **Primary Database**: Supabase PostgreSQL with transaction pooling
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend
- **Migration System**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage implementation for rapid prototyping

## Key Components

### Core Task Management
- **Task Creation**: Simple task creation with title, priority, and due date
- **Task Organization**: Basic categorization and priority-based sorting
- **Task Completion**: Straightforward task completion tracking

### Time Tracking
- **Session Management**: Start/stop time tracking for tasks and activities
- **Time Logging**: Basic time duration tracking and session history
- **Simple Scheduling**: Manual time blocking and scheduling tools

### Basic Analytics
- **Productivity Dashboard**: Simple overview of completed tasks and time tracked
- **Basic Metrics**: Task completion rates and time distribution
- **Weekly Activity**: Visual representation of daily productivity

### User Interface
- **Component Library**: shadcn/ui with Radix UI primitives for accessibility
- **Design System**: Consistent styling with CSS custom properties and Tailwind utilities
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Navigation**: Tab-based interface for tasks, timer, and dashboard views

## Data Flow

### Task Management Flow
1. User creates tasks with AI-enhanced attributes (priority, complexity, impact, energy level)
2. AI prioritization engine calculates dynamic scores based on multiple factors
3. Smart suggestions surface optimal tasks based on current context and time
4. Tasks integrate with time blocking system for schedule optimization

### Time Tracking Flow
1. Users start time sessions linked to specific tasks or time blocks
2. Real-time tracking captures duration, focus quality, and interruptions
3. Session data feeds into productivity analytics engine
4. Historical data improves AI recommendations and scheduling algorithms

### Data Persistence
- **Development**: In-memory storage with predefined interface for easy database migration
- **Production**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared type definitions ensure consistency between frontend and backend

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React Router, React Query for robust frontend architecture
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI accessibility
- **Database**: Supabase PostgreSQL with Drizzle ORM for modern database management
- **Build Tools**: Vite with TypeScript, ESBuild, and Tailwind CSS for optimized development

### AI & Analytics Libraries
- **Date Handling**: date-fns for robust date manipulation in scheduling algorithms
- **Form Management**: React Hook Form with Zod resolvers for type-safe form validation
- **Utility Libraries**: clsx and class-variance-authority for dynamic styling

### Development Tools
- **Replit Integration**: Custom Vite plugins for development environment optimization
- **Error Handling**: Runtime error overlay for improved development experience
- **Session Management**: Express session with PostgreSQL store for user persistence

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Live Reload**: Vite development server with HMR for rapid iteration
- **Port Configuration**: Express server on port 5000 with external port 80 mapping
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Production Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: ESBuild bundles Express server to `dist/index.js`
3. **Database Setup**: Drizzle migrations ensure schema consistency
4. **Static Serving**: Express serves built frontend assets in production

### Deployment Configuration
- **Target**: Autoscale deployment for dynamic resource allocation
- **Build Command**: `npm run build` for complete application compilation
- **Start Command**: `npm run start` for production server execution
- **Database**: Environment-based PostgreSQL connection with Supabase serverless

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.