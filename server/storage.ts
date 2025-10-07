import { 
  type User, 
  type InsertUser, 
  type AdminApplication,
  type InsertAdminApplication,
  type TeamApplication,
  type InsertTeamApplication,
  type Settings,
  type UpdateSettings,
  users,
  adminApplications,
  teamApplications,
  settings
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
  
  // Team application operations
  createTeamApplication(app: InsertTeamApplication): Promise<TeamApplication>;
  getTeamApplications(): Promise<TeamApplication[]>;
  getUserTeamApplications(userId: string): Promise<TeamApplication[]>;
  updateTeamApplication(id: string, status: string): Promise<TeamApplication | undefined>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettings): Promise<Settings | undefined>;
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

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    if (!setting) return undefined;
    
    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, setting.id))
      .returning();
    return updated;
  }
}

export const storage = new DBStorage();
