import { 
  type User, 
  type InsertUser, 
  type AdminApplication,
  type InsertAdminApplication,
  type TeamApplication,
  type InsertTeamApplication,
  type Settings,
  type UpdateSettings,
  type StaffRole,
  type InsertStaffRole,
  type Notification,
  type InsertNotification,
  users,
  adminApplications,
  teamApplications,
  settings,
  staffRoles,
  notifications
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Admin application operations
  createAdminApplication(app: InsertAdminApplication): Promise<AdminApplication>;
  getAdminApplications(): Promise<AdminApplication[]>;
  getUserAdminApplications(userId: string): Promise<AdminApplication[]>;
  updateAdminApplication(id: string, status: string): Promise<AdminApplication | undefined>;
  deleteAdminApplication(id: string): Promise<void>;
  
  // Team application operations
  createTeamApplication(app: InsertTeamApplication): Promise<TeamApplication>;
  getTeamApplications(): Promise<TeamApplication[]>;
  getUserTeamApplications(userId: string): Promise<TeamApplication[]>;
  updateTeamApplication(id: string, status: string): Promise<TeamApplication | undefined>;
  deleteTeamApplication(id: string): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettings): Promise<Settings>;
  
  // Staff role operations
  createStaffRole(role: InsertStaffRole): Promise<StaffRole>;
  getStaffRoles(): Promise<StaffRole[]>;
  updateStaffRole(id: string, updates: Partial<InsertStaffRole>): Promise<StaffRole | undefined>;
  deleteStaffRole(id: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
}

export class DBStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Admin application operations
  async createAdminApplication(app: InsertAdminApplication): Promise<AdminApplication> {
    const [application] = await db.insert(adminApplications).values(app).returning();
    return application;
  }

  async getAdminApplications(): Promise<AdminApplication[]> {
    return await db.select().from(adminApplications).orderBy(desc(adminApplications.createdAt));
  }

  async getUserAdminApplications(userId: string): Promise<AdminApplication[]> {
    return await db.select().from(adminApplications)
      .where(eq(adminApplications.userId, userId))
      .orderBy(desc(adminApplications.createdAt));
  }

  async updateAdminApplication(id: string, status: string): Promise<AdminApplication | undefined> {
    const [app] = await db.update(adminApplications)
      .set({ status })
      .where(eq(adminApplications.id, id))
      .returning();
    return app;
  }

  async deleteAdminApplication(id: string): Promise<void> {
    await db.delete(adminApplications).where(eq(adminApplications.id, id));
  }

  // Team application operations
  async createTeamApplication(app: InsertTeamApplication): Promise<TeamApplication> {
    const [application] = await db.insert(teamApplications).values(app).returning();
    return application;
  }

  async getTeamApplications(): Promise<TeamApplication[]> {
    return await db.select().from(teamApplications).orderBy(desc(teamApplications.createdAt));
  }

  async getUserTeamApplications(userId: string): Promise<TeamApplication[]> {
    return await db.select().from(teamApplications)
      .where(eq(teamApplications.userId, userId))
      .orderBy(desc(teamApplications.createdAt));
  }

  async updateTeamApplication(id: string, status: string): Promise<TeamApplication | undefined> {
    const [app] = await db.update(teamApplications)
      .set({ status })
      .where(eq(teamApplications.id, id))
      .returning();
    return app;
  }

  async deleteTeamApplication(id: string): Promise<void> {
    await db.delete(teamApplications).where(eq(teamApplications.id, id));
  }

  // Settings operations
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings).limit(1);
    if (!setting) {
      // Varsayılan olarak başvurular açık
      return {
        id: "",
        adminApplicationsOpen: true,
        teamApplicationsOpen: true,
      };
    }
    return setting;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    const [setting] = await db.select().from(settings).limit(1);
    
    if (!setting) {
      // İlk ayarı oluştur
      const [created] = await db.insert(settings)
        .values(updates)
        .returning();
      return created;
    }
    
    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, setting.id))
      .returning();
    return updated;
  }

  // Staff role operations
  async createStaffRole(role: InsertStaffRole): Promise<StaffRole> {
    const [staffRole] = await db.insert(staffRoles).values(role).returning();
    return staffRole;
  }

  async getStaffRoles(): Promise<StaffRole[]> {
    return await db.select().from(staffRoles).orderBy(desc(staffRoles.createdAt));
  }

  async updateStaffRole(id: string, updates: Partial<InsertStaffRole>): Promise<StaffRole | undefined> {
    const [updated] = await db.update(staffRoles)
      .set(updates)
      .where(eq(staffRoles.id, id))
      .returning();
    return updated;
  }

  async deleteStaffRole(id: string): Promise<void> {
    await db.delete(staffRoles).where(eq(staffRoles.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(notification).returning();
    return notif;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
}

export const storage = new DBStorage();
