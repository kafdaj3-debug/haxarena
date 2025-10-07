import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  role: text("role").notNull().default("HaxArena Üye"),
});

export const adminApplications = pgTable("admin_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  age: text("age").notNull(),
  gameNick: text("game_nick").notNull(),
  discordNick: text("discord_nick").notNull(),
  playDuration: text("play_duration").notNull(),
  activeServers: text("active_servers").notNull(),
  previousExperience: text("previous_experience").notNull(),
  dailyHours: text("daily_hours").notNull(),
  activeTimeZones: text("active_time_zones").notNull(),
  aboutYourself: text("about_yourself").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamApplications = pgTable("team_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamName: text("team_name").notNull(),
  teamLogo: text("team_logo"),
  description: text("description").notNull(),
  players: text("players").array(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminApplicationsOpen: boolean("admin_applications_open").notNull().default(false),
  teamApplicationsOpen: boolean("team_applications_open").notNull().default(false),
});

export const staffRoles = pgTable("staff_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  managementAccess: boolean("management_access").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  isLocked: boolean("is_locked").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
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

export const updateSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertStaffRoleSchema = createInsertSchema(staffRoles).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  isLocked: true,
  isArchived: true,
  createdAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminApplication = typeof adminApplications.$inferSelect;
export type InsertAdminApplication = z.infer<typeof insertAdminApplicationSchema>;
export type TeamApplication = typeof teamApplications.$inferSelect;
export type InsertTeamApplication = z.infer<typeof insertTeamApplicationSchema>;
export type Settings = typeof settings.$inferSelect;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type StaffRole = typeof staffRoles.$inferSelect;
export type InsertStaffRole = z.infer<typeof insertStaffRoleSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
