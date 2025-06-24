# AI TimeFlow - Task Management & Time Tracking Application

## Overview

AI TimeFlow is a modern productivity application that combines intelligent task management with advanced time tracking capabilities. Built with React, TypeScript, and Express.js, it features AI-powered task prioritization, smart scheduling, and comprehensive productivity analytics to help users optimize their workflow and achieve better focus.

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
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with Zod validation

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend
- **Migration System**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage implementation for rapid prototyping

## Key Components

### AI-Powered Task Management
- **Task Prioritization**: AI scoring system based on priority, impact, urgency, complexity, and optimal timing
- **Smart Suggestions**: Context-aware task recommendations based on time of day and energy levels
- **Task Attributes**: Complex task modeling including estimated duration, energy requirements, and dependencies

### Time Tracking & Analytics
- **Session Management**: Detailed time tracking with focus quality metrics and interruption counting
- **Time Blocking**: AI-generated optimal schedules based on task characteristics and user productivity patterns
- **Productivity Metrics**: Comprehensive analytics including energy patterns, peak hours, and goal achievement

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
- **Database**: Neon PostgreSQL serverless with Drizzle ORM for modern database management
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
- **Database**: Environment-based PostgreSQL connection with Neon serverless

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.