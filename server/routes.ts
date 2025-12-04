import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { playerStats, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

function normalizeClientIp(req: any): string {
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
  
  return ip || '';
}

async function checkIpBan(req: any, res: any, next: any) {
  try {
    const clientIp = normalizeClientIp(req);
    
    if (!clientIp) {
      return next();
    }
    
    const banned = await storage.getBannedIpByAddress(clientIp);
    if (banned) {
      return res.status(403).json({ error: "Bu IP adresi engellenmiştir" });
    }
    next();
  } catch (error: any) {
    // If table doesn't exist yet (during initial migration), allow the request
    const errorMessage = error?.message || String(error);
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      console.warn('IP ban check skipped - table not yet created');
      return next();
    }
    // For other errors, log and continue to prevent blocking
    console.error('Error checking IP ban:', error);
    next();
  }
}

// JWT token'dan user bilgisini al
async function getUserFromToken(req: any): Promise<any | null> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || "haxarena-v6-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as any;
      const user = await storage.getUser(decoded.id);
      return user;
    } catch (error) {
      return null;
    }
  }
  return null;
}

async function isAuthenticated(req: any, res: any, next: any) {
  try {
    // Önce JWT token kontrolü yap
    const user = await getUserFromToken(req);
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isApproved: user.isApproved,
        role: user.role,
        isBanned: user.isBanned,
        isChatMuted: user.isChatMuted,
      };
      return next();
    }
    
    // JWT token yoksa, session kontrolü yap (geriye dönük uyumluluk)
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  } catch (error) {
    // JWT token hatası varsa, session kontrolü yap
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: "Giriş yapmalısınız" });
  }
}

function isAdmin(req: any, res: any, next: any) {
  console.log("🔐 isAdmin check:", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    isAdmin: req.user?.isAdmin,
    isSuperAdmin: req.user?.isSuperAdmin
  });
  
  // JWT token veya session kontrolü
  if (req.user && (req.user.isAdmin || req.user.isSuperAdmin)) {
    return next();
  }
  if (req.isAuthenticated() && (req.user.isAdmin || req.user.isSuperAdmin)) {
    return next();
  }
  return res.status(403).json({ error: "Yetkiniz yok" });
}

function isSuperAdmin(req: any, res: any, next: any) {
  // JWT token veya session kontrolü
  if (req.user && req.user.isSuperAdmin) {
    return next();
  }
  if (req.isAuthenticated() && req.user.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ error: "Yetkiniz yok" });
}

function isNotBanned(req: any, res: any, next: any) {
  // JWT token veya session kontrolü
  if (!req.user && !req.isAuthenticated()) {
    return next();
  }
  const user = req.user || (req.isAuthenticated() ? req.user : null);
  if (user && user.isBanned) {
    return res.status(403).json({ error: "Hesabınız yasaklandı. Sebep: " + (user.banReason || "Belirtilmemiş") });
  }
  return next();
}

