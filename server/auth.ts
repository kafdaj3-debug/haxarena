import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import { db, pool } from "./db";

const PgSession = connectPgSimple(session);
const MemoryStoreSession = MemoryStore(session);

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      isAdmin: boolean;
      isSuperAdmin: boolean;
      isApproved: boolean;
      role: string;
      isBanned: boolean;
      isChatMuted: boolean;
    }
  }
}

export function setupAuth(app: Express) {
  // Configure session store based on environment
  let sessionStore;
  
  if (process.env.NODE_ENV === "production") {
    // Production: Use PostgreSQL session store with existing pool
    // This reuses the same connection pool as Drizzle (already has SSL configured)
    sessionStore = new PgSession({
      pool: pool as any, // Type assertion: Neon Pool is compatible with pg Pool
      createTableIfMissing: true,
      tableName: 'session'
    });
    
    // Handle async connection errors
    sessionStore.on?.('error', (err: Error) => {
      console.error("⚠️  Session store error:", err);
      // Session store errors are logged but don't crash the app
      // Users will need to re-authenticate if sessions are lost
    });
    
    console.log("✓ Production session store: PostgreSQL (connect-pg-simple with Neon pool)");
  } else {
    // Development: Use MemoryStore for simplicity
    sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "haxarena-v6-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === "production", // HTTPS only in production (Replit auto-provides HTTPS)
        sameSite: "lax", // CSRF protection - same-site requests allowed
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Kullanıcı adı veya şifre hatalı" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: "Kullanıcı adı veya şifre hatalı" });
        }

        if (!user.isApproved) {
          return done(null, false, { message: "Hesabınız henüz onaylanmadı" });
        }

        return done(null, {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          isApproved: user.isApproved,
          role: user.role,
          isBanned: user.isBanned,
          isChatMuted: user.isChatMuted,
        });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isApproved: user.isApproved,
        role: user.role,
        isBanned: user.isBanned,
        isChatMuted: user.isChatMuted,
      });
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      return res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isApproved: user.isApproved,
        role: user.role,
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ error: "Kayıt başarısız" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Sunucu hatası" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Giriş başarısız" });
      }
      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ error: "Giriş yapılamadı" });
        }
        
        let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (Array.isArray(ip)) {
          ip = ip[0];
        }
        if (typeof ip === 'string') {
          ip = ip.split(',')[0].trim();
          if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
          }
        }
        
        if (ip && typeof ip === 'string') {
          await storage.updateUser(user.id, { lastIpAddress: ip });
        }
        
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Çıkış yapılamadı" });
      }
      res.json({ message: "Başarıyla çıkış yapıldı" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ error: "Giriş yapılmamış" });
  });
}
