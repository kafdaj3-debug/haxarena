import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  profilePicture: text("profile_picture"), // base64 image or gif
  isAdmin: boolean("is_admin").notNull().default(false),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  role: text("role").notNull().default("HaxArena Üye"),
  playerRole: text("player_role"),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: text("ban_reason"),
  isChatMuted: boolean("is_chat_muted").notNull().default(false),
  lastIpAddress: text("last_ip_address"),
  lastUsernameChange: timestamp("last_username_change"),
  // Player statistics
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  matchTime: integer("match_time").notNull().default(0), // seconds
  rank: text("rank").notNull().default("Bronz"),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  matchesPlayed: integer("matches_played").notNull().default(0),
  points: integer("points").notNull().default(0),
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
  captain1: text("captain_1"),
  captain2: text("captain_2"),
  viceCaptain: text("vice_captain"),
  players: text("players").array(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminApplicationsOpen: boolean("admin_applications_open").notNull().default(false),
  teamApplicationsOpen: boolean("team_applications_open").notNull().default(false),
  statisticsVisible: boolean("statistics_visible").notNull().default(true),
});

export const staffRoles = pgTable("staff_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  managementAccess: boolean("management_access").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Custom Discord-like user roles
export const customRoles = pgTable("custom_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#808080"), // hex color
  priority: integer("priority").notNull().default(0), // higher = shows first
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Junction table for user custom roles
export const userCustomRoles = pgTable("user_custom_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id").notNull().references(() => customRoles.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
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
  imageUrl: text("image_url"),
  isLocked: boolean("is_locked").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  editedAt: timestamp("edited_at"),
});

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  quotedReplyId: varchar("quoted_reply_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  editedAt: timestamp("edited_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bannedIps = pgTable("banned_ips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull().unique(),
  reason: text("reason"),
  bannedBy: varchar("banned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const privateMessages = pgTable("private_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  imageUrl: text("image_url"), // base64 image, max 5MB
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leagueTeams = pgTable("league_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logo: text("logo"), // base64 image
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  goalDifference: integer("goal_difference").notNull().default(0),
  headToHead: integer("head_to_head").notNull().default(0), // İkili averaj
  points: integer("points").notNull().default(0),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leagueFixtures = pgTable("league_fixtures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  homeTeamId: varchar("home_team_id").references(() => leagueTeams.id, { onDelete: "cascade" }), // Nullable for BAY
  awayTeamId: varchar("away_team_id").references(() => leagueTeams.id, { onDelete: "cascade" }), // Nullable for BAY
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  matchDate: timestamp("match_date").notNull(),
  isPlayed: boolean("is_played").notNull().default(false),
  week: integer("week").notNull(),
  isBye: boolean("is_bye").notNull().default(false),
  byeSide: varchar("bye_side"), // "home" or "away" - which team gets the bye
  isPostponed: boolean("is_postponed").notNull().default(false), // Ertelenme durumu
  isForfeit: boolean("is_forfeit").notNull().default(false), // Hükmen durumu
  matchRecordingUrl: varchar("match_recording_url"), // Maç kaydı linki (rec)
  referee: text("referee"), // Hakem ismi
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Match goals table - gol ve asist bilgileri
export const matchGoals = pgTable("match_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fixtureId: varchar("fixture_id").notNull().references(() => leagueFixtures.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").references(() => users.id, { onDelete: "cascade" }), // Nullable - artık isim yazılacak
  playerName: varchar("player_name"), // Oyuncu ismi (serbest metin)
  minute: integer("minute").notNull(), // Kaçıncı dakikada
  assistPlayerId: varchar("assist_player_id").references(() => users.id, { onDelete: "set null" }), // Asist yapan oyuncu (nullable)
  assistPlayerName: varchar("assist_player_name"), // Asist yapan oyuncu ismi (serbest metin)
  isHomeTeam: boolean("is_home_team").notNull(), // Ev sahibi takımın golü mü
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player statistics for each match
export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fixtureId: varchar("fixture_id").notNull().references(() => leagueFixtures.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Nullable - artık isim yazılacak
  playerName: varchar("player_name"), // Oyuncu ismi (serbest metin)
  teamId: varchar("team_id").notNull().references(() => leagueTeams.id, { onDelete: "cascade" }),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  dm: integer("dm").notNull().default(0),
  cleanSheets: integer("clean_sheets").notNull().default(0), // CS
  saves: integer("saves").notNull().default(0), // Kurtarış
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Team of the week
export const teamOfWeek = pgTable("team_of_week", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull().unique(),
  players: text("players"), // JSON array of players with positions, names, and team info
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertBannedIpSchema = createInsertSchema(bannedIps).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertPrivateMessageSchema = createInsertSchema(privateMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertLeagueTeamSchema = createInsertSchema(leagueTeams).omit({
  id: true,
  played: true,
  won: true,
  drawn: true,
  lost: true,
  goalsFor: true,
  goalsAgainst: true,
  goalDifference: true,
  points: true,
  position: true,
  createdAt: true,
});

export const insertLeagueFixtureSchema = createInsertSchema(leagueFixtures).omit({
  id: true,
  isPlayed: true,
  createdAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true,
});

export const insertMatchGoalSchema = createInsertSchema(matchGoals).omit({
  id: true,
  createdAt: true,
});

export const insertTeamOfWeekSchema = createInsertSchema(teamOfWeek).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomRoleSchema = createInsertSchema(customRoles).omit({
  id: true,
  createdAt: true,
});

export const insertUserCustomRoleSchema = createInsertSchema(userCustomRoles).omit({
  id: true,
  assignedAt: true,
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
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type BannedIp = typeof bannedIps.$inferSelect;
export type InsertBannedIp = z.infer<typeof insertBannedIpSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = z.infer<typeof insertPrivateMessageSchema>;
export type LeagueTeam = typeof leagueTeams.$inferSelect;
export type InsertLeagueTeam = z.infer<typeof insertLeagueTeamSchema>;
export type LeagueFixture = typeof leagueFixtures.$inferSelect;
export type InsertLeagueFixture = z.infer<typeof insertLeagueFixtureSchema>;
export type MatchGoal = typeof matchGoals.$inferSelect;
export type InsertMatchGoal = z.infer<typeof insertMatchGoalSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type TeamOfWeek = typeof teamOfWeek.$inferSelect;
export type InsertTeamOfWeek = z.infer<typeof insertTeamOfWeekSchema>;
export type CustomRole = typeof customRoles.$inferSelect;
export type InsertCustomRole = z.infer<typeof insertCustomRoleSchema>;
export type UserCustomRole = typeof userCustomRoles.$inferSelect;
export type InsertUserCustomRole = z.infer<typeof insertUserCustomRoleSchema>;
