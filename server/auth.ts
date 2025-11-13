import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
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
      saveUninitialized: false, // Don't save uninitialized sessions (empty sessions)
      name: 'connect.sid', // Session cookie name
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-domain cookies in production
        path: "/", // Cookie path - root path
        // Note: domain is not set - browser will automatically send cookie to the domain that set it
        // For cross-domain cookies, domain should NOT be set
        // IMPORTANT: For SameSite=None, Secure must be true (already set above)
        // This is required for cross-domain cookies (www.haxarena.web.tr -> backend.onrender.com)
      },
      // Force session to be saved even if it wasn't modified
      // This ensures cookie is set after req.login()
      rolling: false, // Don't reset expiration on every request
      // IMPORTANT: genid function to ensure unique session IDs
      genid: (req) => {
        return crypto.randomBytes(16).toString('hex');
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
      
      // Not: isApproved kontrolü burada yapılmıyor çünkü:
      // 1. Login sırasında zaten isApproved kontrolü yapılıyor
      // 2. /api/auth/me endpoint'inde isApproved kontrolü yapılıyor ve onaylanmamışsa session temizleniyor
      // 3. deserializeUser sadece session'dan kullanıcıyı yüklemeli
      
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
        
        // Session cookie'sinin set edildiğini logla
        console.log("✅ LOGIN SUCCESS - Session created:", req.sessionID);
        console.log("✅ LOGIN SUCCESS - User:", { id: user.id, username: user.username });
        console.log("✅ LOGIN SUCCESS - Origin:", req.headers.origin);
        console.log("✅ LOGIN SUCCESS - Session exists:", !!req.session);
        console.log("✅ LOGIN SUCCESS - Session regenerated:", req.session.regenerate ? "yes" : "no");
        
        // IP adresini güncelle
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
        
        // CORS headers'ı manuel olarak set et - cookie'nin browser tarafından kabul edilmesi için gerekli
        const origin = req.headers.origin;
        if (origin) {
          // Normalize origin (remove trailing slash)
          const normalizedOrigin = origin.replace(/\/$/, '');
          
          // CORS headers'ı set et - cookie göndermek için kritik
          // IMPORTANT: Access-Control-Allow-Origin must be the exact origin (not wildcard) when credentials are used
          res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          // Debug: Log CORS headers for www.haxarena.web.tr
          if (normalizedOrigin.includes('haxarena.web.tr')) {
            console.log("🌐 LOGIN CORS - Origin:", normalizedOrigin);
            console.log("🌐 LOGIN CORS - Allow-Origin set to:", normalizedOrigin);
            console.log("🌐 LOGIN CORS - Allow-Credentials: true");
          }
        }
        
        // JWT token oluştur - cookie sorunu nedeniyle JWT token kullanıyoruz
        const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "haxarena-v6-secret-key";
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            isSuperAdmin: user.isSuperAdmin,
            isApproved: user.isApproved,
            role: user.role,
            isBanned: user.isBanned,
            isChatMuted: user.isChatMuted,
          },
          jwtSecret,
          { expiresIn: '30d' } // 30 gün geçerli
        );
        
        console.log("✅ LOGIN SUCCESS - JWT token created for user:", user.username);
        
        // CORS headers'ı set et
        const origin = req.headers.origin;
        if (origin) {
          const normalizedOrigin = origin.replace(/\/$/, '');
          res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        
        // Response gönder - JWT token ile birlikte
        return res.json({
          ...user,
          token, // JWT token'ı response'da döndür
        });
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
    // CORS headers'ı set et
    const origin = req.headers.origin;
    if (origin) {
      const normalizedOrigin = origin.replace(/\/$/, '');
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    // JWT token kontrolü - Authorization header'ından token'ı al
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // JWT token varsa, token'ı doğrula
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "haxarena-v6-secret-key";
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        console.log("✅ /api/auth/me - JWT token verified for user:", decoded.username);
        
        // Kullanıcıyı veritabanından tekrar yükle (güncel bilgiler için)
        const user = await storage.getUser(decoded.id);
        if (!user) {
          console.log("⚠️  /api/auth/me - User not found in database:", decoded.id);
          return res.status(401).json({ error: "Kullanıcı bulunamadı" });
        }
        
        // Kullanıcının custom rollerini getir
        const customRoles = await storage.getUserCustomRoles(user.id);
        
        // Güncel kullanıcı bilgilerini döndür
        const userInfo = {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          isApproved: user.isApproved,
          role: user.role,
          isBanned: user.isBanned,
          isChatMuted: user.isChatMuted,
          customRoles: customRoles.map(cr => cr.role),
        };
        
        return res.json(userInfo);
      } catch (error) {
        console.log("⚠️  /api/auth/me - JWT token invalid:", error instanceof Error ? error.message : String(error));
        return res.status(401).json({ error: "Geçersiz token" });
      }
    }
    
    // Eğer token yoksa, cookie'den session kontrolü yap (geriye dönük uyumluluk)
    if (req.isAuthenticated() && req.user) {
      try {
        const user = await storage.getUser(req.user.id);
        if (!user) {
          console.log("⚠️  /api/auth/me - User not found in database:", req.user.id);
          req.logout(() => {});
          return res.status(401).json({ error: "Kullanıcı bulunamadı" });
        }
        
        const customRoles = await storage.getUserCustomRoles(user.id);
        const userInfo = {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          isApproved: user.isApproved,
          role: user.role,
          isBanned: user.isBanned,
          isChatMuted: user.isChatMuted,
          customRoles: customRoles.map(cr => cr.role),
        };
        
        return res.json(userInfo);
      } catch (error) {
        console.error("❌ /api/auth/me ERROR:", error);
        return res.status(500).json({ error: "Kullanıcı bilgileri alınamadı" });
      }
    }
    
    // CORS headers'ı set et (401 response için de gerekli)
    if (origin) {
      const normalizedOrigin = origin.replace(/\/$/, '');
      res.setHeader('Access-Control-Allow-Origin', normalizedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(401).json({ error: "Giriş yapılmamış" });
  });
}
