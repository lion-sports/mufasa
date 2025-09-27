# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mufasa (LiONN) is a comprehensive application about sports team management built as a monorepo with separate frontend, backend, administrator panel, and AI agent services.

## Architecture

### Monorepo Structure

- `/frontend/` - Main SvelteKit application (user interface)
- `/backend/` - AdonisJS API server with PostgreSQL
- `/agent/` - FastAPI Python service for AI operations

### Technology Stack

- **Frontend**: SvelteKit 2.x with TypeScript, TailwindCSS, custom `@likable-hair/svelte` design system
- **Backend**: AdonisJS 6.x with PostgreSQL, Redis, Bull queues for background jobs
- **UI Components**: Custom design system with Melt UI primitives
- **Real-time**: Socket.io integration
- **Authentication**: JWT-based with multi-tenant support

## Development Commands

### Frontend (`/frontend/`)

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run check        # Type checking with svelte-check
npm run lint         # ESLint + Prettier check
npm run format       # Format code with Prettier
npm run test         # Playwright E2E tests
npm run test:unit    # Vitest unit tests
```

### Backend (`/backend/`)

```bash
npm run dev          # Start with hot reload (node ace serve --hmr)
npm run build        # Production build (node ace build)
npm run start        # Start production server
npm run bull         # Start background job processor
npm run migrate      # Run database migrations
npm run test         # Run all tests
npm run test:functional  # Run functional tests only
npm run lint         # ESLint check
npm run format       # Prettier formatting

# Database seeding
npm run seed:superuser      # Create superuser
npm run seed:permissions    # Seed permissions
npm run seed:measurementUnit # Seed measurement units
npm run seed:settings       # Seed system settings
npm run seed:dashboard      # Seed default dashboard
```

### Service Layer Pattern (Frontend)

- All API interactions through service classes extending `FetchBasedService`
- Consistent error handling and authentication
- Cookie/header management for multi-tenant context
- Built-in file upload/download capabilities

### Manager Pattern (Backend)

- Business logic encapsulated in manager classes
- Decorator-based patterns:
  - `@withAuth` - Authentication requirements
  - `@withUser` - Context injection
  - `@withTransaction` - Database transaction management
- When you have a date parameter in a manager method use the `Date` (builtin javascript) for it
- In validators use the `vine.date({ formats: { utc:true } })` for date fields validation

### Component Architecture

- Domain-driven component organization under `/lib/components/`
- Reusable UI components in `/common/`
- Feature-specific components grouped by business domain
- Svelte 5 runes for state management (`$state`, `$props`, `$effect`)

### Data Flow Patterns

- **Authentication**: JWT tokens with role-based permissions
- **State Management**: Svelte stores for global state, service-level caching
- **Real-time Updates**: Socket.io for live notifications and data updates
- **Background Processing**: Bull queues for async operations

## Database Conventions

- **Naming Strategy**: CamelCase for all database entities
- **Migrations**: Located in `/backend/database/migrations/`
- **Models**: Lucid ORM models with relationships
- **Factories**: Test data generation in `/backend/database/factories/`
- **Seeders**: Initial data setup scripts
- **Column types:** when you have a date type use table.timestamp (even if you have to consider only the date and not the time)

## Code Organization Guidelines

### Frontend Structure

```
/src/
  /lib/
    /components/           # Reusable UI components
      /common/            # Shared components (buttons, tables, etc.)
      /{domain}/          # Domain-specific components
    /services/            # API service classes
    /stores/              # Svelte stores for global state
    /types/               # TypeScript type definitions
  /routes/                # SvelteKit file-based routing
    /(main)/             # Main application routes
    /(auth)/             # Authentication routes
```

### Key Service Patterns

- All services extend `FetchBasedService` for consistent API handling
- Service methods return typed responses with proper error handling
- Pagination handled through standardized `PaginatedData` interface
- File operations built into base service class
- In the service file you usually also have the type of the entity the service is for (for example contract.service.ts contains the type Contract)
- When you define a type use the `Date` (builtin javascript) for the date fields

### Component Conventions

- Use `StandardPaginatedTable` for data tables with built-in filtering/sorting
- Follow the pattern of domain-specific paginated table components
- Implement proper TypeScript interfaces for component props
- Use Svelte 5 runes (`$state`, `$props`) for reactive state management

## Testing

- **Frontend**: Playwright for E2E testing, Vitest for unit tests
- **Backend**: Japa testing framework with functional test coverage
- Test files located alongside source code or in dedicated test directories

## Development Guidelines

### Code Quality

- TypeScript strict mode enabled across all projects
- ESLint + Prettier for consistent code formatting
- Comprehensive type coverage with proper interface definitions
- When you can use types, not interfaces
- When you can use the import with aliases (for example $lib in frontend)
- Don't use any type if you can

### Performance Considerations

- Route-based code splitting in SvelteKit
- Redis caching for frequently accessed data
- Background job processing for heavy operations
- Proper database indexing and query optimization

### Multi-Tenant Context

- Always consider tenant/warehouse scoping in data operations
- Use proper authorization decorators in backend managers
- Maintain context consistency across service calls
- Test multi-tenant scenarios thoroughly

## Important Notes

- The project uses a custom design system (`@likable-hair/svelte`) - check existing components before creating new ones. Don't use the Card component though.
- Always maintain backward compatibility when modifying shared services or components
- Database migrations should be reversible and tested thoroughly
- Background jobs require the Bull queue processor to be running (`npm run bull`)
- Real-time features depend on Socket.io connections - ensure proper connection management
- When you add a field to an entity you have to:
  - create the migration file
  - add the field to the model
  - add the field to the manager
  - check the controller if it is all alright
  - add the the api-spec
  - add the field to the validators
  - add the field to the test units
  - add the field to the service
