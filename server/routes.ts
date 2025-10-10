import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";

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

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Giriş yapmalısınız" });
}

function isAdmin(req: any, res: any, next: any) {
  console.log("🔐 isAdmin check:", {
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    isAdmin: req.user?.isAdmin,
    isSuperAdmin: req.user?.isSuperAdmin
  });
  
  if (req.isAuthenticated() && (req.user.isAdmin || req.user.isSuperAdmin)) {
    return next();
  }
  return res.status(403).json({ error: "Yetkiniz yok" });
}

function isSuperAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ error: "Yetkiniz yok" });
}

function isNotBanned(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return next();
  }
  if (req.user.isBanned) {
    return res.status(403).json({ error: "Hesabınız yasaklandı. Sebep: " + (req.user.banReason || "Belirtilmemiş") });
  }
  return next();
}

function isNotChatMuted(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return next();
  }
  if (req.user.isChatMuted) {
    return res.status(403).json({ error: "Sohbet yazma izniniz kaldırıldı" });
  }
  return next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // IP ban middleware - tüm route'larda kontrol edilir
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
      // Güvenlik: Şifreleri frontend'e göndermiyoruz
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return res.json(usersWithoutPasswords);
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
      const post = await storage.createForumPost({
        userId: req.user!.id,
        title,
        content,
        category,
        imageUrl,
      });
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: "Konu oluşturulamadı" });
    }
  });

  app.get("/api/forum-posts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const includeArchived = req.isAuthenticated() && (req.user!.isAdmin || req.user!.isSuperAdmin);
      const posts = await storage.getForumPosts(category, includeArchived);
      const staffRoles = await storage.getStaffRoles();
      const staffMap = new Map(staffRoles.map(s => [s.name, s.role]));
      
      const postsWithStaffRole = posts.map(post => ({
        ...post,
        staffRole: staffMap.get(post.user.username) || null,
      }));
      
      return res.json(postsWithStaffRole);
    } catch (error) {
      return res.status(500).json({ error: "Konular yüklenemedi" });
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
      
      const postWithStaffRole = {
        ...post,
        staffRole: staffMap.get(post.user.username) || null,
      };
      
      return res.json(postWithStaffRole);
    } catch (error) {
      return res.status(500).json({ error: "Konu yüklenemedi" });
    }
  });

  app.patch("/api/forum-posts/:id", isAuthenticated, async (req, res) => {
    try {
      const { isLocked, isArchived } = req.body;
      const post = await storage.getForumPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ error: "Konu bulunamadı" });
      }
      
      // Only post owner can archive, only admins can lock
      const isOwner = post.userId === req.user!.id;
      const isAdminUser = req.user!.isAdmin || req.user!.isSuperAdmin;
      
      const updates: Partial<{ isLocked: boolean; isArchived: boolean }> = {};
      
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
      
      const repliesWithStaffRole = replies.map(reply => ({
        ...reply,
        staffRole: staffMap.get(reply.user.username) || null,
      }));
      
      return res.json(repliesWithStaffRole);
    } catch (error) {
      return res.status(500).json({ error: "Cevaplar yüklenemedi" });
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
      
      const messagesWithStaffRole = messages.map(msg => ({
        ...msg,
        staffRole: staffMap.get(msg.user.username) || null,
      }));
      
      return res.json(messagesWithStaffRole);
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

  const httpServer = createServer(app);
  return httpServer;
}
