# Super-Tool Website

## Overview

Super-Tool is a comprehensive web-based utility platform that consolidates multiple everyday tools into a single, unified interface. The application provides calculators, converters, image processing tools, document utilities, and audio/video tools in one place, eliminating the need for users to visit multiple single-purpose websites.

The platform is designed with a focus on speed, simplicity, and user privacy. Many tools operate client-side for instant results, while server-side processing is used for file operations with automatic cleanup. The application supports progressive web app (PWA) capabilities and is optimized for both desktop and mobile experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript using a modern component-based architecture:

- **React Router**: Uses `wouter` for lightweight client-side routing
- **State Management**: React Query (`@tanstack/react-query`) for server state management and local React state for UI components
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Design System**: Custom color-coded categories (Calculators: Indigo, Converters: Emerald, Image Tools: Purple, Document Tools: Orange, Audio/Video: Rose)
- **Modal System**: 80% viewport modals for tool interfaces on desktop, full-screen sheets on mobile
- **Search**: Global search functionality with keyboard shortcuts (Ctrl/Cmd + K)

### Backend Architecture
The server is an Express.js application with TypeScript:

- **API Design**: RESTful endpoints under `/api` prefix
- **File Processing**: Multer for file uploads with size limits (100MB) and temporary storage
- **Service Layer**: Modular services for currency conversion, file processing, and cleanup operations
- **Background Jobs**: Cron-based cleanup service for expired files and processing jobs
- **Development Tools**: Vite integration for development with hot module replacement

### Data Storage Solutions
The application uses a flexible storage abstraction:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon serverless PostgreSQL for production deployment
- **Schema**: User management, tool usage tracking, file processing jobs, currency rates, and user settings
- **In-Memory Fallback**: MemStorage class provides in-memory storage for development/testing

### Authentication and Authorization
Basic user management system:

- **User Schema**: Username/password authentication with settings storage
- **Session Management**: Express sessions with PostgreSQL session store
- **Privacy-First**: No tracking by default, optional user accounts for history/preferences

### External Service Integrations
- **Currency API**: Exchange rate integration with caching (1-hour TTL)
- **File Processing**: Server-side processing for PDF operations, image manipulation, and audio/video conversion
- **CDN/Fonts**: Google Fonts integration for typography
- **Development**: Replit-specific integrations for development environment

### Key Architectural Decisions

**Client-Side First Approach**: Many tools (calculators, basic converters) run entirely in the browser for instant results and better privacy. This reduces server load and provides offline capability.

**Category-Based Organization**: Tools are organized into five color-coded categories with consistent visual language. This makes navigation intuitive and scales well as new tools are added.

**Modal-Based Tool Interface**: Tools open in modals rather than separate pages, maintaining context and allowing quick switching between tools. Mobile uses full-screen sheets for better touch experience.

**Automatic File Cleanup**: Server-processed files are automatically deleted after a set time period to protect user privacy and manage storage costs.

**Progressive Enhancement**: The application works without JavaScript for basic functionality but provides enhanced experiences with it enabled.

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React Query for data fetching, Wouter for routing
- **UI Components**: Radix UI primitives, Tailwind CSS for styling, Shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation

### Backend Dependencies  
- **Server**: Express.js with TypeScript, Multer for file uploads
- **Database**: Drizzle ORM, PostgreSQL (Neon serverless), connect-pg-simple for sessions
- **Background Processing**: node-cron for scheduled cleanup tasks

### Development Tools
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: tsx for TypeScript execution, Replit integration plugins
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer

### External APIs
- **Currency Exchange**: Exchange rate API for live currency conversion
- **Google Fonts**: Web font delivery for custom typography

### File Processing Libraries
The application includes capabilities for PDF processing, image manipulation, and audio/video conversion, though specific implementation libraries are abstracted through the file processor service.