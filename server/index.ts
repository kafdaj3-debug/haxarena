import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { serveStatic, log } from "./vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRITICAL FOR RAILWAY: Create minimal Express app and start server IMMEDIATELY
// This ensures Railway health check can connect even before any setup completes
const app = express();
app.set('trust proxy', 1);

// Track server readiness - start as ready since we're starting immediately
let serverReady = true;

// CRITICAL: Add health check endpoints FIRST - before ANY other middleware
// These MUST respond immediately, even before server is fully ready
// Railway will check these endpoints, so they must work instantly

// Root path - PRIMARY health check for Railway (fastest response)
app.get("/", (req, res) => {
  // Immediate response - no processing
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: "ok", message: "Backend is running" }));
});

// Health check endpoint - also for Railway
app.get("/api/health", (req, res) => {
  // Immediate response - no processing
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: "ok", 
    ready: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

// Additional health check endpoint for Railway
app.get("/health", (req, res) => {
  // Immediate response - no processing
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: "ok", message: "Health check passed" }));
});

// Start server IMMEDIATELY - before any other setup
// This is CRITICAL for Railway - server must start before health check
const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const httpServer: Server = createServer(app);

// CRITICAL: Start server SYNCHRONOUSLY - no async operations before this
// Railway will check if server is running, so it must start immediately
console.log(`🚀 Starting server on ${host}:${port}...`);
process.stdout.write(`🚀 Starting server on ${host}:${port}...\n`);

// Start listening IMMEDIATELY - Railway needs this
httpServer.listen(port, host, () => {
  serverReady = true;
  
  // CRITICAL: Output immediately to stdout so Railway sees server started
  process.stdout.write(`\n`);
  process.stdout.write(`✅✅✅ SERVER STARTED SUCCESSFULLY ✅✅✅\n`);
  process.stdout.write(`✅ PORT: ${port}\n`);
  process.stdout.write(`✅ HOST: ${host}\n`);
  process.stdout.write(`✅ HEALTH CHECK: http://${host}:${port}/\n`);
  process.stdout.write(`✅ HEALTH CHECK: http://${host}:${port}/api/health\n`);
  process.stdout.write(`✅ HEALTH CHECK: http://${host}:${port}/health\n`);
  process.stdout.write(`✅ RAILWAY READY - NO HEALTH CHECK CONFIGURED\n`);
  process.stdout.write(`✅ Railway will only check if process is running\n`);
  process.stdout.write(`\n`);
  
  // Also use console.log for Railway logs
  console.log(`✅ Server running on ${host}:${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`✅ Health check available at: http://${host}:${port}/`);
  console.log(`✅ Health check available at: http://${host}:${port}/api/health`);
  console.log(`✅ Health check available at: http://${host}:${port}/health`);
  console.log(`✅ Railway ready - process monitoring only`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
  }
});

// Track when server starts listening
httpServer.once('listening', () => {
  serverReady = true;
  console.log(`✅ Server listening on ${host}:${port}`);
  process.stdout.write(`✅ Server listening on ${host}:${port}\n`);
});

// Error handling for server
httpServer.on('error', (error: any) => {
  console.error(`❌ Server error: ${error.message}`);
  console.error(`❌ Error code: ${error.code}`);
  log(`❌ Server error: ${error.message}`);
  log(`❌ Error code: ${error.code}`);
  
  if (error.code === 'EADDRINUSE') {
    log(`Port ${port} is already in use`);
    process.exit(1);
  }
  
  // Don't exit on other errors - let Railway retry
  // Server might recover
});

// Global error handlers to prevent crashes
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('❌ Stack:', error.stack);
  log(`❌ Uncaught Exception: ${error.message}`);
  log(`Stack: ${error.stack}`);
  // Don't exit - keep server running for Railway
  // Log the error but continue
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection:', reason);
  log(`❌ Unhandled Rejection: ${reason}`);
  // Don't exit - keep server running for Railway
  // Log the error but continue
});

