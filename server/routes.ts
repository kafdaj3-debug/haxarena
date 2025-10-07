import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Giriş yapmalısınız" });
}

function isAdmin(req: any, res: any, next: any) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
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

  app.patch("/api/profile/username", isAuthenticated, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Kullanıcı adı gerekli" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing && existing.id !== req.user!.id) {
        return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const updated = await storage.updateUser(req.user!.id, { username });
      if (!updated) {
        return res.status(404).json({ error: "Kullanıcı bulunamadı" });
      }

      const { password, ...userWithoutPassword } = updated;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Kullanıcı adı güncellenemedi" });
    }
  });

  app.patch("/api/profile/password", isAuthenticated, async (req, res) => {
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
  app.post("/api/applications/admin", isAuthenticated, async (req, res) => {
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

  app.get("/api/applications/admin", async (req, res) => {
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

  app.get("/api/applications/admin/my", isAuthenticated, async (req, res) => {
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
        await storage.updateUser(application.userId, { isAdmin: true });
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
  app.post("/api/applications/team", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings.teamApplicationsOpen) {
        return res.status(403).json({ error: "Takım başvuruları şu anda kapalı" });
      }

      const { teamName, teamLogo, description } = req.body;
      if (!teamName || !description) {
        return res.status(400).json({ error: "Takım adı ve açıklama gerekli" });
      }

      const application = await storage.createTeamApplication({
        userId: req.user!.id,
        teamName,
        teamLogo: teamLogo || null,
        description,
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

  app.get("/api/applications/team/my", isAuthenticated, async (req, res) => {
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
      // Super adminler şifreleri görebilir
      return res.json(users);
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

  app.delete("/api/management/users/:id", isSuperAdmin, async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      return res.json({ message: "Kullanıcı silindi" });
    } catch (error) {
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
  app.post("/api/forum-posts", isAuthenticated, async (req, res) => {
    try {
      const { title, content, category } = req.body;
      const post = await storage.createForumPost({
        userId: req.user!.id,
        title,
        content,
        category,
      });
      return res.json(post);
    } catch (error) {
      return res.status(500).json({ error: "Konu oluşturulamadı" });
    }
  });

  app.get("/api/forum-posts", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const posts = await storage.getForumPosts(category);
      return res.json(posts);
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
      return res.json(post);
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
      
      if (typeof isArchived === "boolean" && (isOwner || isAdminUser)) {
        updates.isArchived = isArchived;
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

  app.post("/api/forum-posts/:id/replies", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      const reply = await storage.createForumReply({
        postId: req.params.id,
        userId: req.user!.id,
        content,
      });
      return res.json(reply);
    } catch (error) {
      return res.status(500).json({ error: "Cevap oluşturulamadı" });
    }
  });

  app.get("/api/forum-posts/:id/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.id);
      return res.json(replies);
    } catch (error) {
      return res.status(500).json({ error: "Cevaplar yüklenemedi" });
    }
  });

  app.delete("/api/forum-replies/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteForumReply(req.params.id);
      return res.json({ message: "Cevap silindi" });
    } catch (error) {
      return res.status(500).json({ error: "Cevap silinemedi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
