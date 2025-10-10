# HaxArena V6 Real Soccer

## Overview

HaxArena V6 Real Soccer is a Turkish HaxBall community platform that manages active game rooms, VIP memberships, league systems, and community forums. The application provides a dark-themed gaming interface for Turkish HaxBall players to connect, organize matches, and participate in competitive leagues.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for utility-first styling

**UI Component System:**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui design system configured with "new-york" style preset
- Custom dark theme optimized for gaming aesthetics
- Design inspired by Discord, Twitch, and modern gaming platforms
- Turkish-first design with appropriate typography (Inter, Rajdhana, JetBrains Mono)

**State Management:**
- React Query for asynchronous server state
- React Context API for authentication state
- Local component state with React hooks

**Styling Approach:**
- Dark mode as primary theme (near-black backgrounds for reduced eye strain)
- Cyan/turquoise primary accent color (#4cadd0) for all interactive elements
- Custom CSS variables for theming flexibility
- Utility classes for hover/active states (`hover-elevate`, `active-elevate-2`)

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Session-based authentication using Passport.js with LocalStrategy
- Express-session for session management with 30-day cookie lifetime

**Authentication & Authorization:**
- Bcrypt for password hashing (using bcrypt v6.0.0)
- Passport.js LocalStrategy for username/password authentication
- Session middleware with persistent cookies
- User roles: standard users and administrators (isAdmin flag)

**API Design:**
- RESTful API structure with `/api` prefix
- JSON request/response format
- Credential-based authentication (cookies)
- Error handling middleware for consistent error responses

### Database Architecture

**ORM & Database:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (configured for Neon serverless)
- WebSocket connection support via `@neondatabase/serverless`

**Schema Design:**
- Users table: id (UUID), username, email, password (hashed), isAdmin flag, isBanned, banReason, isChatMuted, lastIpAddress
- All fields enforce uniqueness and NOT NULL constraints where appropriate
- Zod schemas for runtime validation via `drizzle-zod`

**Migration Strategy:**
- Development: Use `npm run db:push --force` to sync schema changes
- Production: Automated file-based migrations on startup
  - Migration files stored in `/migrations` directory (must be present in deployment)
  - Server runs migrations automatically on production startup using drizzle-orm migrate()
  - Path resolution: Tries multiple paths (../migrations, ./migrations, cwd/migrations) to ensure compatibility
  - Idempotent error handling: Gracefully skips already-applied migrations
  - Aborts on genuine migration failures to prevent incomplete schema
  - Enhanced logging for debugging migration path resolution

**Session Management:**
- Development: MemoryStore for simplicity and fast development
- Production: PostgreSQL session store via connect-pg-simple
  - Reuses existing Neon connection pool (SSL pre-configured)
  - Type assertion bridges Neon Pool with connect-pg-simple
  - Auto-creates session table on startup
  - Async error event listener for runtime connection monitoring
  - Secure cookies with security flags:
    - httpOnly: true (XSS protection)
    - secure: true in production (HTTPS only)
    - sameSite: "lax" (CSRF protection)
    - maxAge: 30 days
  - Trust proxy: 1 (Replit HTTPS termination)
  - Prevents memory leaks in Autoscale deployments
  - Fixed: Production deployment SSL and cookie configuration resolved (October 2025)

### Application Features

**Active Rooms Management:**
- Display of live HaxBall game rooms with match names and external links
- Real-time status indicators for active rooms
- Admin-only edit functionality for room management

**VIP System:**
- Three-tier VIP packages: Silver (90 TL), Gold (120 TL), Diamond (150 TL)
- Feature differentiation with unique benefits per tier
- Integration with Shopier payment gateway
- Post-purchase Discord ticket workflow for order verification

**League System:**
- Placeholder for future league seasons and standings
- Admin-controlled league creation and management
- Team application system with logo upload support

**Community Forum:**
- Post creation with categories (Genel Sohbet, Takım Başvuruları, Öneriler, Sözlük)
- Image upload support for posts and replies (base64, max 5MB)
- Reply system with counts and quote/reference functionality
- Quote feature allows users to reference specific replies
- Post locking and archiving functionality
- Admin moderation capabilities
- Role badge display with priority ordering (Admin/Management roles first, then player roles)
- "YÖNETİM" badge for super admin users in posts and replies

**Live Chat System:**
- Real-time community chat on homepage (displayed next to forum posts)
- Emoji support via @emoji-mart/react with picker interface
- 5-second rate limiting per user to prevent spam
- Auto-polling (2-second interval) for new messages
- Message deletion permissions for admin and management users only
- Auto-scroll to latest messages
- Authenticated users only

**Admin Panel:**
- Staff hierarchy management with 7 role levels (Founder → Arena Admin)
- User registration approval workflow
- Content moderation tools
- User ban/mute system with reason tracking
  - Ban functionality blocks access to all protected routes (profile, applications, forum, chat)
  - Chat mute functionality prevents sending messages while allowing other interactions
  - IP address tracking and display for security monitoring
  - Ban reason storage and display in management interface
  - IP ban check middleware with graceful degradation (tolerates missing table during initial deployment)
- User deletion with complete cascade handling (removes all forum posts, replies, applications, notifications, and chat messages)
- Password viewing feature (restricted to super admin/management only)
- Admin application "about yourself" field display in management interface

## External Dependencies

### Third-Party Services

**Payment Processing:**
- Shopier.com for VIP package purchases
- Three distinct product URLs for Silver, Gold, and Diamond tiers
- Order verification via Discord ticket system

**Communication Platform:**
- Discord community integration
- Links to official Discord server (discord.gg/haxarena)
- Post-purchase ticket creation workflow

**Game Integration:**
- HaxBall game rooms via haxball.com/play URLs
- External room links for live match hosting

### Key NPM Packages

**UI & Styling:**
- `@radix-ui/*` - 20+ primitive components for accessibility
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant styling
- `lucide-react` - Icon library
- `react-icons` - Additional icons (SiDiscord)
- `@emoji-mart/react` & `@emoji-mart/data` - Emoji picker for live chat

**Data Management:**
- `@tanstack/react-query` - Server state management
- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - PostgreSQL client for Neon
- `zod` - Runtime validation

**Authentication:**
- `passport` & `passport-local` - Authentication middleware
- `express-session` - Session management
- `connect-pg-simple` - PostgreSQL session store
- `bcrypt` - Password hashing

**Development:**
- `vite` - Build tool and dev server
- `typescript` - Type safety
- `tsx` - TypeScript execution for Node.js
- `esbuild` - Production bundling

### Deployment Configuration

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SESSION_SECRET` - Session encryption key (defaults to "haxarena-v6-secret-key")
- `NODE_ENV` - Environment mode (development/production)

**Build Process:**
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js` with ESM format
- Separate development and production workflows