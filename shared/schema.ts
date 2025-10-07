import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  role: text("role").notNull().default("HaxArena Üye"),
});

export const adminApplications = pgTable("admin_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamApplications = pgTable("team_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamName: text("team_name").notNull(),
  teamLogo: text("team_logo"),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  isSuperAdmin: true,
  isApproved: true,
  role: true,
});

export const insertAdminApplicationSchema = createInsertSchema(adminApplications).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertTeamApplicationSchema = createInsertSchema(teamApplications).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminApplication = typeof adminApplications.$inferSelect;
export type InsertAdminApplication = z.infer<typeof insertAdminApplicationSchema>;
export type TeamApplication = typeof teamApplications.$inferSelect;
export type InsertTeamApplication = z.infer<typeof insertTeamApplicationSchema>;
