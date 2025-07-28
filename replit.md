# RecoveryPath Mobile App

## Overview

RecoveryPath is a cross-platform mobile application designed for drug addiction recovery patients in Thailand. Built as a full-stack web application with mobile-first design, it provides a comprehensive platform for tracking recovery progress, accessing resources, connecting with community support, and accessing crisis intervention tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Migration Completed (July 28, 2025)**
- Successfully migrated RecoveryPath project from Replit Agent to standard Replit environment
- Database setup: PostgreSQL database created and schema deployed via Drizzle Kit
- Security fixes: Session secret configuration implemented for express-session
- Authentication: Replit Auth integration verified and working
- Server configuration: Express server running on port 5000 with proper client/server separation
- API endpoints: All mood tracking, milestone, resource, and community endpoints functional
- WebSocket: Real-time chat server configured and operational
- Frontend: React app with Thai localization loading correctly

**Advanced Features Completed (July 28, 2025)**
- AI-powered analytics dashboard with mood trends, streaks, and predictive scoring - WORKING ✓
- Smart goal setting system with personalized milestone recommendations - WORKING ✓
- Intelligent notification system with crisis detection and motivational alerts - WORKING ✓
- Advanced progress tracking with recovery insights and achievement recognition - WORKING ✓
- Enhanced navigation with analytics and goal management pages - WORKING ✓
- Authentication issues resolved with SESSION_SECRET configuration - WORKING ✓
- All advanced features verified accessible through new navigation tabs

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom Thai-localized components

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with OpenID Connect integration
- **Real-time Communication**: WebSocket server for community chat features
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Key Tables**: users, mood_entries, milestones, resources, community_posts, emergency_contacts, rehab_centers, sessions

## Key Components

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication with PostgreSQL storage
- User profile management with recovery tracking metadata

### Mood Tracking Module
- Daily mood check-ins with four levels (great, okay, struggling, crisis)
- Historical mood data visualization
- Progress charts showing recovery trends over time

### Community Features
- Real-time chat using WebSocket connections
- Anonymous posting capability
- Community post sharing and interaction

### Crisis Intervention
- Emergency contact system with Thai helplines
- Breathing exercise guided meditation
- Location-based rehab center directory
- Crisis modal with immediate assistance options

### Resource Management
- Categorized educational content (mental health, strategies, support)
- Search functionality across resources
- Progressive content delivery

### Milestone System
- Recovery goal setting and tracking
- Achievement recognition
- Progress visualization

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth → Session created in PostgreSQL → User data fetched and cached
2. **Mood Tracking**: Daily mood submission → Validation via Drizzle Zod schemas → Storage in mood_entries table → Real-time UI updates
3. **Community Interaction**: WebSocket connection established → Real-time message broadcasting → Database persistence for post history
4. **Crisis Response**: Emergency detection → Immediate UI overlay → Direct integration with Thai emergency services

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **Authentication**: passport with openid-client for Replit Auth
- **Real-time**: ws (WebSocket) for community chat
- **UI Library**: @radix-ui/* components with class-variance-authority for styling
- **State Management**: @tanstack/react-query for server state
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Date Handling**: date-fns for Thai localization support

### Development Tools
- **Build**: Vite with React plugin and runtime error overlay
- **Database**: Drizzle Kit for schema management and migrations
- **TypeScript**: Full type safety across client, server, and shared code
- **Styling**: PostCSS with Tailwind CSS and autoprefixer

## Deployment Strategy

### Development Environment
- Replit-optimized development server with HMR
- Environment-specific configuration through .env variables
- Database provisioning through Replit's integrated services

### Production Build
- Vite production build with code splitting and optimization
- Server bundling with esbuild for Node.js deployment
- Static asset serving with proper caching headers

### Database Management
- Schema migrations through Drizzle Kit push commands
- Connection pooling with Neon serverless for scalability
- Session cleanup and maintenance through PostgreSQL scheduling

### Mobile Optimization
- Responsive design with mobile-first approach
- Touch-optimized UI components
- Offline-first considerations for critical features
- Progressive Web App capabilities for mobile installation

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment while maintaining type safety across the entire stack.