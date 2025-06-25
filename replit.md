# AI TimeFlow - Advanced Productivity & Focus Management Platform

## Overview

AI TimeFlow is a comprehensive productivity platform that combines intelligent task management, AI-powered focus modes, and advanced analytics. Built with React, TypeScript, and Express.js, it features intelligent focus sessions, adaptive Pomodoro timers, distraction management, behavioral pattern analysis, and real-time productivity insights to help users achieve peak performance and deep work states.

## Recent Changes

### Project Migration to Replit Environment (January 2025)
- **Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment
- **Dependencies Verified**: All Node.js packages and TypeScript dependencies properly installed
- **Server Configuration**: Express server running on port 5000 with proper host binding (0.0.0.0)
- **Development Environment**: Vite integration working with hot module replacement
- **Security Practices**: Client/server separation maintained with robust architecture
- **Database Integration**: Configured for Supabase PostgreSQL with secure connection handling

### AI-Powered Focus Mode Implementation (January 2025)
- **Intelligent Focus Sessions**: Dynamic session length optimization based on task complexity, energy levels, and historical performance
- **Adaptive Pomodoro Timer**: AI-adjusted work/break intervals with progressive difficulty and energy-based modifications  
- **Distraction Management**: Real-time distraction detection, intelligent blocking, and intervention strategies
- **Focus Quality Tracking**: Continuous monitoring of attention depth and environmental factors

### Advanced Analytics & Behavioral Intelligence (January 2025)
- **Real-time Performance Dashboard**: Live focus quality monitoring, energy tracking, and session progress
- **AI Insights Engine**: Pattern detection, personalized recommendations, and predictive productivity forecasting
- **Behavioral Analysis**: Work pattern recognition, context switching analysis, and procrastination detection
- **Goal Progress Intelligence**: Automated milestone tracking with predictive completion dates

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

### AI-Powered Task Management
- **Task Prioritization**: AI scoring system based on priority, impact, urgency, complexity, and optimal timing
- **Smart Suggestions**: Context-aware task recommendations based on time of day and energy levels
- **Task Attributes**: Complex task modeling including estimated duration, energy requirements, and dependencies

### AI-Powered Focus Mode
- **Intelligent Focus Sessions**: Smart session duration calculation based on task complexity, user energy, and historical performance
- **Distraction Management**: Real-time distraction detection with intelligent interventions and focus score tracking
- **Adaptive Pomodoro**: AI-enhanced Pomodoro technique with energy-based adjustments and progressive difficulty scaling
- **Focus Techniques**: Personalized recommendations for breathing, meditation, music, and environmental optimization
- **Environmental Optimization**: Context-aware suggestions for lighting, noise, temperature, and location adjustments

### Time Tracking & Analytics
- **Session Management**: Detailed time tracking with focus quality metrics and interruption counting
- **Time Blocking**: AI-generated optimal schedules based on task characteristics and user productivity patterns
- **Productivity Metrics**: Comprehensive analytics including energy patterns, peak hours, and goal achievement

### Advanced Analytics & Behavioral Insights
- **Productivity Intelligence**: Comprehensive dashboard with trend analysis, peak performance identification, and productivity forecasting
- **Behavioral Pattern Recognition**: AI detection of work patterns, energy cycles, procrastination triggers, and peak performance windows
- **Context Switching Analysis**: Tracking and optimization recommendations for focus block duration and switching efficiency
- **Predictive Analytics**: AI-powered forecasting for productivity trends, goal achievement, and habit formation success
- **Work-Life Balance Monitoring**: Burnout risk assessment, wellness scoring, and boundary optimization recommendations

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