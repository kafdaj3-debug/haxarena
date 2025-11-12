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
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ChatMessage,
  type InsertChatMessage,
  type BannedIp,
  type InsertBannedIp,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type PrivateMessage,
  type InsertPrivateMessage,
  type LeagueTeam,
  type InsertLeagueTeam,
  type LeagueFixture,
  type InsertLeagueFixture,
  type PlayerStats,
  type InsertPlayerStats,
  type TeamOfWeek,
  type InsertTeamOfWeek,
  type CustomRole,
  type InsertCustomRole,
  type UserCustomRole,
  type InsertUserCustomRole,
  users,
  adminApplications,
  teamApplications,
  settings,
  staffRoles,
  notifications,
  forumPosts,
  forumReplies,
  chatMessages,
  bannedIps,
  passwordResetTokens,
  privateMessages,
  leagueTeams,
  leagueFixtures,
  playerStats,
  teamOfWeek,
  customRoles,
  userCustomRoles
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  searchUsersByUsername(query: string): Promise<User[]>;
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
  
  // Forum post operations
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPosts(category?: string, includeArchived?: boolean): Promise<(ForumPost & { user: User; replyCount: number })[]>;
  getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined>;
  updateForumPost(id: string, updates: Partial<ForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: string): Promise<void>;
  
  // Forum reply operations
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getForumReplies(postId: string): Promise<(ForumReply & { user: User })[]>;
  getForumReply(id: string): Promise<(ForumReply & { user: User }) | undefined>;
  updateForumReply(id: string, updates: Partial<ForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: string): Promise<void>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<(ChatMessage & { user: User })[]>;
  deleteChatMessage(id: string): Promise<void>;
  
  // IP ban operations
  createBannedIp(bannedIp: InsertBannedIp): Promise<BannedIp>;
  getBannedIps(): Promise<(BannedIp & { bannedByUser: User })[]>;
  getBannedIpByAddress(ipAddress: string): Promise<BannedIp | undefined>;
  deleteBannedIp(id: string): Promise<void>;
  
  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(id: string): Promise<void>;
  deleteUserPasswordResetTokens(userId: string): Promise<void>;
  
  // Private message operations
  sendPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage>;
  getConversations(userId: string): Promise<Array<{ otherUser: User; lastMessage: PrivateMessage; unreadCount: number }>>;
  getConversationMessages(userId: string, otherUserId: string): Promise<(PrivateMessage & { sender: User; receiver: User })[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Player statistics operations
  getPlayerStats(): Promise<User[]>;
  getPlayerByUsername(username: string): Promise<User | undefined>;
  getPlayersRanking(): Promise<User[]>;
  updatePlayerStats(userId: string, stats: { goals?: number; assists?: number; saves?: number; matchTime?: number; rank?: string }): Promise<User | undefined>;
  
  // League operations
  getLeagueTeams(): Promise<LeagueTeam[]>;
  getLeagueTeam(id: string): Promise<LeagueTeam | undefined>;
  createLeagueTeam(team: InsertLeagueTeam): Promise<LeagueTeam>;
  updateLeagueTeam(id: string, updates: Partial<LeagueTeam>): Promise<LeagueTeam | undefined>;
  deleteLeagueTeam(id: string): Promise<void>;
  
  getLeagueFixtures(): Promise<(LeagueFixture & { homeTeam: LeagueTeam; awayTeam: LeagueTeam })[]>;
  getLeagueFixture(id: string): Promise<(LeagueFixture & { homeTeam: LeagueTeam; awayTeam: LeagueTeam }) | undefined>;
  createLeagueFixture(fixture: InsertLeagueFixture): Promise<LeagueFixture>;
  updateLeagueFixtureScore(id: string, homeScore: number, awayScore: number): Promise<LeagueFixture | undefined>;
  deleteLeagueFixture(id: string): Promise<void>;
  
  // Player match stats operations
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  getPlayerStatsByFixture(fixtureId: string): Promise<(PlayerStats & { user: User; team: LeagueTeam })[]>;
  getPlayerStatsLeaderboard(): Promise<Array<{ userId: string; username: string; totalGoals: number; totalAssists: number; totalDm: number; totalCleanSheets: number; totalSaves: number }>>;
  updatePlayerStats(id: string, updates: Partial<PlayerStats>): Promise<PlayerStats | undefined>;
  deletePlayerStats(id: string): Promise<void>;
  deletePlayerStatsByFixture(fixtureId: string): Promise<void>;
  
  // Team of week operations
  createOrUpdateTeamOfWeek(week: number, image: string): Promise<TeamOfWeek>;
  getTeamOfWeek(week: number): Promise<TeamOfWeek | undefined>;
  getAllTeamsOfWeek(): Promise<TeamOfWeek[]>;
  deleteTeamOfWeek(id: string): Promise<void>;
  
  // Custom role operations
  getCustomRoles(): Promise<CustomRole[]>;
  getCustomRole(id: string): Promise<CustomRole | undefined>;
  createCustomRole(role: InsertCustomRole): Promise<CustomRole>;
  updateCustomRole(id: string, updates: Partial<CustomRole>): Promise<CustomRole | undefined>;
  deleteCustomRole(id: string): Promise<void>;
  
  // User custom role assignments
  getUserCustomRoles(userId: string): Promise<(UserCustomRole & { role: CustomRole })[]>;
  assignRoleToUser(userId: string, roleId: string): Promise<UserCustomRole>;
  unassignRoleFromUser(userId: string, roleId: string): Promise<void>;
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

  async searchUsersByUsername(query: string): Promise<User[]> {
    const { ilike } = await import("drizzle-orm");
    return await db.select().from(users)
      .where(ilike(users.username, `%${query}%`))
      .limit(10);
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
    const { or } = await import("drizzle-orm");
    
    // İlk önce kullanıcıya ait tüm bağlı kayıtları sil
    await db.delete(forumReplies).where(eq(forumReplies.userId, id));
    await db.delete(forumPosts).where(eq(forumPosts.userId, id));
    await db.delete(adminApplications).where(eq(adminApplications.userId, id));
    await db.delete(teamApplications).where(eq(teamApplications.userId, id));
    await db.delete(notifications).where(eq(notifications.userId, id));
    await db.delete(chatMessages).where(eq(chatMessages.userId, id));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));
    
    // Private message'ları sil (gönderen veya alıcı olarak)
    await db.delete(privateMessages).where(
      or(
        eq(privateMessages.senderId, id),
        eq(privateMessages.receiverId, id)
      )
    );
    
    // Son olarak kullanıcıyı sil
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
        statisticsVisible: true,
      };
    }
    
    // Eğer statisticsVisible undefined ise, güncelle
    if (setting.statisticsVisible === undefined || setting.statisticsVisible === null) {
      const [updated] = await db.update(settings)
        .set({ statisticsVisible: true })
        .where(eq(settings.id, setting.id))
        .returning();
      return updated;
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

  // Forum post operations
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [forumPost] = await db.insert(forumPosts).values(post).returning();
    return forumPost;
  }

  async getForumPosts(category?: string, includeArchived: boolean = false): Promise<(ForumPost & { user: User; replyCount: number })[]> {
    let posts;
    
    if (category) {
      posts = includeArchived
        ? await db.select().from(forumPosts)
            .where(eq(forumPosts.category, category))
            .orderBy(desc(forumPosts.createdAt))
        : await db.select().from(forumPosts)
            .where(eq(forumPosts.category, category))
            .orderBy(desc(forumPosts.createdAt));
    } else {
      posts = includeArchived
        ? await db.select().from(forumPosts)
            .orderBy(desc(forumPosts.createdAt))
        : await db.select().from(forumPosts)
            .orderBy(desc(forumPosts.createdAt));
    }
    
    if (!includeArchived) {
      posts = posts.filter(p => !p.isArchived);
    }

    const postsWithUserAndCount = await Promise.all(
      posts.map(async (post) => {
        const [user] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
        const replies = await db.select().from(forumReplies).where(eq(forumReplies.postId, post.id));
        return { ...post, user, replyCount: replies.length };
      })
    );

    return postsWithUserAndCount;
  }

  async getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1);
    if (!post) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
    return { ...post, user };
  }

  async updateForumPost(id: string, updates: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const [updated] = await db.update(forumPosts)
      .set(updates)
      .where(eq(forumPosts.id, id))
      .returning();
    return updated;
  }

  async deleteForumPost(id: string): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  // Forum reply operations
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [forumReply] = await db.insert(forumReplies).values(reply).returning();
    return forumReply;
  }

  async getForumReplies(postId: string): Promise<(ForumReply & { user: User })[]> {
    const replies = await db.select().from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(desc(forumReplies.createdAt));

    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        const [user] = await db.select().from(users).where(eq(users.id, reply.userId)).limit(1);
        return { ...reply, user };
      })
    );

    return repliesWithUser;
  }

  async getForumReply(id: string): Promise<(ForumReply & { user: User }) | undefined> {
    const [reply] = await db.select().from(forumReplies).where(eq(forumReplies.id, id)).limit(1);
    if (!reply) return undefined;

    const [user] = await db.select().from(users).where(eq(users.id, reply.userId)).limit(1);
    return { ...reply, user };
  }

  async updateForumReply(id: string, updates: Partial<ForumReply>): Promise<ForumReply | undefined> {
    const [reply] = await db.update(forumReplies).set(updates).where(eq(forumReplies.id, id)).returning();
    return reply;
  }

  async deleteForumReply(id: string): Promise<void> {
    await db.delete(forumReplies).where(eq(forumReplies.id, id));
  }

  // Chat message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db.insert(chatMessages).values(message).returning();
    return chatMessage;
  }

  async getChatMessages(limit: number = 50): Promise<(ChatMessage & { user: User })[]> {
    const messages = await db.select().from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    const messagesWithUser = await Promise.all(
      messages.map(async (message) => {
        const [user] = await db.select().from(users).where(eq(users.id, message.userId)).limit(1);
        return { ...message, user };
      })
    );

    return messagesWithUser.reverse(); // Reverse to show oldest first
  }

  async deleteChatMessage(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  // IP ban operations
  async createBannedIp(bannedIp: InsertBannedIp): Promise<BannedIp> {
    const [banned] = await db.insert(bannedIps).values(bannedIp).returning();
    return banned;
  }

  async getBannedIps(): Promise<(BannedIp & { bannedByUser: User })[]> {
    const banned = await db.select().from(bannedIps).orderBy(desc(bannedIps.createdAt));
    
    const bannedWithUser = await Promise.all(
      banned.map(async (ban) => {
        const [user] = await db.select().from(users).where(eq(users.id, ban.bannedBy)).limit(1);
        return { ...ban, bannedByUser: user };
      })
    );

    return bannedWithUser;
  }

  async getBannedIpByAddress(ipAddress: string): Promise<BannedIp | undefined> {
    const [banned] = await db.select().from(bannedIps).where(eq(bannedIps.ipAddress, ipAddress)).limit(1);
    return banned;
  }

  async deleteBannedIp(id: string): Promise<void> {
    await db.delete(bannedIps).where(eq(bannedIps.id, id));
  }

  // Password reset operations
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [resetToken] = await db.insert(passwordResetTokens).values(token).returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
    return resetToken;
  }

  async deletePasswordResetToken(id: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, id));
  }

  async deleteUserPasswordResetTokens(userId: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  // Private message operations
  async sendPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage> {
    const [pm] = await db.insert(privateMessages).values(message).returning();
    return pm;
  }

  async getConversations(userId: string): Promise<Array<{ otherUser: User; lastMessage: PrivateMessage; unreadCount: number }>>  {
    const { or, and, sql } = await import("drizzle-orm");
    
    // Get all messages where user is sender or receiver
    const messages = await db
      .select()
      .from(privateMessages)
      .where(
        or(
          eq(privateMessages.senderId, userId),
          eq(privateMessages.receiverId, userId)
        )
      )
      .orderBy(desc(privateMessages.createdAt));

    // Group by other user
    const conversationMap = new Map<string, { lastMessage: PrivateMessage; messages: PrivateMessage[] }>();
    
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, { lastMessage: msg, messages: [msg] });
      } else {
        conversationMap.get(otherUserId)!.messages.push(msg);
      }
    }

    // Build conversation list with other user info and unread count
    const conversations = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([otherUserId, data]) => {
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId)).limit(1);
        
        // Count unread messages from other user to current user
        const unreadCount = data.messages.filter(
          m => m.senderId === otherUserId && m.receiverId === userId && !m.isRead
        ).length;

        return {
          otherUser,
          lastMessage: data.lastMessage,
          unreadCount,
        };
      })
    );

    return conversations;
  }

  async getConversationMessages(userId: string, otherUserId: string): Promise<(PrivateMessage & { sender: User; receiver: User })[]> {
    const { or, and } = await import("drizzle-orm");
    
    const messages = await db
      .select()
      .from(privateMessages)
      .where(
        or(
          and(
            eq(privateMessages.senderId, userId),
            eq(privateMessages.receiverId, otherUserId)
          ),
          and(
            eq(privateMessages.senderId, otherUserId),
            eq(privateMessages.receiverId, userId)
          )
        )
      )
      .orderBy(privateMessages.createdAt);

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId)).limit(1);
        const [receiver] = await db.select().from(users).where(eq(users.id, msg.receiverId)).limit(1);
        return { ...msg, sender, receiver };
      })
    );

    return messagesWithUsers;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(privateMessages).set({ isRead: true }).where(eq(privateMessages.id, messageId));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const { and } = await import("drizzle-orm");
    
    const unreadMessages = await db
      .select()
      .from(privateMessages)
      .where(
        and(
          eq(privateMessages.receiverId, userId),
          eq(privateMessages.isRead, false)
        )
      );

    return unreadMessages.length;
  }

  // Player statistics operations
  async getPlayerStats(): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.isApproved, true))
      .orderBy(desc(users.goals));
    
    return allUsers;
  }

  async getPlayerByUsername(username: string): Promise<User | undefined> {
    const [player] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return player;
  }

  async getPlayersRanking(): Promise<User[]> {
    const allPlayers = await db
      .select()
      .from(users)
      .where(eq(users.isApproved, true))
      .orderBy(desc(users.points));
    
    return allPlayers;
  }

  async updatePlayerStats(
    userId: string, 
    stats: { goals?: number; assists?: number; saves?: number; matchTime?: number; rank?: string }
  ): Promise<User | undefined> {
    await db.update(users).set(stats).where(eq(users.id, userId));
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return updatedUser;
  }

  // League operations
  async getLeagueTeams(): Promise<LeagueTeam[]> {
    const { desc } = await import("drizzle-orm");
    return await db.select().from(leagueTeams).orderBy(desc(leagueTeams.points), desc(leagueTeams.goalDifference));
  }

  async getLeagueTeam(id: string): Promise<LeagueTeam | undefined> {
    const [team] = await db.select().from(leagueTeams).where(eq(leagueTeams.id, id)).limit(1);
    return team;
  }

  async createLeagueTeam(team: InsertLeagueTeam): Promise<LeagueTeam> {
    const [newTeam] = await db.insert(leagueTeams).values(team).returning();
    return newTeam;
  }

  async updateLeagueTeam(id: string, updates: Partial<LeagueTeam>): Promise<LeagueTeam | undefined> {
    // Recalculate goal difference if goals change
    if (updates.goalsFor !== undefined || updates.goalsAgainst !== undefined) {
      const team = await this.getLeagueTeam(id);
      if (team) {
        const goalsFor = updates.goalsFor ?? team.goalsFor;
        const goalsAgainst = updates.goalsAgainst ?? team.goalsAgainst;
        updates.goalDifference = goalsFor - goalsAgainst;
      }
    }
    
    await db.update(leagueTeams).set(updates).where(eq(leagueTeams.id, id));
    return await this.getLeagueTeam(id);
  }

  async deleteLeagueTeam(id: string): Promise<void> {
    await db.delete(leagueTeams).where(eq(leagueTeams.id, id));
  }

  async getLeagueFixtures(): Promise<(LeagueFixture & { homeTeam: LeagueTeam; awayTeam: LeagueTeam })[]> {
    const { asc } = await import("drizzle-orm");
    const fixtures = await db.select().from(leagueFixtures).orderBy(asc(leagueFixtures.week), asc(leagueFixtures.matchDate));
    
    const fixturesWithTeams = await Promise.all(
      fixtures.map(async (fixture) => {
        const homeTeam = await this.getLeagueTeam(fixture.homeTeamId);
        const awayTeam = await this.getLeagueTeam(fixture.awayTeamId);
        return {
          ...fixture,
          homeTeam: homeTeam!,
          awayTeam: awayTeam!,
        };
      })
    );
    
    return fixturesWithTeams;
  }

  async getLeagueFixture(id: string): Promise<(LeagueFixture & { homeTeam: LeagueTeam; awayTeam: LeagueTeam }) | undefined> {
    const [fixture] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    if (!fixture) return undefined;
    
    const homeTeam = await this.getLeagueTeam(fixture.homeTeamId);
    const awayTeam = await this.getLeagueTeam(fixture.awayTeamId);
    
    return {
      ...fixture,
      homeTeam: homeTeam!,
      awayTeam: awayTeam!,
    };
  }

  async createLeagueFixture(fixture: InsertLeagueFixture): Promise<LeagueFixture> {
    const [newFixture] = await db.insert(leagueFixtures).values(fixture).returning();
    return newFixture;
  }

  async updateLeagueFixtureScore(id: string, homeScore: number, awayScore: number): Promise<LeagueFixture | undefined> {
    const fixture = await this.getLeagueFixture(id);
    if (!fixture) return undefined;

    // If match was already played, revert the previous score effects
    if (fixture.isPlayed && fixture.homeScore !== null && fixture.awayScore !== null) {
      await this.revertMatchResult(fixture.homeTeamId, fixture.awayTeamId, fixture.homeScore, fixture.awayScore);
    }

    // Update fixture
    await db.update(leagueFixtures).set({
      homeScore,
      awayScore,
      isPlayed: true,
    }).where(eq(leagueFixtures.id, id));

    // Update team standings
    await this.updateTeamStandings(fixture.homeTeamId, fixture.awayTeamId, homeScore, awayScore);

    const [updated] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    return updated;
  }

  private async updateTeamStandings(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number): Promise<void> {
    const homeTeam = await this.getLeagueTeam(homeTeamId);
    const awayTeam = await this.getLeagueTeam(awayTeamId);
    
    if (!homeTeam || !awayTeam) return;

    // Update home team
    const homeUpdates: Partial<LeagueTeam> = {
      played: homeTeam.played + 1,
      goalsFor: homeTeam.goalsFor + homeScore,
      goalsAgainst: homeTeam.goalsAgainst + awayScore,
    };

    // Update away team
    const awayUpdates: Partial<LeagueTeam> = {
      played: awayTeam.played + 1,
      goalsFor: awayTeam.goalsFor + awayScore,
      goalsAgainst: awayTeam.goalsAgainst + homeScore,
    };

    // Determine result
    if (homeScore > awayScore) {
      // Home win
      homeUpdates.won = homeTeam.won + 1;
      homeUpdates.points = homeTeam.points + 3;
      awayUpdates.lost = awayTeam.lost + 1;
    } else if (homeScore < awayScore) {
      // Away win
      awayUpdates.won = awayTeam.won + 1;
      awayUpdates.points = awayTeam.points + 3;
      homeUpdates.lost = homeTeam.lost + 1;
    } else {
      // Draw
      homeUpdates.drawn = homeTeam.drawn + 1;
      homeUpdates.points = homeTeam.points + 1;
      awayUpdates.drawn = awayTeam.drawn + 1;
      awayUpdates.points = awayTeam.points + 1;
    }

    // Calculate goal difference
    homeUpdates.goalDifference = (homeTeam.goalsFor + homeScore) - (homeTeam.goalsAgainst + awayScore);
    awayUpdates.goalDifference = (awayTeam.goalsFor + awayScore) - (awayTeam.goalsAgainst + homeScore);

    await this.updateLeagueTeam(homeTeamId, homeUpdates);
    await this.updateLeagueTeam(awayTeamId, awayUpdates);
  }

  private async revertMatchResult(homeTeamId: string, awayTeamId: string, homeScore: number, awayScore: number): Promise<void> {
    const homeTeam = await this.getLeagueTeam(homeTeamId);
    const awayTeam = await this.getLeagueTeam(awayTeamId);
    
    if (!homeTeam || !awayTeam) return;

    // Revert home team
    const homeUpdates: Partial<LeagueTeam> = {
      played: homeTeam.played - 1,
      goalsFor: homeTeam.goalsFor - homeScore,
      goalsAgainst: homeTeam.goalsAgainst - awayScore,
    };

    // Revert away team
    const awayUpdates: Partial<LeagueTeam> = {
      played: awayTeam.played - 1,
      goalsFor: awayTeam.goalsFor - awayScore,
      goalsAgainst: awayTeam.goalsAgainst - homeScore,
    };

    // Revert result
    if (homeScore > awayScore) {
      homeUpdates.won = homeTeam.won - 1;
      homeUpdates.points = homeTeam.points - 3;
      awayUpdates.lost = awayTeam.lost - 1;
    } else if (homeScore < awayScore) {
      awayUpdates.won = awayTeam.won - 1;
      awayUpdates.points = awayTeam.points - 3;
      homeUpdates.lost = homeTeam.lost - 1;
    } else {
      homeUpdates.drawn = homeTeam.drawn - 1;
      homeUpdates.points = homeTeam.points - 1;
      awayUpdates.drawn = awayTeam.drawn - 1;
      awayUpdates.points = awayTeam.points - 1;
    }

    homeUpdates.goalDifference = (homeTeam.goalsFor - homeScore) - (homeTeam.goalsAgainst - awayScore);
    awayUpdates.goalDifference = (awayTeam.goalsFor - awayScore) - (awayTeam.goalsAgainst - homeScore);

    await this.updateLeagueTeam(homeTeamId, homeUpdates);
    await this.updateLeagueTeam(awayTeamId, awayUpdates);
  }

  async deleteLeagueFixture(id: string): Promise<void> {
    await db.delete(leagueFixtures).where(eq(leagueFixtures.id, id));
  }

  // Player match stats operations
  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [newStats] = await db.insert(playerStats).values(stats).returning();
    return newStats;
  }

  async getPlayerStatsByFixture(fixtureId: string): Promise<(PlayerStats & { user: User; team: LeagueTeam })[]> {
    const stats = await db.select()
      .from(playerStats)
      .where(eq(playerStats.fixtureId, fixtureId));
    
    const result = [];
    for (const stat of stats) {
      const [user] = await db.select().from(users).where(eq(users.id, stat.userId)).limit(1);
      const [team] = await db.select().from(leagueTeams).where(eq(leagueTeams.id, stat.teamId)).limit(1);
      if (user && team) {
        result.push({ ...stat, user, team });
      }
    }
    return result;
  }

  async getPlayerStatsLeaderboard(): Promise<Array<{ userId: string; username: string; totalGoals: number; totalAssists: number; totalDm: number; totalCleanSheets: number; totalSaves: number }>> {
    const { sql, sum } = await import("drizzle-orm");
    
    const leaderboard = await db
      .select({
        userId: playerStats.userId,
        username: users.username,
        totalGoals: sum(playerStats.goals),
        totalAssists: sum(playerStats.assists),
        totalDm: sum(playerStats.dm),
        totalCleanSheets: sum(playerStats.cleanSheets),
        totalSaves: sum(playerStats.saves),
      })
      .from(playerStats)
      .leftJoin(users, eq(playerStats.userId, users.id))
      .groupBy(playerStats.userId, users.username)
      .orderBy(desc(sum(playerStats.goals)));
    
    return leaderboard.map(row => ({
      userId: row.userId,
      username: row.username || '',
      totalGoals: Number(row.totalGoals) || 0,
      totalAssists: Number(row.totalAssists) || 0,
      totalDm: Number(row.totalDm) || 0,
      totalCleanSheets: Number(row.totalCleanSheets) || 0,
      totalSaves: Number(row.totalSaves) || 0,
    }));
  }

  async updatePlayerStats(id: string, updates: Partial<PlayerStats>): Promise<PlayerStats | undefined> {
    const [updated] = await db.update(playerStats).set(updates).where(eq(playerStats.id, id)).returning();
    return updated;
  }

  async deletePlayerStats(id: string): Promise<void> {
    await db.delete(playerStats).where(eq(playerStats.id, id));
  }

  async deletePlayerStatsByFixture(fixtureId: string): Promise<void> {
    await db.delete(playerStats).where(eq(playerStats.fixtureId, fixtureId));
  }

  // Team of week operations
  async createOrUpdateTeamOfWeek(week: number, image: string): Promise<TeamOfWeek> {
    const { sql } = await import("drizzle-orm");
    const existing = await this.getTeamOfWeek(week);
    
    if (existing) {
      const [updated] = await db.update(teamOfWeek)
        .set({ image, updatedAt: sql`NOW()` })
        .where(eq(teamOfWeek.week, week))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(teamOfWeek).values({ week, image }).returning();
      return created;
    }
  }

  async getTeamOfWeek(week: number): Promise<TeamOfWeek | undefined> {
    const [result] = await db.select().from(teamOfWeek).where(eq(teamOfWeek.week, week)).limit(1);
    return result;
  }

  async getAllTeamsOfWeek(): Promise<TeamOfWeek[]> {
    return await db.select().from(teamOfWeek).orderBy(desc(teamOfWeek.week));
  }

  async deleteTeamOfWeek(id: string): Promise<void> {
    await db.delete(teamOfWeek).where(eq(teamOfWeek.id, id));
  }

  // Custom role operations
  async getCustomRoles(): Promise<CustomRole[]> {
    return await db.select().from(customRoles).orderBy(desc(customRoles.priority));
  }

  async getCustomRole(id: string): Promise<CustomRole | undefined> {
    const [role] = await db.select().from(customRoles).where(eq(customRoles.id, id)).limit(1);
    return role;
  }

  async createCustomRole(role: InsertCustomRole): Promise<CustomRole> {
    const [created] = await db.insert(customRoles).values(role).returning();
    return created;
  }

  async updateCustomRole(id: string, updates: Partial<CustomRole>): Promise<CustomRole | undefined> {
    const [updated] = await db.update(customRoles)
      .set(updates)
      .where(eq(customRoles.id, id))
      .returning();
    return updated;
  }

  async deleteCustomRole(id: string): Promise<void> {
    await db.delete(customRoles).where(eq(customRoles.id, id));
  }

  // User custom role assignments
  async getUserCustomRoles(userId: string): Promise<(UserCustomRole & { role: CustomRole })[]> {
    const results = await db
      .select({
        id: userCustomRoles.id,
        userId: userCustomRoles.userId,
        roleId: userCustomRoles.roleId,
        assignedAt: userCustomRoles.assignedAt,
        role: customRoles,
      })
      .from(userCustomRoles)
      .leftJoin(customRoles, eq(userCustomRoles.roleId, customRoles.id))
      .where(eq(userCustomRoles.userId, userId))
      .orderBy(desc(customRoles.priority));
    
    // Silinen rolleri filtrele (role null ise)
    return results
      .filter(r => r.role !== null)
      .map(r => ({
        id: r.id,
        userId: r.userId,
        roleId: r.roleId,
        assignedAt: r.assignedAt,
        role: r.role!
      }));
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<UserCustomRole> {
    const [assigned] = await db.insert(userCustomRoles).values({ userId, roleId }).returning();
    return assigned;
  }

  async unassignRoleFromUser(userId: string, roleId: string): Promise<void> {
    const { and } = await import("drizzle-orm");
    await db.delete(userCustomRoles)
      .where(and(
        eq(userCustomRoles.userId, userId),
        eq(userCustomRoles.roleId, roleId)
      ));
  }
}

export const storage = new DBStorage();
