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
  privateMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserProfile(userId: string): Promise<{
    user: User;
    forumPostCount: number;
    chatMessageCount: number;
    teamApplications: TeamApplication[];
    adminApplications: AdminApplication[];
  } | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getRecentUsers(limit?: number): Promise<User[]>;
  
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
  getConversation(userId1: string, userId2: string): Promise<PrivateMessage[]>;
  getUserConversations(userId: string): Promise<{userId: string; username: string; lastMessage: string; unreadCount: number; createdAt: Date}[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  markConversationAsRead(userId: string, otherUserId: string): Promise<void>;
  getAllPrivateMessages(): Promise<(PrivateMessage & { sender: User; receiver: User })[]>;
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
    // İlk önce kullanıcıya ait tüm bağlı kayıtları sil
    await db.delete(forumReplies).where(eq(forumReplies.userId, id));
    await db.delete(forumPosts).where(eq(forumPosts.userId, id));
    await db.delete(adminApplications).where(eq(adminApplications.userId, id));
    await db.delete(teamApplications).where(eq(teamApplications.userId, id));
    await db.delete(notifications).where(eq(notifications.userId, id));
    await db.delete(chatMessages).where(eq(chatMessages.userId, id));
    
    // Son olarak kullanıcıyı sil
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async getUserProfile(userId: string) {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const [forumPostCount, chatMessageCount, userTeamApps, userAdminApps] = await Promise.all([
      db.select().from(forumPosts).where(eq(forumPosts.userId, userId)).then(posts => posts.length),
      db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).then(messages => messages.length),
      this.getUserTeamApplications(userId),
      this.getUserAdminApplications(userId)
    ]);

    return {
      user,
      forumPostCount,
      chatMessageCount,
      teamApplications: userTeamApps.map(app => ({
        id: app.id,
        teamName: app.teamName,
        status: app.status,
        createdAt: app.createdAt
      })),
      adminApplications: userAdminApps.map(app => ({
        id: app.id,
        name: app.name,
        status: app.status,
        createdAt: app.createdAt
      }))
    };
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

  async getConversation(userId1: string, userId2: string): Promise<PrivateMessage[]> {
    const { or, and } = await import("drizzle-orm");
    return await db.select()
      .from(privateMessages)
      .where(
        or(
          and(
            eq(privateMessages.senderId, userId1),
            eq(privateMessages.receiverId, userId2)
          ),
          and(
            eq(privateMessages.senderId, userId2),
            eq(privateMessages.receiverId, userId1)
          )
        )
      )
      .orderBy(desc(privateMessages.createdAt));
  }

  async getUserConversations(userId: string): Promise<{userId: string; username: string; lastMessage: string; unreadCount: number; createdAt: Date}[]> {
    const { or, and, sql, count } = await import("drizzle-orm");
    
    const sentMessages = await db.select()
      .from(privateMessages)
      .where(eq(privateMessages.senderId, userId))
      .orderBy(desc(privateMessages.createdAt));
    
    const receivedMessages = await db.select()
      .from(privateMessages)
      .where(eq(privateMessages.receiverId, userId))
      .orderBy(desc(privateMessages.createdAt));
    
    const allMessages = [...sentMessages, ...receivedMessages]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const conversationMap = new Map<string, typeof allMessages[0]>();
    
    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, msg);
      }
    }
    
    const conversations = [];
    for (const [otherUserId, lastMsg] of conversationMap.entries()) {
      const otherUser = await this.getUser(otherUserId);
      if (!otherUser) continue;
      
      const unreadMessages = await db.select()
        .from(privateMessages)
        .where(
          and(
            eq(privateMessages.senderId, otherUserId),
            eq(privateMessages.receiverId, userId),
            eq(privateMessages.isRead, false)
          )
        );
      
      conversations.push({
        userId: otherUserId,
        username: otherUser.username,
        lastMessage: lastMsg.message,
        unreadCount: unreadMessages.length,
        createdAt: lastMsg.createdAt
      });
    }
    
    return conversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(privateMessages)
      .set({ isRead: true })
      .where(eq(privateMessages.id, messageId));
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    const { and } = await import("drizzle-orm");
    await db.update(privateMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(privateMessages.senderId, otherUserId),
          eq(privateMessages.receiverId, userId)
        )
      );
  }

  async getAllPrivateMessages(): Promise<(PrivateMessage & { sender: User; receiver: User })[]> {
    const messages = await db.select().from(privateMessages).orderBy(desc(privateMessages.createdAt));
    
    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const sender = await this.getUser(msg.senderId);
        const receiver = await this.getUser(msg.receiverId);
        return {
          ...msg,
          sender: sender!,
          receiver: receiver!
        };
      })
    );
    
    return messagesWithUsers;
  }
}

export const storage = new DBStorage();
