import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Trust first proxy (Replit HTTPS termination)
app.set('trust proxy', 1);

// CORS configuration - Allow requests from Netlify and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL, // Netlify URL (e.g., https://your-site.netlify.app)
  'https://haxarena.netlify.app', // Current Netlify domain
  'https://voluble-kleicha-433797.netlify.app', // Old Netlify domain (backup)
  'http://localhost:5173', // Vite dev server
  'http://localhost:5000', // Local development
].filter(Boolean); // Remove undefined values

// Normalize origins (remove trailing slashes)
const normalizedOrigins = allowedOrigins.map(origin => origin.replace(/\/$/, ''));

// Debug: Log allowed origins in production
if (process.env.NODE_ENV === 'production') {
  log(`CORS Allowed Origins: ${normalizedOrigins.join(', ')}`);
  log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
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
    
    // Allow all Netlify domains (most permissive approach)
    if (normalizedOrigin && (
      normalizedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith('.netlify.app') ||
      normalizedOrigin.endsWith('.netlify.com') ||
      normalizedOrigin.includes('netlify')
    )) {
      // Set CORS headers for allowed origin
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    } else if (normalizedOrigin && isBackendOrigin) {
      // Backend's own domain - same-origin request, no CORS needed but allow it
      // Don't log as blocked
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    } else if (normalizedOrigin) {
      // For other origins, check if it's localhost or in allowed list
      if (normalizedOrigin.startsWith('http://localhost') || normalizedOrigins.includes(normalizedOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
      } else {
        // Log blocked origin for debugging (but not for backend's own domain)
        if (process.env.NODE_ENV === 'production' && !isBackendOrigin) {
          log(`⚠️ CORS blocked origin: ${normalizedOrigin} (not in allowed list)`);
        }
      }
    } else {
      // No origin header (same-origin or direct request) - allow
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    // Debug logging in production (but not for backend's own domain)
    if (process.env.NODE_ENV === 'production' && normalizedOrigin && !isBackendOrigin) {
      log(`CORS: ${req.method} ${req.path} from origin: ${normalizedOrigin}`);
    }
  }
  
  next();
});

// Increase payload limit for base64 images (team logos, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

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
          home_team_id VARCHAR NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
          away_team_id VARCHAR NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
          home_score INTEGER,
          away_score INTEGER,
          match_date TIMESTAMP NOT NULL,
          is_played BOOLEAN NOT NULL DEFAULT false,
          week INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS player_stats (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          fixture_id VARCHAR NOT NULL REFERENCES league_fixtures(id) ON DELETE CASCADE,
          user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          team_id VARCHAR NOT NULL REFERENCES league_teams(id) ON DELETE CASCADE,
          goals INTEGER NOT NULL DEFAULT 0,
          assists INTEGER NOT NULL DEFAULT 0,
          dm INTEGER NOT NULL DEFAULT 0,
          clean_sheets INTEGER NOT NULL DEFAULT 0,
          saves INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS team_of_week (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          week INTEGER NOT NULL UNIQUE,
          image TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      
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

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Ensure CORS headers are set even on errors
    const origin = _req.headers.origin;
    if (origin && _req.path.startsWith('/api')) {
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (normalizedOrigin.includes('netlify') || 
          normalizedOrigin.endsWith('.netlify.app') || 
          normalizedOrigin.endsWith('.netlify.com') ||
          normalizedOrigins.includes(normalizedOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Production: Listen on all interfaces (0.0.0.0) for cloud platforms
  // Development: Use localhost for Windows compatibility
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  server.listen(port, host, () => {
    log(`Server running on ${host}:${port} (${process.env.NODE_ENV || 'development'})`);
    if (process.env.NODE_ENV === 'production') {
      log(`Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
      log(`Database: ${process.env.DATABASE_URL ? 'connected' : 'not configured'}`);
    }
  });
})();
