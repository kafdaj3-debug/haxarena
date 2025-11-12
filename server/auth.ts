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

// IP-based registration rate limiting (30 minutes)
const registrationAttempts = new Map<string, number>();

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      profilePicture?: string | null;
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
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-domain cookies in production (Netlify -> Render)
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
          profilePicture: user.profilePicture,
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
        profilePicture: user.profilePicture,
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

      console.log("📝 REGISTER attempt:", { username, hasPassword: !!password });

      if (!username || !password) {
        console.log("⚠️  REGISTER validation failed: missing credentials");
        return res.status(400).json({ error: "Kullanıcı adı ve şifre gereklidir" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log("⚠️  REGISTER failed: username already exists:", username);
        return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      console.log("✅ REGISTER success:", user.username);
      
      // IP-based rate limiting: Sadece başarılı kayıttan sonra IP'yi kaydet
      let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (Array.isArray(ip)) {
        ip = ip[0];
      }
      if (typeof ip === 'string') {
        ip = ip.split(',')[0].trim();
        if (ip.startsWith('::ffff:')) {
          ip = ip.substring(7);
        }
        registrationAttempts.set(ip, Date.now());
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isApproved: user.isApproved,
        role: user.role,
      });
    } catch (error) {
      console.error("❌ REGISTER ERROR:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      return res.status(500).json({ error: "Kayıt başarısız" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        console.error("❌ LOGIN ERROR:", err);
        console.error("Error stack:", err.stack);
        return res.status(500).json({ error: "Sunucu hatası" });
      }
      if (!user) {
        console.log("⚠️  LOGIN FAILED:", info?.message);
        return res.status(401).json({ error: info?.message || "Giriş başarısız" });
      }
      
      // Ban kontrolü
      const userWithBan = user as any;
      if (userWithBan.isBanned) {
        const banMessage = userWithBan.banReason 
          ? `Hesabınız yasaklandı. Sebep: ${userWithBan.banReason}` 
          : "Hesabınız yasaklandı. Destek ekibi ile iletişime geçin.";
        return res.status(403).json({ error: banMessage });
      }
      
      req.login(user, async (err) => {
        if (err) {
          console.error("❌ SESSION LOGIN ERROR:", err);
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
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Çıkış yapılamadı" });
      }
      
      // Session destroy - optional chaining for safety
      if (req.session && req.session.destroy) {
        req.session.destroy((destroyErr) => {
          if (destroyErr) {
            console.error("Session destroy error:", destroyErr);
          }
          res.clearCookie('connect.sid');
          res.json({ message: "Başarıyla çıkış yapıldı" });
        });
      } else {
        res.clearCookie('connect.sid');
        res.json({ message: "Başarıyla çıkış yapıldı" });
      }
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (req.isAuthenticated()) {
      // Kullanıcının custom rollerini getir
      const customRoles = await storage.getUserCustomRoles(req.user!.id);
      return res.json({
        ...req.user,
        customRoles: customRoles.map(cr => cr.role),
      });
    }
    res.status(401).json({ error: "Giriş yapılmamış" });
  });
}
