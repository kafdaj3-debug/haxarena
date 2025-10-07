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
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Başvuru nedeni gerekli" });
      }

      const existing = await storage.getUserAdminApplications(req.user!.id);
      const hasPending = existing.some(app => app.status === "pending");
      if (hasPending) {
        return res.status(400).json({ error: "Bekleyen bir başvurunuz var" });
      }

      const application = await storage.createAdminApplication({
        userId: req.user!.id,
        reason,
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
      }

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru güncellenemedi" });
    }
  });

  // Team application routes
  app.post("/api/applications/team", isAuthenticated, async (req, res) => {
    try {
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

      return res.json(application);
    } catch (error) {
      return res.status(500).json({ error: "Başvuru güncellenemedi" });
    }
  });

  // Management routes (Super Admin only)
  app.get("/api/management/users", isSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPassword = users.map(({ password, ...user }) => user);
      return res.json(usersWithoutPassword);
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

  const httpServer = createServer(app);
  return httpServer;
}