// Keep process alive - prevent Railway from killing the process
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// NOW add all other middleware and setup (server is already running)
// CORS configuration - Allow requests from Netlify, Vercel, Anksoft and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL, // Frontend URL (Netlify, Vercel, Anksoft, etc.)
  'https://haxarena.vercel.app', // Vercel domain
  'https://haxarena.netlify.app', // Current Netlify domain
  'https://voluble-kleicha-433797.netlify.app', // Old Netlify domain (backup)
  'https://haxarena.net.tr', // Custom domain (Anksoft)
  'https://www.haxarena.net.tr', // Custom domain www (Anksoft)
  'https://haxarena.web.tr', // Custom domain (Vercel)
  'https://www.haxarena.web.tr', // Custom domain www (Vercel)
  'http://haxarena.net.tr', // Custom domain HTTP (fallback)
  'http://www.haxarena.net.tr', // Custom domain www HTTP (fallback)
  'http://haxarena.web.tr', // Custom domain HTTP (fallback)
  'http://www.haxarena.web.tr', // Custom domain www HTTP (fallback)
  'http://localhost:5173', // Vite dev server
  'http://localhost:5000', // Local development
].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

// Normalize origins (remove trailing slashes)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, ''));

// Debug: Log allowed origins in production
if (process.env.NODE_ENV === 'production') {
  log(`CORS Allowed Origins: ${normalizedOrigins.join(', ')}`);
  log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
} else {
  console.log(`CORS Allowed Origins (DEV): ${normalizedOrigins.join(', ')}`);
  console.log(`FRONTEND_URL (DEV): ${process.env.FRONTEND_URL || 'not set'}`);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always set CORS headers for API requests
  if (req.path.startsWith('/api')) {
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
    
    // Check if origin is backend's own domain (same-origin request)
    const backendUrl = process.env.RENDER_EXTERNAL_URL || req.get('host');
    const isBackendOrigin = normalizedOrigin && backendUrl && normalizedOrigin.includes(backendUrl);
    
    // Check if origin is allowed - more permissive for Vercel/Netlify
    const isAllowedOrigin = normalizedOrigin && (
      normalizedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith('.netlify.app') ||
      normalizedOrigin.endsWith('.netlify.com') ||
      normalizedOrigin.includes('netlify') ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.endsWith('.vercel.sh') ||
      normalizedOrigin.includes('vercel') ||
      // Allow haxarena domains (with and without www) - more flexible matching
      normalizedOrigin === 'https://haxarena.net.tr' ||
      normalizedOrigin === 'https://www.haxarena.net.tr' ||
      normalizedOrigin === 'http://haxarena.net.tr' ||
      normalizedOrigin === 'http://www.haxarena.net.tr' ||
      normalizedOrigin === 'https://haxarena.web.tr' ||
      normalizedOrigin === 'https://www.haxarena.web.tr' ||
      normalizedOrigin === 'http://haxarena.web.tr' ||
      normalizedOrigin === 'http://www.haxarena.web.tr' ||
      // Also allow if origin contains haxarena domains (for subdomains or variations)
      normalizedOrigin.includes('haxarena.net.tr') ||
      normalizedOrigin.includes('haxarena.web.tr') ||
      normalizedOrigin.startsWith('http://localhost')
    );
    
    // Handle preflight requests FIRST - ALWAYS respond to OPTIONS with CORS headers
    if (req.method === 'OPTIONS') {
      if (normalizedOrigin) {
        // Always allow preflight requests from any origin (browser requirement)
        // Check if origin is allowed for credentials
        if (isAllowedOrigin || isBackendOrigin) {
          res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        } else {
          res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
        return res.sendStatus(200);
      } else {
        // No origin header for OPTIONS - respond anyway
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.sendStatus(200);
      }
    }
    
    // Set CORS headers for actual requests
    if ((isAllowedOrigin || isBackendOrigin) && normalizedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else if (normalizedOrigin) {
      // Log blocked origin for debugging (but not for backend's own domain)
      if (process.env.NODE_ENV === 'production' && !isBackendOrigin) {
        log(`⚠️ CORS blocked origin: ${normalizedOrigin} (not in allowed list)`);
      }
      // Still set CORS headers but don't allow credentials for unknown origins
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else {
      // No origin header (same-origin or direct request) - allow
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    // Debug logging in production (but not for backend's own domain)
    if (process.env.NODE_ENV === 'production' && normalizedOrigin && !isBackendOrigin) {
      log(`CORS: ${req.method} ${req.path} from origin: ${normalizedOrigin} (allowed: ${isAllowedOrigin || isBackendOrigin})`);
    }
  }
  
  next();
});

// Increase payload limit for base64 images (team logos, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

// IMPORTANT: setupAuth must be called BEFORE registerRoutes
// This ensures session middleware is set up before routes are registered
setupAuth(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Now run async operations in background (server is already running)
(async () => {
  // Ensure required columns exist (development & production)
  try {
    // Add last_username_change column if missing
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_username_change timestamp
    `);
    log("Database schema check completed");
  } catch (error: any) {
    log("Database schema check warning: " + error.message);
  }

  // Run database migrations on startup (production deployment)
  if (process.env.NODE_ENV === "production") {
    try {
      log("Running database migrations...");
      
      // Try multiple paths for migrations folder
      // 1. ../migrations (from dist/) - project root
      // 2. ./migrations (same level as dist/)
      const possiblePaths = [
        path.join(__dirname, "..", "migrations"),
        path.join(__dirname, "migrations"),
        path.join(process.cwd(), "migrations"),
      ];
      
      let migrationsPath = possiblePaths[0];
      for (const testPath of possiblePaths) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(testPath)) {
            migrationsPath = testPath;
            log(`Found migrations at: ${migrationsPath}`);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      log(`Using migrations path: ${migrationsPath}`);
      await migrate(db, { migrationsFolder: migrationsPath });
      log("Database migrations completed successfully");
    } catch (error: any) {
      // Handle idempotent migration errors (already exists cases)
      const errorMessage = error?.message || String(error);
      
      // Allowlist: benign "already exists" errors from re-running migrations
      const idempotentErrors = [
        "relation", "table", "type", "function", 
        "extension", "index", "constraint", "sequence"
      ];
      
      const isIdempotentError = idempotentErrors.some(keyword => 
        errorMessage.toLowerCase().includes(keyword) && 
        errorMessage.toLowerCase().includes("already exists")
      );
      
      if (isIdempotentError) {
        log("Database schema already migrated - skipping redundant migration");
      } else {
        log("CRITICAL: Database migration failed with unexpected error");
        console.error("Migration error details:", error);
        log("Aborting startup to prevent running with incomplete schema");
        process.exit(1);
      }
    }

    // Fix: Ensure all required columns exist (production hotfix)
    try {
      log("Patching production database schema...");
      
      // Add each column separately (PostgreSQL requires separate statements)
      const patches = [
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'HaxArena Üye' NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS player_role text`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason text`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_chat_muted boolean DEFAULT false NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip_address text`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture text`,
        // Player statistics columns
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS goals integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS assists integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS saves integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS match_time integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS rank text DEFAULT 'Bronz' NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS wins integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS losses integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS draws integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS matches_played integer DEFAULT 0 NOT NULL`,
        sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0 NOT NULL`,
      ];
      
      for (const patch of patches) {
        try {
          await db.execute(patch);
        } catch (e) {
          // Ignore "column already exists" errors
        }
      }
      
      // Forum table columns - check if table exists first
      try {
        // Check if forum_posts table exists
        const forumPostsCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'forum_posts'
          )
        `);
        
        if (forumPostsCheck.rows && forumPostsCheck.rows[0] && (forumPostsCheck.rows[0] as any).exists) {
          // Add edited_at column if it doesn't exist
          try {
            await db.execute(sql`ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`);
            log("✓ Added edited_at column to forum_posts");
          } catch (e: any) {
            if (!e.message?.includes("already exists") && !e.message?.includes("duplicate")) {
              log(`⚠️  Warning adding edited_at to forum_posts: ${e.message}`);
            }
          }
        }
      } catch (e: any) {
        log(`⚠️  Warning checking forum_posts table: ${e.message}`);
      }
      
      try {
        // Check if forum_replies table exists
        const forumRepliesCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'forum_replies'
          )
        `);
        
        if (forumRepliesCheck.rows && forumRepliesCheck.rows[0] && (forumRepliesCheck.rows[0] as any).exists) {
          // Add edited_at column if it doesn't exist
          try {
            await db.execute(sql`ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP`);
            log("✓ Added edited_at column to forum_replies");
          } catch (e: any) {
            if (!e.message?.includes("already exists") && !e.message?.includes("duplicate")) {
              log(`⚠️  Warning adding edited_at to forum_replies: ${e.message}`);
            }
          }
        }
      } catch (e: any) {
        log(`⚠️  Warning checking forum_replies table: ${e.message}`);
      }
      
      // League fixtures table - add referee column
      try {
        // Check if league_fixtures table exists
        const leagueFixturesCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'league_fixtures'
          )
        `);
        
        if (leagueFixturesCheck.rows && leagueFixturesCheck.rows[0] && (leagueFixturesCheck.rows[0] as any).exists) {
          // Add referee column if it doesn't exist
          try {
            await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS referee TEXT`);
            log("✓ Added referee column to league_fixtures");
          } catch (e: any) {
            if (!e.message?.includes("already exists") && !e.message?.includes("duplicate")) {
              log(`⚠️  Warning adding referee to league_fixtures: ${e.message}`);
            }
          }
        }
      } catch (e: any) {
        log(`⚠️  Warning checking league_fixtures table: ${e.message}`);
      }
      
      // Private messages table columns
      try {
        // Check if private_messages table exists
        const privateMessagesCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'private_messages'
          )
        `);
        
        if (privateMessagesCheck.rows && privateMessagesCheck.rows[0] && (privateMessagesCheck.rows[0] as any).exists) {
          // Add image_url column if it doesn't exist
          try {
            await db.execute(sql`ALTER TABLE private_messages ADD COLUMN IF NOT EXISTS image_url TEXT`);
            log("✓ Added image_url column to private_messages");
          } catch (e: any) {
            if (!e.message?.includes("already exists") && !e.message?.includes("duplicate")) {
              log(`⚠️  Warning adding image_url to private_messages: ${e.message}`);
            }
          }
        }
      } catch (e: any) {
        log(`⚠️  Warning checking private_messages table: ${e.message}`);
      }
      
      // Fix: Make email column nullable (old migration leftover)
      try {
        await db.execute(sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`);
        log("✓ Email column made nullable");
      } catch (e) {
        // Column might not exist or already nullable
      }
      
      log("✓ Production database schema fully patched");
    } catch (error) {
      console.error("⚠️  Schema patch failed:", error);
    }

    // Ensure all required tables exist
    try {
      log("Creating missing tables if needed...");
      
      // Admin applications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS admin_applications (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          name TEXT NOT NULL,
          age TEXT NOT NULL,
          game_nick TEXT NOT NULL,
          discord_nick TEXT NOT NULL,
          play_duration TEXT NOT NULL,
          active_servers TEXT NOT NULL,
          previous_experience TEXT NOT NULL,
          daily_hours TEXT NOT NULL,
          active_time_zones TEXT NOT NULL,
          about_yourself TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Team applications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS team_applications (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          team_name TEXT NOT NULL,
          team_logo TEXT,
          description TEXT NOT NULL,
          captain_1 TEXT,
          captain_2 TEXT,
          vice_captain TEXT,
          players TEXT[],
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Settings table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_applications_open BOOLEAN NOT NULL DEFAULT false,
          team_applications_open BOOLEAN NOT NULL DEFAULT false
        )
      `);
      
      // Staff roles table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS staff_roles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          management_access BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Notifications table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Forum posts table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS forum_posts (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          image_url TEXT,
          is_locked BOOLEAN NOT NULL DEFAULT false,
          is_archived BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          edited_at TIMESTAMP
        )
      `);
      
      // Forum replies table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS forum_replies (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id VARCHAR NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
          user_id VARCHAR NOT NULL REFERENCES users(id),
          content TEXT NOT NULL,
          image_url TEXT,
          quoted_reply_id VARCHAR,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          edited_at TIMESTAMP
        )
      `);
      
      // Chat messages table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Banned IPs table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS banned_ips (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          ip_address TEXT NOT NULL UNIQUE,
          reason TEXT,
          banned_by VARCHAR NOT NULL REFERENCES users(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Password reset tokens table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id),
          token TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Private messages table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS private_messages (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id VARCHAR NOT NULL REFERENCES users(id),
          receiver_id VARCHAR NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          image_url TEXT,
          is_read BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Custom roles table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS custom_roles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL DEFAULT '#808080',
          priority INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // User custom roles junction table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_custom_roles (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role_id VARCHAR NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
          assigned_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // League tables
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS league_teams (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          logo TEXT,
          played INTEGER NOT NULL DEFAULT 0,
          won INTEGER NOT NULL DEFAULT 0,
          drawn INTEGER NOT NULL DEFAULT 0,
          lost INTEGER NOT NULL DEFAULT 0,
          goals_for INTEGER NOT NULL DEFAULT 0,
          goals_against INTEGER NOT NULL DEFAULT 0,
          goal_difference INTEGER NOT NULL DEFAULT 0,
          head_to_head INTEGER NOT NULL DEFAULT 0,
          points INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS league_fixtures (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          home_team_id VARCHAR REFERENCES league_teams(id) ON DELETE CASCADE,
          away_team_id VARCHAR REFERENCES league_teams(id) ON DELETE CASCADE,
          home_score INTEGER,
          away_score INTEGER,
          match_date TIMESTAMP NOT NULL,
          is_played BOOLEAN NOT NULL DEFAULT false,
          week INTEGER NOT NULL,
          is_bye BOOLEAN NOT NULL DEFAULT false,
          bye_side VARCHAR,
          is_postponed BOOLEAN NOT NULL DEFAULT false,
          match_recording_url VARCHAR,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Match goals table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS match_goals (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          fixture_id VARCHAR NOT NULL REFERENCES league_fixtures(id) ON DELETE CASCADE,
          player_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
          player_name VARCHAR,
          minute INTEGER NOT NULL,
          assist_player_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
          assist_player_name VARCHAR,
          is_home_team BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Migration: Add new columns if they don't exist
      try {
        await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS is_bye BOOLEAN NOT NULL DEFAULT false`);
        await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS bye_side VARCHAR`);
        await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS is_postponed BOOLEAN NOT NULL DEFAULT false`);
        await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS match_recording_url VARCHAR`);
        // Make home_team_id and away_team_id nullable for BAY
        await db.execute(sql`ALTER TABLE league_fixtures ALTER COLUMN home_team_id DROP NOT NULL`);
        await db.execute(sql`ALTER TABLE league_fixtures ALTER COLUMN away_team_id DROP NOT NULL`);
      } catch (error) {
        // Column might already exist, ignore error
        console.log("Fixture columns migration:", error instanceof Error ? error.message : String(error));
      }

      // Match goals columns migration - add player_name and assist_player_name, make player_id nullable
      try {
        await db.execute(sql`ALTER TABLE match_goals ADD COLUMN IF NOT EXISTS player_name VARCHAR`);
        await db.execute(sql`ALTER TABLE match_goals ADD COLUMN IF NOT EXISTS assist_player_name VARCHAR`);
        await db.execute(sql`ALTER TABLE match_goals ALTER COLUMN player_id DROP NOT NULL`);
      } catch (error) {
        console.log("Match goals columns migration:", error instanceof Error ? error.message : String(error));
      }
      
      // League fixtures columns migration - add is_forfeit
      try {
        await db.execute(sql`ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS is_forfeit BOOLEAN NOT NULL DEFAULT false`);
      } catch (error) {
        console.log("League fixtures is_forfeit migration:", error instanceof Error ? error.message : String(error));
      }
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS player_stats (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          fixture_id VARCHAR NOT NULL REFERENCES league_fixtures(id) ON DELETE CASCADE,
          user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
          player_name VARCHAR,
          team_id VARCHAR NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
          goals INTEGER NOT NULL DEFAULT 0,
          assists INTEGER NOT NULL DEFAULT 0,
          dm INTEGER NOT NULL DEFAULT 0,
          clean_sheets INTEGER NOT NULL DEFAULT 0,
          saves INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Player stats columns migration - add player_name, make user_id nullable
      try {
        await db.execute(sql`ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS player_name VARCHAR`);
        await db.execute(sql`ALTER TABLE player_stats ALTER COLUMN user_id DROP NOT NULL`);
      } catch (error) {
        console.log("Player stats columns migration:", error instanceof Error ? error.message : String(error));
      }
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS team_of_week (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          week INTEGER NOT NULL UNIQUE,
          image TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      // Migration: Update team_of_week table - add players column, make image nullable
      try {
        await db.execute(sql`ALTER TABLE team_of_week ADD COLUMN IF NOT EXISTS players TEXT`);
        await db.execute(sql`ALTER TABLE team_of_week ALTER COLUMN image DROP NOT NULL`);
        log("✓ Updated team_of_week table schema");
      } catch (error) {
        console.log("Team of week migration:", error instanceof Error ? error.message : String(error));
      }
      
      // Add statistics_visible column to settings if missing
      try {
        await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS statistics_visible BOOLEAN NOT NULL DEFAULT true`);
      } catch (e) {
        // Column might already exist
      }
      
      log("✓ All required tables ensured");
    } catch (error) {
      console.error("⚠️  Table creation failed:", error);
    }

    // Create/update alwes admin account
    try {
      const bcrypt = await import("bcrypt");
      const alwesPassword = "HaxArena2025!";
      const hashedPassword = await bcrypt.hash(alwesPassword, 10);
      
      // Check if alwes exists
      const existing = await db.execute(sql`SELECT id FROM users WHERE username = 'alwes'`);
      
      if (existing.rows.length === 0) {
        // Create alwes account
        await db.execute(sql`
          INSERT INTO users (username, password, is_admin, is_super_admin, is_approved, role, is_banned, is_chat_muted)
          VALUES ('alwes', ${hashedPassword}, true, true, true, 'Kurucu', false, false)
        `);
        log("✅ Admin account 'alwes' created with password: HaxArena2025!");
      } else {
        // Update existing alwes to be admin
        await db.execute(sql`
          UPDATE users 
          SET password = ${hashedPassword},
              is_admin = true,
              is_super_admin = true,
              is_approved = true,
              role = 'Kurucu',
              is_banned = false
          WHERE username = 'alwes'
        `);
        log("✅ Admin account 'alwes' updated with password: HaxArena2025!");
      }
    } catch (error) {
      console.error("⚠️  Failed to create/update alwes account:", error);
    }
  }

  // Register routes - use existing httpServer
  const server = await registerRoutes(app, httpServer);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Ensure CORS headers are set even on errors
    const origin = _req.headers.origin;
    if (origin && _req.path.startsWith('/api')) {
      const normalizedOrigin = origin.replace(/\/$/, '');
      // More permissive CORS for error responses
      if (normalizedOrigin.includes('netlify') || 
          normalizedOrigin.endsWith('.netlify.app') || 
          normalizedOrigin.endsWith('.netlify.com') ||
          normalizedOrigin.endsWith('.vercel.app') ||
          normalizedOrigin.endsWith('.vercel.sh') ||
          normalizedOrigin.includes('vercel') ||
          normalizedOrigin.includes('haxarena.net.tr') ||
          normalizedOrigin.includes('haxarena.web.tr') ||
          normalizedOrigins.includes(normalizedOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      } else {
        // Still set CORS headers for unknown origins in error cases
        res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
    }

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    // Dynamic import to avoid bundling vite in production builds
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server already started above, just setup vite/static
  // Server is already listening on httpServer
  log("✅ All routes and middleware configured");
})().catch((error) => {
  log(`❌ Fatal error in async initialization: ${error.message}`);
  console.error('Async initialization error:', error);
  // Don't exit - server is already running, just log the error
  // Railway health check will still work even if async operations fail
});
