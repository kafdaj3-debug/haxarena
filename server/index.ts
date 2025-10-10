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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    // Fix: Ensure is_super_admin column exists (production hotfix)
    try {
      log("Checking database schema integrity...");
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false NOT NULL;
      `);
      log("✓ Database schema verified and patched if needed");
    } catch (error) {
      console.error("⚠️  Schema patch failed (non-critical):", error);
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