function isNotChatMuted(req: any, res: any, next: any) {
  // JWT token veya session kontrolü
  if (!req.user && !req.isAuthenticated()) {
    return next();
  }
  const user = req.user || (req.isAuthenticated() ? req.user : null);
  if (user && user.isChatMuted) {
    return res.status(403).json({ error: "Sohbet yazma izniniz kaldırıldı" });
  }
  return next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (for deployment platforms)
  // Railway ve diğer platformlar için
  app.get("/api/health", async (req, res) => {
    try {
      // Simple health check - just return OK if server is running
      return res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      return res.status(500).json({ status: "error" });
    }
  });

  // Root path health check (Railway için alternatif)
  app.get("/", async (req, res) => {
    // Railway health check için root path'e de yanıt ver
    if (req.headers['user-agent']?.includes('Railway') || req.query.health === 'check') {
      return res.json({ status: "ok", service: "gamehubarena-backend" });
    }
    // Normal istekler için frontend'e yönlendir (production'da serveStatic handle eder)
    res.status(200).json({ status: "ok", message: "Backend is running" });
  });

  // IP ban middleware - tüm route'larda kontrol edilir (health check hariç)
  app.use(checkIpBan);
  // Profile routes
  app.get("/api/profile", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Profil yüklenemedi" });
    }
  });

  // User search route
  app.get("/api/users/search", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Arama sorgusu gerekli" });
      }
      
      const users = await storage.searchUsersByUsername(query);
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      return res.json(usersWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı araması başarısız" });
    }
  });

  app.patch("/api/profile/username", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Kullanıcı adı gerekli" });
      }

      const currentUser = await storage.getUser(req.user!.id);
      if (!currentUser) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      // 1 aylık nick değiştirme limiti (Admin ve yönetim hariç)
      const isExempt = currentUser.isAdmin || currentUser.isSuperAdmin;
      if (!isExempt && currentUser.lastUsernameChange) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        if (new Date(currentUser.lastUsernameChange) > oneMonthAgo) {
          const nextChangeDate = new Date(currentUser.lastUsernameChange);
          nextChangeDate.setMonth(nextChangeDate.getMonth() + 1);
          const daysRemaining = Math.ceil((nextChangeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return res.status(429).json({ 
            error: `Kullanıcı adını değiştirmek için ${daysRemaining} gün beklemeniz gerekiyor.` 
          });
        }
      }

      const existing = await storage.getUserByUsername(username);
      if (existing && existing.id !== req.user!.id) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const updated = await storage.updateUser(req.user!.id, { 
        username,
        lastUsernameChange: new Date()
      });
      if (!updated) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      const { password, ...userWithoutPassword } = updated;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı adı güncellenemedi" });
    }
  });

  app.patch("/api/profile/password", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Mevcut ve yeni şifre gerekli" });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Mevcut şifre hatalı" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.user!.id, { password: hashedPassword });

      return res.json({ message: "Şifre güncellendi" });
    } catch (error) {
      return res.status(500).json({ error: "Şifre güncellenemedi" });
    }
  });

  app.patch("/api/profile/picture", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { profilePicture } = req.body;
      
      // Allow null to remove picture, otherwise validate
      if (profilePicture !== null && profilePicture !== undefined) {
        // Validate base64 image format
        if (!profilePicture.startsWith('data:image/')) {
          return res.status(400).json({ error: "Geçersiz resim formatı" });
        }
        
        // 5MB size limit: decode base64 to get actual file size
        const base64Data = profilePicture.split(',')[1];
        if (!base64Data) {
          return res.status(400).json({ error: "Geçersiz base64 verisi" });
        }
        
        // Calculate decoded size (base64 is ~33% larger than raw data)
        const sizeInBytes = (base64Data.length * 3) / 4;
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        
        if (sizeInBytes > MAX_SIZE) {
          return res.status(400).json({ error: "Resim çok büyük (maksimum 5MB)" });
        }
      }

      const updated = await storage.updateUser(req.user!.id, { profilePicture });
      if (!updated) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      const { password, ...userWithoutPassword } = updated;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error('Profile picture update error:', error);
      return res.status(500).json({ error: "Profil fotoğrafı güncellenemedi" });
    }
  });

  // Admin application routes
  app.post("/api/applications/admin", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings.adminApplicationsOpen) {
        return res.status(403).json({ error: "Admin başvuruları şu anda kapalı" });
      }

      const { name, age, gameNick, discordNick, playDuration, activeServers, previousExperience, dailyHours, activeTimeZones, aboutYourself } = req.body;
      
      if (!name || !age || !gameNick || !discordNick || !playDuration || !activeServers || !previousExperience || !dailyHours || !activeTimeZones || !aboutYourself) {
        return res.status(400).json({ error: "Tüm alanları doldurun" });
      }

      const existing = await storage.getUserAdminApplications(req.user!.id);
      const hasPending = existing.some(app => app.status === "pending");
      if (hasPending) {
        return res.status(400).json({ error: "Bekleyen bir başvurunuz var" });
      }

      const application = await storage.createAdminApplication({
        userId: req.user!.id,
        name,
        age,
        gameNick,
        discordNick,
        playDuration,
        activeServers,
        previousExperience,
        dailyHours,
        activeTimeZones,
        aboutYourself,
      });

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru oluşturulamadı" });
    }
  });

  app.get("/api/applications/admin", isAdmin, async (req, res) => {
    try {
      const applications = await storage.getAdminApplications();
      const users = await storage.getAllUsers();
      const usersMap = new Map(users.map(u => [u.id, u]));

      const applicationsWithUser = applications.map(app => ({
        ...app,
        user: usersMap.get(app.userId),
      }));

      return res.json(applicationsWithUser);
    } catch (error) {
      return res.status(500).json({ error: "Başvurular yüklenemedi" });
    }
  });

  app.get("/api/applications/admin/my", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const applications = await storage.getUserAdminApplications(req.user!.id);
      return res.json(applications);
    } catch (error) {
      return res.status(500).json({ error: "Başvurular yüklenemedi" });
    }
  });

  app.patch("/api/applications/admin/:id", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Geçersiz durum" });
      }

      const application = await storage.updateAdminApplication(req.params.id, status);
      if (!application) {
        return res.status(404).json({ error: "Başvuru bulunamadı" });
      }

      if (status === "approved") {
        const user = await storage.getUser(application.userId);
        await storage.updateUser(application.userId, { isAdmin: true, role: "Arena Admin" });
        
        // Add to staff roles if not already exists
        if (user) {
          await storage.createStaffRole({
            name: user.username,
            role: "Arena Admin",
            managementAccess: false,
          });
        }
        
        await storage.createNotification({
          userId: application.userId,
          message: "Admin başvurunuz onaylandı! Artık admin yetkileriniz var.",
        });
      } else {
        await storage.createNotification({
          userId: application.userId,
          message: "Admin başvurunuz reddedildi.",
        });
      }

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru güncellenemedi" });
    }
  });

  app.delete("/api/applications/admin/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAdminApplication(req.params.id);
      return res.json({ message: "Başvuru silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Başvuru silinemedi" });
    }
  });

  // Team application routes
  app.post("/api/applications/team", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings.teamApplicationsOpen) {
        return res.status(403).json({ error: "Takım başvuruları şu anda kapalı" });
      }

      const { teamName, teamLogo, description, captain1, captain2, viceCaptain, players } = req.body;
      if (!teamName || !description) {
        return res.status(400).json({ error: "Takım adı ve açıklama gerekli" });
      }

      const application = await storage.createTeamApplication({
        userId: req.user!.id,
        teamName,
        teamLogo: teamLogo || null,
        description,
        captain1: captain1 || null,
        captain2: captain2 || null,
        viceCaptain: viceCaptain || null,
        players: players || [],
      });

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru oluşturulamadı" });
    }
  });

  app.get("/api/applications/team", async (req, res) => {
    try {
      const applications = await storage.getTeamApplications();
      const users = await storage.getAllUsers();
      const usersMap = new Map(users.map(u => [u.id, u]));

      const applicationsWithUser = applications.map(app => ({
        ...app,
        user: usersMap.get(app.userId),
      }));

      return res.json(applicationsWithUser);
    } catch (error) {
      return res.status(500).json({ error: "Başvurular yüklenemedi" });
    }
  });

  app.get("/api/applications/team/my", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const applications = await storage.getUserTeamApplications(req.user!.id);
      return res.json(applications);
    } catch (error) {
      return res.status(500).json({ error: "Başvurular yüklenemedi" });
    }
  });

  app.patch("/api/applications/team/:id", isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Geçersiz durum" });
      }

      const application = await storage.updateTeamApplication(req.params.id, status);
      if (!application) {
        return res.status(404).json({ error: "Başvuru bulunamadı" });
      }

      if (status === "approved") {
        await storage.createNotification({
          userId: application.userId,
          message: `Takım başvurunuz (${application.teamName}) onaylandı!`,
        });
      } else {
        await storage.createNotification({
          userId: application.userId,
          message: `Takım başvurunuz (${application.teamName}) reddedildi.`,
        });
      }

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru güncellenemedi" });
    }
  });

  app.delete("/api/applications/team/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteTeamApplication(req.params.id);
      return res.json({ message: "Başvuru silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Başvuru silinemedi" });
    }
  });

  // Management routes (Super Admin only)
  app.get("/api/management/users", isSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Her kullanıcı için custom role'lerini getir
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const { password, ...userWithoutPassword } = user;
          const customRoles = await storage.getUserCustomRoles(user.id);
          return {
            ...userWithoutPassword,
            customRoles: customRoles.map(cr => cr.role),
          };
        })
      );
      return res.json(usersWithRoles);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcılar yüklenemedi" });
    }
  });

  app.patch("/api/management/users/:id/approve", isSuperAdmin, async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { 
        isApproved: true,
        role: "HaxArena Üye" 
      });
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı onaylanamadı" });
    }
  });

  app.patch("/api/management/users/:id/reject", isSuperAdmin, async (req, res) => {
    try {
      // Reddetme işlemi: Kullanıcıyı sil
      if (req.params.id === req.user!.id) {
        return res.status(400).json({ error: "Kendi hesabınızı reddedemezsiniz" });
      }
      await storage.deleteUser(req.params.id);
      return res.json({ message: "Kullanıcı reddedildi ve silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı reddedilemedi" });
    }
  });

  app.post("/api/management/create-admin", isSuperAdmin, async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
      }

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Set admin flags and role
      const newAdmin = await storage.updateUser(newUser.id, {
        isAdmin: true,
        isApproved: true,
        role: "HaxArena Üye",
      });

      const { password: _, ...adminWithoutPassword } = newAdmin!;
      return res.status(201).json(adminWithoutPassword);
    } catch (error) {
      console.error("[CREATE ADMIN ERROR]", error);
      return res.status(500).json({ error: "Admin oluşturulamadı" });
    }
  });

  app.delete("/api/management/users/:id", isSuperAdmin, async (req, res) => {
    try {
      // Kullanıcı kendi hesabını silemez
      console.log(`[DELETE USER] Attempting to delete user ${req.params.id}, current user: ${req.user?.id}`);
      if (req.params.id === req.user!.id) {
        console.log(`[DELETE USER] Blocked: User trying to delete themselves`);
        return res.status(400).json({ error: "Kendi hesabınızı silemezsiniz" });
      }
      await storage.deleteUser(req.params.id);
      console.log(`[DELETE USER] Successfully deleted user ${req.params.id}`);
      return res.json({ message: "Kullanıcı silindi" });
    } catch (error) {
      console.error(`[DELETE USER] Error:`, error);
      return res.status(500).json({ error: "Kullanıcı silinemedi" });
    }
  });

  app.patch("/api/management/users/:id/role", isSuperAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const validRoles = ["DIAMOND VIP", "GOLD VIP", "SILVER VIP", "Lig Oyuncusu", "HaxArena Üye"];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: "Geçersiz rol" });
      }

      const user = await storage.updateUser(req.params.id, { role });
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Rol güncellenemedi" });
    }
  });

  app.patch("/api/management/users/:id/admin", isSuperAdmin, async (req, res) => {
    try {
      const { isAdmin } = req.body;
      if (typeof isAdmin !== "boolean") {
        return res.status(400).json({ error: "Geçersiz değer" });
      }

      const user = await storage.updateUser(req.params.id, { isAdmin });
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Admin yetkisi güncellenemedi" });
    }
  });

  app.patch("/api/management/users/:id", isSuperAdmin, async (req, res) => {
    try {
      const updates: Partial<any> = {};
      
      if (typeof req.body.isBanned === "boolean") {
        updates.isBanned = req.body.isBanned;
        updates.banReason = req.body.banReason || null;
      }
      
      if (typeof req.body.isChatMuted === "boolean") {
        updates.isChatMuted = req.body.isChatMuted;
      }
      
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı güncellenemedi" });
    }
  });

  app.patch("/api/management/users/:id/player-role", isSuperAdmin, async (req, res) => {
    try {
      const { playerRole } = req.body;
      
      const user = await storage.updateUser(req.params.id, { playerRole: playerRole || null });
      if (!user) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Oyuncu rolü güncellenemedi" });
    }
  });

  // Staff role routes
  app.post("/api/staff-roles", isAdmin, async (req, res) => {
    try {
      const { name, role, managementAccess } = req.body;
      if (!name || !role) {
        return res.status(400).json({ error: "İsim ve rol gerekli" });
      }

      const staffRole = await storage.createStaffRole({
        name,
        role,
        managementAccess: managementAccess || false,
      });

      return res.json(staffRole);
    } catch (error) {
      return res.status(500).json({ error: "Staff rolü oluşturulamadı" });
    }
  });

  app.get("/api/staff-roles", async (req, res) => {
    try {
      const staffRoles = await storage.getStaffRoles();
      return res.json(staffRoles);
    } catch (error) {
      return res.status(500).json({ error: "Staff rolleri yüklenemedi" });
    }
  });

  app.patch("/api/staff-roles/:id", isAdmin, async (req, res) => {
    try {
      const { managementAccess } = req.body;
      if (typeof managementAccess !== "boolean") {
        return res.status(400).json({ error: "Geçersiz değer" });
      }

      const staffRole = await storage.updateStaffRole(req.params.id, { managementAccess });
      if (!staffRole) {
        return res.status(404).json({ error: "Staff rolü bulunamadı" });
      }
      return res.json(staffRole);
    } catch (error) {
      return res.status(500).json({ error: "Staff rolü güncellenemedi" });
    }
  });

  app.delete("/api/staff-roles/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteStaffRole(req.params.id);
      return res.json({ message: "Staff rolü silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Staff rolü silinemedi" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      return res.json(notifications);
    } catch (error) {
      return res.status(500).json({ error: "Bildirimler yüklenemedi" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      return res.json({ message: "Bildirim okundu olarak işaretlendi" });
    } catch (error) {
      return res.status(500).json({ error: "Bildirim güncellenemedi" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      return res.json({ message: "Bildirim silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Bildirim silinemedi" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: "Ayarlar yüklenemedi" });
    }
  });

  app.patch("/api/settings", isSuperAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: "Ayarlar güncellenemedi" });
    }
  });

  // Forum routes
  app.post("/api/forum-posts", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { title, content, category, imageUrl } = req.body;
      
      // Validate required fields
      if (!title || typeof title !== 'string' || title.trim().length < 5) {
        return res.status(400).json({ error: "Başlık en az 5 karakter olmalıdır" });
      }
      if (!content || typeof content !== 'string' || content.trim().length < 10) {
        return res.status(400).json({ error: "İçerik en az 10 karakter olmalıdır" });
      }
      if (!category || typeof category !== 'string' || category.trim().length === 0) {
        return res.status(400).json({ error: "Kategori seçiniz" });
      }
      
      // Convert empty string to undefined for optional imageUrl
      const postData: any = {
        userId: req.user!.id,
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
      };
      
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
        postData.imageUrl = imageUrl.trim();
      }
      
      const post = await storage.createForumPost(postData);
      return res.json(post);
    } catch (error: any) {
      console.error("Error creating forum post:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        constraint: error?.constraint,
        detail: error?.detail,
        stack: error?.stack,
      });
      return res.status(500).json({ 
        error: "Konu oluşturulamadı", 
        details: error?.message || error?.detail || "Bilinmeyen hata" 
      });
    }
  });

  app.get("/api/forum-posts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const includeArchived = req.isAuthenticated() && req.user && (req.user.isAdmin || req.user.isSuperAdmin);
      
      // Try to get posts, if it fails return empty array instead of error
      let posts;
      try {
        posts = await storage.getForumPosts(category, includeArchived);
      } catch (postsError: any) {
        console.error("Error getting forum posts from storage:", postsError);
        console.error("Error message:", postsError?.message);
        console.error("Error code:", postsError?.code);
        console.error("Error detail:", postsError?.detail);
        console.error("Error constraint:", postsError?.constraint);
        console.error("Error stack:", postsError?.stack);
        // Return empty array instead of error
        return res.json([]);
      }
      
      // If no posts, return empty array
      if (!posts || posts.length === 0) {
        return res.json([]);
      }
      
      let staffRoles = [];
      try {
        staffRoles = await storage.getStaffRoles();
      } catch (staffError: any) {
        console.error("Error getting staff roles:", staffError);
        // Continue without staff roles
      }
      
      const staffMap = new Map(staffRoles.map((s: any) => [s.name, s.role]));
      
      // Her post için kullanıcının custom rollerini getir
      const postsWithRoles = await Promise.all(
        posts.map(async (post) => {
          try {
            const customRoles = await storage.getUserCustomRoles(post.user.id);
            return {
              ...post,
              staffRole: staffMap.get(post.user.username) || null,
              customRoles: customRoles.map(cr => cr.role),
            };
          } catch (roleError: any) {
            // Custom roles hatası varsa, roles olmadan devam et
            console.error("Error getting custom roles for user:", post.user.id, roleError);
            return {
              ...post,
              staffRole: staffMap.get(post.user.username) || null,
              customRoles: [],
            };
          }
        })
      );
      
      return res.json(postsWithRoles);
    } catch (error: any) {
      console.error("Error in /api/forum-posts route:", error);
      console.error("Error message:", error?.message);
      console.error("Error code:", error?.code);
      console.error("Error detail:", error?.detail);
      console.error("Error stack:", error?.stack);
      // Return empty array instead of error to prevent frontend crash
      return res.json([]);
    }
  });

  app.get("/api/forum-posts/:id", async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Konu bulunamadı" });
      }
      
      const staffRoles = await storage.getStaffRoles();
      const staffMap = new Map(staffRoles.map(s => [s.name, s.role]));
      const customRoles = await storage.getUserCustomRoles(post.user.id);
      
      const postWithRoles = {
        ...post,
        staffRole: staffMap.get(post.user.username) || null,
        customRoles: customRoles.map(cr => cr.role),
      };
      
      return res.json(postWithRoles);
    } catch (error) {
      return res.status(500).json({ error: "Konu yüklenemedi" });
    }
  });

  app.patch("/api/forum-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const { isLocked, isArchived, title, content } = req.body;
      const post = await storage.getForumPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Konu bulunamadı" });
      }
      
      // Only post owner can archive, only admins can lock
      const isOwner = post.userId === req.user!.id;
      const isAdminUser = req.user!.isAdmin || req.user!.isSuperAdmin;
      
      const updates: Partial<{ isLocked: boolean; isArchived: boolean; title: string; content: string; editedAt: Date }> = {};
      
      // Sadece post sahibi title ve content düzenleyebilir
      if (isOwner && title) {
        updates.title = title;
        updates.editedAt = new Date();
      }
      if (isOwner && content) {
        updates.content = content;
        updates.editedAt = new Date();
      }
      
      if (typeof isLocked === "boolean" && isAdminUser) {
        updates.isLocked = isLocked;
      }
      
      if (typeof isArchived === "boolean") {
        // Arşivden çıkarma sadece yönetim yapabilir
        if (isArchived === false && post.isArchived) {
          if (!isAdminUser) {
            return res.status(403).json({ error: "Arşivden çıkarma yetkiniz yok" });
          }
        }
        // Arşivleme: sahibi veya admin yapabilir
        if (isArchived === true && (isOwner || isAdminUser)) {
          updates.isArchived = isArchived;
        }
        // Arşivden çıkarma: sadece admin
        if (isArchived === false && isAdminUser) {
          updates.isArchived = isArchived;
        }
      }

      const updatedPost = await storage.updateForumPost(req.params.id, updates);
      return res.json(updatedPost);
    } catch (error) {
      return res.status(500).json({ error: "Konu güncellenemedi" });
    }
  });

  app.delete("/api/forum-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Konu bulunamadı" });
      }
      
      // Only post owner or admin can delete
      const isOwner = post.userId === req.user!.id;
      const isAdminUser = req.user!.isAdmin || req.user!.isSuperAdmin;
      
      if (!isOwner && !isAdminUser) {
        return res.status(403).json({ error: "Bu konuyu silme yetkiniz yok" });
      }
      
      await storage.deleteForumPost(req.params.id);
      return res.json({ message: "Konu silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Konu silinemedi" });
    }
  });

  app.post("/api/forum-posts/:id/replies", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { content, imageUrl, quotedReplyId } = req.body;
      
      // Check if post is locked or archived
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Konu bulunamadı" });
      }
      
      if (post.isLocked) {
        return res.status(403).json({ error: "Bu konu kilitlenmiştir. Yeni cevap eklenemez." });
      }
      
      if (post.isArchived) {
        return res.status(403).json({ error: "Bu konu arşivlenmiştir. Yeni cevap eklenemez." });
      }
      
      const reply = await storage.createForumReply({
        postId: req.params.id,
        userId: req.user!.id,
        content,
        imageUrl,
        quotedReplyId,
      });
      return res.json(reply);
    } catch (error) {
      return res.status(500).json({ error: "Cevap oluşturulamadı" });
    }
  });

  app.get("/api/forum-posts/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.id);
      const staffRoles = await storage.getStaffRoles();
      const staffMap = new Map(staffRoles.map(s => [s.name, s.role]));
      
      // Her reply için kullanıcının custom rollerini getir
      const repliesWithRoles = await Promise.all(
        replies.map(async (reply) => {
          const customRoles = await storage.getUserCustomRoles(reply.user.id);
          return {
            ...reply,
            staffRole: staffMap.get(reply.user.username) || null,
            customRoles: customRoles.map(cr => cr.role),
          };
        })
      );
      
      return res.json(repliesWithRoles);
    } catch (error) {
      return res.status(500).json({ error: "Cevaplar yüklenemedi" });
    }
  });

  app.patch("/api/forum-replies/:id", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      const reply = await storage.getForumReply(req.params.id);
      
      if (!reply) {
        return res.status(404).json({ error: "Cevap bulunamadı" });
      }
      
      // Sadece reply sahibi düzenleyebilir
      const isOwner = reply.userId === req.user!.id;
      
      if (!isOwner) {
        return res.status(403).json({ error: "Bu cevabı düzenleme yetkiniz yok" });
      }
      
      if (!content) {
        return res.status(400).json({ error: "İçerik gerekli" });
      }
      
      const updatedReply = await storage.updateForumReply(req.params.id, { 
        content,
        editedAt: new Date()
      });
      return res.json(updatedReply);
    } catch (error) {
      return res.status(500).json({ error: "Cevap güncellenemedi" });
    }
  });

  app.delete("/api/forum-replies/:id", isAuthenticated, async (req, res) => {
    try {
      const reply = await storage.getForumReply(req.params.id);
      
      if (!reply) {
        return res.status(404).json({ error: "Cevap bulunamadı" });
      }
      
      // Reply sahibi veya admin silebilir
      const isOwner = reply.userId === req.user!.id;
      const isAdminUser = req.user!.isAdmin || req.user!.isSuperAdmin;
      
      if (!isOwner && !isAdminUser) {
        return res.status(403).json({ error: "Bu cevabı silme yetkiniz yok" });
      }
      
      await storage.deleteForumReply(req.params.id);
      return res.json({ message: "Cevap silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Cevap silinemedi" });
    }
  });

  // Chat routes
  const userLastMessageTime = new Map<string, number>();

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(50);
      const staffRoles = await storage.getStaffRoles();
      const staffMap = new Map(staffRoles.map(s => [s.name, s.role]));
      
      // Her mesaj için kullanıcının custom rollerini getir
      const messagesWithRoles = await Promise.all(
        messages.map(async (msg) => {
          const customRoles = await storage.getUserCustomRoles(msg.user.id);
          return {
            ...msg,
            staffRole: staffMap.get(msg.user.username) || null,
            customRoles: customRoles.map(cr => cr.role),
          };
        })
      );
      
      return res.json(messagesWithRoles);
    } catch (error) {
      return res.status(500).json({ error: "Mesajlar yüklenemedi" });
    }
  });

  app.post("/api/chat/messages", isAuthenticated, isNotBanned, isNotChatMuted, async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Mesaj boş olamaz" });
      }

      // Rate limiting: 5 saniye (Admin, Yönetim ve VIP'ler hariç)
      const currentUser = await storage.getUser(req.user!.id);
      const isExemptFromRateLimit = currentUser?.isAdmin || 
                                     currentUser?.role?.includes('VIP');
      
      if (!isExemptFromRateLimit) {
        const userId = req.user!.id;
        const now = Date.now();
        const lastMessageTime = userLastMessageTime.get(userId) || 0;
        
        if (now - lastMessageTime < 5000) {
          const remainingSeconds = Math.ceil((5000 - (now - lastMessageTime)) / 1000);
          return res.status(429).json({ 
            error: `Lütfen ${remainingSeconds} saniye bekleyin` 
          });
        }

        userLastMessageTime.set(userId, now);
      }

      const chatMessage = await storage.createChatMessage({
        userId: req.user!.id,
        message: message.trim(),
      });

      const [user] = await Promise.all([
        storage.getUser(req.user!.id)
      ]);

      return res.json({ ...chatMessage, user });
    } catch (error) {
      return res.status(500).json({ error: "Mesaj gönderilemedi" });
    }
  });

  app.delete("/api/chat/messages/:id", async (req, res) => {
    try {
      if (!req.user || (!req.user.isAdmin && !req.user.isSuperAdmin)) {
        return res.status(403).json({ error: "Yetkiniz yok" });
      }

      await storage.deleteChatMessage(req.params.id);
      return res.json({ message: "Mesaj silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Mesaj silinemedi" });
    }
  });

  // IP Ban routes
  app.get("/api/banned-ips", isSuperAdmin, async (req, res) => {
    try {
      const bannedIps = await storage.getBannedIps();
      return res.json(bannedIps);
    } catch (error) {
      return res.status(500).json({ error: "IP listesi yüklenemedi" });
    }
  });

  app.post("/api/banned-ips", isSuperAdmin, async (req, res) => {
    try {
      const { ipAddress, reason } = req.body;
      if (!ipAddress) {
        return res.status(400).json({ error: "IP adresi gerekli" });
      }

      const existing = await storage.getBannedIpByAddress(ipAddress);
      if (existing) {
        return res.status(400).json({ error: "Bu IP adresi zaten engellenmiş" });
      }

      const bannedIp = await storage.createBannedIp({
        ipAddress,
        reason: reason || null,
        bannedBy: req.user!.id,
      });

      return res.json(bannedIp);
    } catch (error) {
      return res.status(500).json({ error: "IP engellenemedi" });
    }
  });

  app.delete("/api/banned-ips/:id", isSuperAdmin, async (req, res) => {
    try {
      await storage.deleteBannedIp(req.params.id);
      return res.json({ message: "IP ban kaldırıldı" });
    } catch (error) {
      return res.status(500).json({ error: "IP ban kaldırılamadı" });
    }
  });

  // Password reset routes
  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Kullanıcı adı gerekli" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı göster
        return res.json({ message: "Şifre sıfırlama talebi alındı" });
      }

      // Eski tokenları sil
      await storage.deleteUserPasswordResetTokens(user.id);

      // Yeni token oluştur (6 haneli rastgele kod)
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // TODO: Token'ı kullanıcıya göster veya gönder (şimdilik response'da döndürüyoruz)
      return res.json({ message: "Şifre sıfırlama kodu: " + token });
    } catch (error) {
      return res.status(500).json({ error: "İşlem başarısız" });
    }
  });

  app.post("/api/password-reset/verify", async (req, res) => {
    try {
      const { username, token, newPassword } = req.body;
      if (!username || !token || !newPassword) {
        return res.status(400).json({ error: "Tüm alanları doldurun" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ error: "Geçersiz bilgiler" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.userId !== user.id) {
        return res.status(400).json({ error: "Geçersiz kod" });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.deletePasswordResetToken(resetToken.id);
        return res.status(400).json({ error: "Kod süresi dolmuş" });
      }

      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });

      // Token'ı sil
      await storage.deletePasswordResetToken(resetToken.id);

      return res.json({ message: "Şifre başarıyla değiştirildi" });
    } catch (error) {
      return res.status(500).json({ error: "Şifre değiştirilemedi" });
    }
  });

  // Private message routes
  app.post("/api/private-messages", isAuthenticated, isNotBanned, async (req, res) => {
    try {
      const { receiverId, message, imageUrl } = req.body;
      
      if (!receiverId || (!message && !imageUrl)) {
        return res.status(400).json({ error: "Alıcı ve mesaj veya görsel gerekli" });
      }

      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      // Validate image size if provided
      if (imageUrl) {
        if (!imageUrl.startsWith('data:image/')) {
          return res.status(400).json({ error: "Geçersiz görsel formatı" });
        }

        const base64Data = imageUrl.split(',')[1];
        if (!base64Data) {
          return res.status(400).json({ error: "Geçersiz görsel verisi" });
        }

        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (sizeInBytes > maxSize) {
          return res.status(400).json({ error: "Görsel boyutu 5MB'den küçük olmalıdır" });
        }
      }

      const pm = await storage.sendPrivateMessage({
        senderId: req.user!.id,
        receiverId,
        message: message || "",
        imageUrl: imageUrl || null,
      });

      return res.json(pm);
    } catch (error: any) {
      console.error("Error sending private message:", error);
      console.error("Error message:", error?.message);
      console.error("Error code:", error?.code);
      console.error("Error detail:", error?.detail);
      console.error("Error constraint:", error?.constraint);
      console.error("Error stack:", error?.stack);
      return res.status(500).json({ 
        error: "Mesaj gönderilemedi", 
        details: error?.message || error?.detail || "Bilinmeyen hata" 
      });
    }
  });

  app.get("/api/private-messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user!.id);
      return res.json(conversations);
    } catch (error) {
      return res.status(500).json({ error: "Konuşmalar yüklenemedi" });
    }
  });

  app.get("/api/private-messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(req.user!.id);
      return res.json({ count });
    } catch (error) {
      return res.status(500).json({ error: "Sayı alınamadı" });
    }
  });

  app.get("/api/private-messages/:otherUserId", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.user!.id, req.params.otherUserId);
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ error: "Mesajlar yüklenemedi" });
    }
  });

  app.patch("/api/private-messages/:messageId/read", isAuthenticated, async (req, res) => {
    try {
      await storage.markMessageAsRead(req.params.messageId);
      return res.json({ message: "Mesaj okundu olarak işaretlendi" });
    } catch (error) {
      return res.status(500).json({ error: "İşlem başarısız" });
    }
  });

  // Player statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlayerStats();
      // Remove sensitive data and add DM/CS (not in database, set to 0)
      const sanitized = stats.map(user => {
        const { password, lastIpAddress, ...safe } = user;
        return {
          ...safe,
          dm: 0,
          cs: 0
        };
      });
      return res.json(sanitized);
    } catch (error) {
      return res.status(500).json({ error: "İstatistikler yüklenemedi" });
    }
  });

  app.patch("/api/stats/:userId", isAdmin, async (req, res) => {
    try {
      const { goals, assists, saves, matchTime, offlineTime, rank } = req.body;
      
      // Filter out undefined values to prevent NULL constraint violations
      const updates: any = {};
      if (goals !== undefined) updates.goals = goals;
      if (assists !== undefined) updates.assists = assists;
      if (saves !== undefined) updates.saves = saves;
      if (matchTime !== undefined) updates.matchTime = matchTime;
      if (offlineTime !== undefined) updates.offlineTime = offlineTime;
      if (rank !== undefined) updates.rank = rank;
      
      const updated = await storage.updatePlayerStats(req.params.userId, updates);
      
      if (!updated) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }
      
      const { password, ...userWithoutPassword } = updated;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "İstatistikler güncellenemedi" });
    }
  });

  // Player detail by username
  app.get("/api/players/:username", async (req, res) => {
    try {
      const player = await storage.getPlayerByUsername(req.params.username);
      
      if (!player) {
        return res.status(404).json({ error: "Oyuncu bulunamadı" });
      }

      // Get all players ranking to calculate position
      const allPlayers = await storage.getPlayersRanking();
      const playerIndex = allPlayers.findIndex(p => p.id === player.id);
      const ranking = playerIndex !== -1 ? playerIndex + 1 : 0;

      // Remove sensitive data
      const { password, lastIpAddress, ...playerData } = player;
      
      return res.json({
        ...playerData,
        ranking,
        totalPlayers: allPlayers.length
      });
    } catch (error) {
      console.error("Error in /api/players/:username:", error);
      return res.status(500).json({ error: "Oyuncu detayı yüklenemedi" });
    }
  });

  // Players ranking
  app.get("/api/players/ranking", async (req, res) => {
    try {
      const ranking = await storage.getPlayersRanking();
      // Remove sensitive data
      const sanitized = ranking.map(user => {
        const { password, lastIpAddress, ...safe } = user;
        return safe;
      });
      return res.json(sanitized);
    } catch (error) {
      return res.status(500).json({ error: "Sıralama yüklenemedi" });
    }
  });

  // ====== LEAGUE ROUTES ======
  
  // Get all league teams (standings)
  app.get("/api/league/teams", async (req, res) => {
    try {
      const teams = await storage.getLeagueTeams();
      return res.json(teams);
    } catch (error) {
      console.error("Error getting league teams:", error);
      return res.status(500).json({ error: "Puan durumu yüklenemedi" });
    }
  });

  // Get all fixtures
  app.get("/api/league/fixtures", async (req, res) => {
    try {
      // getLeagueFixtures now includes goals, so we can directly return it
      const fixtures = await storage.getLeagueFixtures();
      return res.json(fixtures);
    } catch (error: any) {
      console.error("Error getting fixtures:", error);
      // Check if error is about missing column
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("referee") || errorMessage.includes("column") || errorMessage.includes("does not exist")) {
        console.error("⚠️ Database migration needed: 'referee' column is missing in league_fixtures table");
        console.error("Run: ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS referee TEXT;");
        return res.status(500).json({ 
          error: "Veritabanı migration'ı gerekli. 'referee' kolonu eksik. Lütfen migration çalıştırın veya SQL: ALTER TABLE league_fixtures ADD COLUMN IF NOT EXISTS referee TEXT;"
        });
      }
      return res.status(500).json({ error: "Fikstür yüklenemedi", details: errorMessage });
    }
  });

  // Create team (super admin only)
  app.post("/api/league/teams", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { name, logo } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Takım adı gereklidir" });
      }
      const team = await storage.createLeagueTeam({ name, logo });
      return res.json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      return res.status(500).json({ error: "Takım oluşturulamadı" });
    }
  });

  // Update team (super admin only)
  app.patch("/api/league/teams/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const team = await storage.updateLeagueTeam(id, updates);
      return res.json(team);
    } catch (error) {
      console.error("Error updating team:", error);
      return res.status(500).json({ error: "Takım güncellenemedi" });
    }
  });

  // Delete team (super admin only)
  app.delete("/api/league/teams/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLeagueTeam(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting team:", error);
      return res.status(500).json({ error: "Takım silinemedi" });
    }
  });

  // Create fixture (super admin only)
  app.post("/api/league/fixtures", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { homeTeamId, awayTeamId, matchDate, week, isBye, byeSide } = req.body;
      
      // BAY geçme durumu kontrolü
      if (isBye) {
        // BAY geçme için byeSide gereklidir
        if (!byeSide || (byeSide !== "home" && byeSide !== "away")) {
          return res.status(400).json({ error: "BAY geçme tarafı belirtilmelidir (home veya away)" });
        }
        // BAY geçen tarafın takımı null olmalı, diğer taraf seçilmeli
        if (byeSide === "home") {
          if (!awayTeamId) {
            return res.status(400).json({ error: "Deplasman takımı seçilmelidir" });
          }
          if (homeTeamId) {
            return res.status(400).json({ error: "BAY geçen takım (ev sahibi) seçilmemelidir" });
          }
        } else {
          if (!homeTeamId) {
            return res.status(400).json({ error: "Ev sahibi takım seçilmelidir" });
          }
          if (awayTeamId) {
            return res.status(400).json({ error: "BAY geçen takım (deplasman) seçilmemelidir" });
          }
        }
      } else {
        // Normal maç için her iki takım da gereklidir
        if (!homeTeamId || !awayTeamId || !matchDate || !week) {
          return res.status(400).json({ error: "Tüm alanlar gereklidir" });
        }
      }
      
      // Parse matchDate as Turkey local time (GMT+3)
      // Input format: "2025-01-30T20:00"
      // We need to convert this to UTC for database storage
      let turkeyDate: Date;
      if (matchDate) {
        const [datePart, timePart] = matchDate.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        
        // Create date in UTC, then subtract 3 hours to convert Turkey time to UTC
        turkeyDate = new Date(Date.UTC(year, month - 1, day, hour - 3, minute, 0));
      } else {
        // BAY geçme için tarih yoksa bugünü kullan
        turkeyDate = new Date();
      }
      
      const fixture = await storage.createLeagueFixture({ 
        homeTeamId: isBye && byeSide === "home" ? null : (homeTeamId || undefined), // BAY geçme için null
        awayTeamId: isBye && byeSide === "away" ? null : (awayTeamId || undefined), // BAY geçme için null
        matchDate: turkeyDate, 
        week,
        isBye: isBye || false,
        byeSide: byeSide || null
      });
      return res.json(fixture);
    } catch (error) {
      console.error("Error creating fixture:", error);
      return res.status(500).json({ error: "Maç oluşturulamadı" });
    }
  });

  // Update fixture date (super admin only)
  app.patch("/api/league/fixtures/:id/date", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { matchDate } = req.body;
      
      if (!matchDate) {
        // Ensure CORS headers are set even on error
        const origin = req.headers.origin;
        if (origin) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        return res.status(400).json({ error: "Maç tarihi gereklidir" });
      }

      // Parse matchDate as Turkey local time (GMT+3)
      const [datePart, timePart] = matchDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date in UTC, then subtract 3 hours to convert Turkey time to UTC
      const turkeyDate = new Date(Date.UTC(year, month - 1, day, hour - 3, minute, 0));

      const fixture = await storage.updateLeagueFixtureDate(id, turkeyDate);
      
      // Ensure CORS headers are set on success
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      
      return res.json(fixture);
    } catch (error) {
      console.error("Error updating fixture date:", error);
      
      // Ensure CORS headers are set even on error
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      
      return res.status(500).json({ error: "Maç tarihi güncellenemedi" });
    }
  });

  // Get match goals (super admin only)
  app.get("/api/league/fixtures/:id/goals", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const goals = await storage.getMatchGoals(id);
      return res.json(goals);
    } catch (error) {
      console.error("Error getting match goals:", error);
      return res.status(500).json({ error: "Gol bilgileri yüklenemedi" });
    }
  });

  // Update fixture postponed status (super admin only)
  app.patch("/api/league/fixtures/:id/postpone", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isPostponed } = req.body;
      
      if (typeof isPostponed !== "boolean") {
        return res.status(400).json({ error: "isPostponed boolean olmalıdır" });
      }

      const fixture = await storage.updateLeagueFixturePostponed(id, isPostponed);
      return res.json(fixture);
    } catch (error) {
      console.error("Error updating fixture postponed status:", error);
      return res.status(500).json({ error: "Maç ertelenme durumu güncellenemedi" });
    }
  });

  // Update fixture forfeit status (super admin only)
  app.patch("/api/league/fixtures/:id/forfeit", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isForfeit } = req.body;
      
      if (typeof isForfeit !== "boolean") {
        return res.status(400).json({ error: "isForfeit boolean olmalıdır" });
      }

      const fixture = await storage.updateLeagueFixtureForfeit(id, isForfeit);
      return res.json(fixture);
    } catch (error) {
      console.error("Error updating fixture forfeit status:", error);
      return res.status(500).json({ error: "Maç hükmen durumu güncellenemedi" });
    }
  });

  // Update fixture referee (super admin only)
  app.patch("/api/league/fixtures/:id/referee", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      let { referee } = req.body;
      
      // referee can be string or null/undefined
      // Convert empty string to null
      if (referee === "" || referee === undefined) {
        referee = null;
      }
      
      if (referee !== null && typeof referee !== "string") {
        return res.status(400).json({ error: "referee string veya null olmalıdır" });
      }

      const fixture = await storage.updateLeagueFixtureReferee(id, referee);
      if (!fixture) {
        return res.status(404).json({ error: "Maç bulunamadı" });
      }
      return res.json(fixture);
    } catch (error) {
      console.error("Error updating fixture referee:", error);
      return res.status(500).json({ error: "Hakem bilgisi güncellenemedi" });
    }
  });

  // Update fixture score with details (super admin only) - this also updates team standings
  app.patch("/api/league/fixtures/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { homeScore, awayScore, goals, matchRecordingUrl, isPostponed } = req.body;
      
      // Eğer detaylı bilgiler varsa (goals, matchRecordingUrl, isPostponed), detaylı güncelleme yap
      if (goals !== undefined || matchRecordingUrl !== undefined || isPostponed !== undefined) {
        if (homeScore === undefined || awayScore === undefined) {
          return res.status(400).json({ error: "Maç skorları gereklidir" });
        }

        const fixture = await storage.updateLeagueFixtureWithDetails(
          id, 
          homeScore, 
          awayScore, 
          goals || [], 
          matchRecordingUrl,
          isPostponed
        );
        return res.json(fixture);
      } else {
        // Eski yöntem - sadece skor güncelleme
        if (homeScore === undefined || awayScore === undefined) {
          return res.status(400).json({ error: "Maç skorları gereklidir" });
        }

        const fixture = await storage.updateLeagueFixtureScore(id, homeScore, awayScore);
        return res.json(fixture);
      }
    } catch (error) {
      console.error("Error updating fixture:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Maç sonucu güncellenemedi" });
    }
  });

  // Delete fixture (super admin only)
  app.delete("/api/league/fixtures/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLeagueFixture(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting fixture:", error);
      return res.status(500).json({ error: "Maç silinemedi" });
    }
  });

  // Manual team update (super admin only) - for manual stats adjustment
  app.patch("/api/league/teams/:id/manual", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Recalculate goal difference if goals change
      if (updates.goalsFor !== undefined || updates.goalsAgainst !== undefined) {
        const team = await storage.getLeagueTeam(id);
        if (team) {
          const goalsFor = updates.goalsFor ?? team.goalsFor;
          const goalsAgainst = updates.goalsAgainst ?? team.goalsAgainst;
          updates.goalDifference = goalsFor - goalsAgainst;
        }
      }
      
      const team = await storage.updateLeagueTeam(id, updates);
      return res.json(team);
    } catch (error) {
      console.error("Error updating team manually:", error);
      return res.status(500).json({ error: "Takım güncellenemedi" });
    }
  });

  // ===== PLAYER STATS ROUTES =====

  // Get player stats by fixture
  app.get("/api/league/fixtures/:fixtureId/stats", async (req, res) => {
    try {
      const { fixtureId } = req.params;
      const stats = await storage.getPlayerStatsByFixture(fixtureId);
      return res.json(stats);
    } catch (error) {
      console.error("Error getting player stats:", error);
      return res.status(500).json({ error: "Oyuncu istatistikleri yüklenemedi" });
    }
  });

  // Get player stats leaderboard
  app.get("/api/league/stats/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getPlayerStatsLeaderboard();
      return res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return res.status(500).json({ error: "Lider tablosu yüklenemedi" });
    }
  });

  // Debug endpoint to check player stats for a specific player name (super admin only)
  app.get("/api/league/stats/debug/:playerName", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { playerName } = req.params;
      const { sql } = await import("drizzle-orm");
      
      // Get all stats for this player name (case-insensitive)
      const allStats = await db
        .select({
          id: playerStats.id,
          userId: playerStats.userId,
          username: users.username,
          playerName: playerStats.playerName,
          fixtureId: playerStats.fixtureId,
          goals: playerStats.goals,
          assists: playerStats.assists,
          dm: playerStats.dm,
          cleanSheets: playerStats.cleanSheets,
          saves: playerStats.saves,
          createdAt: playerStats.createdAt,
        })
        .from(playerStats)
        .leftJoin(users, eq(playerStats.userId, users.id))
        .where(
          sql`LOWER(${playerStats.playerName}) = LOWER(${playerName}) OR LOWER(${users.username}) = LOWER(${playerName})`
        );
      
      return res.json({
        playerName,
        totalRecords: allStats.length,
        records: allStats,
        totals: {
          goals: allStats.reduce((sum, s) => sum + (Number(s.goals) || 0), 0),
          assists: allStats.reduce((sum, s) => sum + (Number(s.assists) || 0), 0),
          dm: allStats.reduce((sum, s) => sum + (Number(s.dm) || 0), 0),
          cleanSheets: allStats.reduce((sum, s) => sum + (Number(s.cleanSheets) || 0), 0),
          saves: allStats.reduce((sum, s) => sum + (Number(s.saves) || 0), 0),
        }
      });
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      return res.status(500).json({ error: "Debug bilgisi yüklenemedi" });
    }
  });

  // Create player stats (super admin only)
  app.post("/api/league/stats", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { fixtureId, userId, playerName, teamId, goals, assists, dm, cleanSheets, saves } = req.body;
      
      if (!fixtureId || !teamId) {
        return res.status(400).json({ error: "Fikstür ID ve takım ID gereklidir" });
      }
      
      if (!userId && !playerName) {
        return res.status(400).json({ error: "Kullanıcı ID veya oyuncu ismi gereklidir" });
      }
      
      const stats = await storage.createPlayerStats({
        fixtureId,
        userId: userId || null,
        playerName: playerName || null,
        teamId,
        goals: goals || 0,
        assists: assists || 0,
        dm: dm || 0,
        cleanSheets: cleanSheets || 0,
        saves: saves || 0,
      });
      
      return res.json(stats);
    } catch (error) {
      console.error("Error creating player stats:", error);
      return res.status(500).json({ error: "Oyuncu istatistiği oluşturulamadı" });
    }
  });

  // Update player stats (super admin only)
  app.patch("/api/league/stats/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const stats = await storage.updatePlayerMatchStats(id, updates);
      return res.json(stats);
    } catch (error) {
      console.error("Error updating player stats:", error);
      return res.status(500).json({ error: "Oyuncu istatistiği güncellenemedi" });
    }
  });

  // Delete player stats (super admin only)
  app.delete("/api/league/stats/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePlayerStats(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting player stats:", error);
      return res.status(500).json({ error: "Oyuncu istatistiği silinemedi" });
    }
  });

  // ===== TEAM OF WEEK ROUTES =====

  // Get all teams of week
  app.get("/api/league/team-of-week", async (req, res) => {
    try {
      const teams = await storage.getAllTeamsOfWeek();
      return res.json(teams);
    } catch (error) {
      console.error("Error getting teams of week:", error);
      return res.status(500).json({ error: "Haftanın kadroları yüklenemedi" });
    }
  });

  // Get team of week by week number
  app.get("/api/league/team-of-week/:week", async (req, res) => {
    try {
      const { week } = req.params;
      const team = await storage.getTeamOfWeek(parseInt(week));
      if (!team) {
        return res.status(404).json({ error: "Haftanın kadrosu bulunamadı" });
      }
      return res.json(team);
    } catch (error) {
      console.error("Error getting team of week:", error);
      return res.status(500).json({ error: "Haftanın kadrosu yüklenemedi" });
    }
  });

  // Create or update team of week (super admin only)
  app.post("/api/league/team-of-week", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { week, players } = req.body;
      
      if (!week) {
        return res.status(400).json({ error: "Hafta gereklidir" });
      }
      
      const playersJson = players ? JSON.stringify(players) : null;
      const team = await storage.createOrUpdateTeamOfWeek(week, playersJson);
      return res.json(team);
    } catch (error) {
      console.error("Error creating/updating team of week:", error);
      return res.status(500).json({ error: "Haftanın kadrosu oluşturulamadı" });
    }
  });

  // Delete team of week (super admin only)
  app.delete("/api/league/team-of-week/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTeamOfWeek(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting team of week:", error);
      return res.status(500).json({ error: "Haftanın kadrosu silinemedi" });
    }
  });

  // ===== CUSTOM ROLES =====
  
  // Get all custom roles
  app.get("/api/custom-roles", async (req, res) => {
    try {
      const roles = await storage.getCustomRoles();
      return res.json(roles);
    } catch (error) {
      console.error("Error getting custom roles:", error);
      return res.status(500).json({ error: "Roller yüklenemedi" });
    }
  });

  // Create custom role (super admin only)
  app.post("/api/custom-roles", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { name, color, priority } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Rol adı gereklidir" });
      }
      
      const role = await storage.createCustomRole({ 
        name, 
        color: color || "#808080",
        priority: priority || 0
      });
      return res.json(role);
    } catch (error: any) {
      console.error("Error creating custom role:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "Bu rol adı zaten kullanılıyor" });
      }
      return res.status(500).json({ error: "Rol oluşturulamadı" });
    }
  });

  // Update custom role (super admin only)
  app.patch("/api/custom-roles/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const role = await storage.updateCustomRole(id, updates);
      if (!role) {
        return res.status(404).json({ error: "Rol bulunamadı" });
      }
      return res.json(role);
    } catch (error: any) {
      console.error("Error updating custom role:", error);
      if (error.code === '23505') {
        return res.status(400).json({ error: "Bu rol adı zaten kullanılıyor" });
      }
      return res.status(500).json({ error: "Rol güncellenemedi" });
    }
  });

  // Delete custom role (super admin only)
  app.delete("/api/custom-roles/:id", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomRole(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom role:", error);
      return res.status(500).json({ error: "Rol silinemedi" });
    }
  });

  // Get user's custom roles
  app.get("/api/users/:userId/custom-roles", async (req, res) => {
    try {
      const { userId } = req.params;
      const roles = await storage.getUserCustomRoles(userId);
      return res.json(roles);
    } catch (error) {
      console.error("Error getting user custom roles:", error);
      return res.status(500).json({ error: "Kullanıcı rolleri yüklenemedi" });
    }
  });

  // Assign role to user (super admin only)
  app.post("/api/users/:userId/custom-roles", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;
      
      if (!roleId) {
        return res.status(400).json({ error: "Rol ID gereklidir" });
      }
      
      const assignment = await storage.assignRoleToUser(userId, roleId);
      return res.json(assignment);
    } catch (error) {
      console.error("Error assigning role to user:", error);
      return res.status(500).json({ error: "Rol atanamadı" });
    }
  });

  // Unassign role from user (super admin only)
  app.delete("/api/users/:userId/custom-roles/:roleId", checkIpBan, isAuthenticated, isSuperAdmin, async (req, res) => {
    try {
      const { userId, roleId } = req.params;
      await storage.unassignRoleFromUser(userId, roleId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error unassigning role from user:", error);
      return res.status(500).json({ error: "Rol kaldırılamadı" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
