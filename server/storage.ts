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
  type MatchGoal,
  type InsertMatchGoal,
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
  matchGoals,
  playerStats,
  teamOfWeek,
  customRoles,
  userCustomRoles
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, sql, inArray } from "drizzle-orm";

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
  getForumReplies(postId: string): Promise<(ForumReply & { user: User; quotedReply?: ForumReply & { user: User } })[]>;
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
  
  getLeagueFixtures(): Promise<(LeagueFixture & { homeTeam: LeagueTeam | null; awayTeam: LeagueTeam | null; goals: (MatchGoal & { player: User | null; playerName: string | null; assistPlayer: User | null; assistPlayerName: string | null })[] })[]>;
  getLeagueFixture(id: string): Promise<(LeagueFixture & { homeTeam: LeagueTeam | null; awayTeam: LeagueTeam | null }) | undefined>;
  createLeagueFixture(fixture: InsertLeagueFixture): Promise<LeagueFixture>;
  updateLeagueFixtureScore(id: string, homeScore: number, awayScore: number): Promise<LeagueFixture | undefined>;
  updateLeagueFixtureDate(id: string, matchDate: Date): Promise<LeagueFixture | undefined>;
  updateLeagueFixturePostponed(id: string, isPostponed: boolean): Promise<LeagueFixture | undefined>;
  updateLeagueFixtureForfeit(id: string, isForfeit: boolean): Promise<LeagueFixture | undefined>;
  updateLeagueFixtureWithDetails(id: string, homeScore: number, awayScore: number, goals: InsertMatchGoal[], matchRecordingUrl?: string, isPostponed?: boolean): Promise<LeagueFixture | undefined>;
  deleteLeagueFixture(id: string): Promise<void>;
  
  // Match goals operations
  getMatchGoals(fixtureId: string): Promise<(MatchGoal & { player: User | null; playerName: string | null; assistPlayer: User | null; assistPlayerName: string | null })[]>;
  createMatchGoal(goal: InsertMatchGoal): Promise<MatchGoal>;
  deleteMatchGoalsByFixture(fixtureId: string): Promise<void>;
  
  // Player match stats operations
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  getPlayerStatsByFixture(fixtureId: string): Promise<(PlayerStats & { user: User; team: LeagueTeam })[]>;
  getPlayerStatsLeaderboard(): Promise<Array<{ userId: string; username: string; teamId: string | null; teamName: string | null; teamLogo: string | null; totalGoals: number; totalAssists: number; totalDm: number; totalCleanSheets: number; totalSaves: number }>>;
  updatePlayerMatchStats(id: string, updates: Partial<PlayerStats>): Promise<PlayerStats | undefined>;
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
    // Filter out undefined values to avoid database issues
    // Explicitly exclude editedAt to avoid column not found errors
    const cleanPost: any = {
      userId: post.userId,
      title: post.title,
      content: post.content,
      category: post.category,
    };
    
    // Only include imageUrl if it's defined and not empty
    if (post.imageUrl !== undefined && post.imageUrl !== null && post.imageUrl !== '') {
      cleanPost.imageUrl = post.imageUrl;
    }
    
    // Explicitly exclude editedAt - it's optional and should not be set on creation
    // This prevents errors if the column doesn't exist yet in the database
    
    try {
      // Insert without returning to avoid edited_at column error
      // Use raw SQL to insert and get the ID back
      const result = await db.execute(sql`
        INSERT INTO forum_posts (user_id, title, content, category, image_url, is_locked, is_archived, created_at)
        VALUES (${cleanPost.userId}, ${cleanPost.title}, ${cleanPost.content}, ${cleanPost.category}, ${cleanPost.imageUrl || null}, false, false, NOW())
        RETURNING id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
      `);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error("Failed to create forum post - no post returned");
      }
      
      const row = result.rows[0] as any;
      
      // Map the raw SQL result to ForumPost type
      const forumPost: ForumPost = {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        category: row.category,
        imageUrl: row.image_url || null,
        isLocked: row.is_locked,
        isArchived: row.is_archived,
        createdAt: row.created_at,
        editedAt: null, // Will be set when column exists
      };
      
      return forumPost;
    } catch (error: any) {
      console.error("Error in createForumPost:", error);
      console.error("Post data:", post);
      console.error("Clean post data:", cleanPost);
      console.error("Error stack:", error?.stack);
      console.error("Error code:", error?.code);
      console.error("Error constraint:", error?.constraint);
      console.error("Error detail:", error?.detail);
      throw error; // Re-throw to be caught by route handler
    }
  }

  async getForumPosts(category?: string, includeArchived: boolean = false): Promise<(ForumPost & { user: User; replyCount: number })[]> {
    try {
      let posts: any[];
      
      // Use sql template with db.execute to avoid Drizzle schema issues with edited_at column
      // But select only existing columns
      if (category) {
        if (includeArchived) {
          const result = await db.execute(sql`
            SELECT id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
            FROM forum_posts
            WHERE category = ${category}
            ORDER BY created_at DESC
          `);
          posts = result.rows as any[];
        } else {
          const result = await db.execute(sql`
            SELECT id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
            FROM forum_posts
            WHERE category = ${category} AND is_archived = false
            ORDER BY created_at DESC
          `);
          posts = result.rows as any[];
        }
      } else {
        if (includeArchived) {
          const result = await db.execute(sql`
            SELECT id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
            FROM forum_posts
            ORDER BY created_at DESC
          `);
          posts = result.rows as any[];
        } else {
          const result = await db.execute(sql`
            SELECT id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
            FROM forum_posts
            WHERE is_archived = false
            ORDER BY created_at DESC
          `);
          posts = result.rows as any[];
        }
      }
      
      // Map raw SQL results to ForumPost format
      const mappedPosts = posts.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        category: row.category,
        imageUrl: row.image_url || null,
        isLocked: row.is_locked,
        isArchived: row.is_archived,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        editedAt: null, // Will be set when column exists
      }));

      const postsWithUserAndCount = await Promise.all(
        mappedPosts.map(async (post) => {
          try {
            const [user] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
            if (!user) {
              console.error(`User not found for post ${post.id}, userId: ${post.userId}`);
              return null; // Skip posts with missing users
            }
            // Use sql template for replies count to avoid edited_at issues
            const repliesResult = await db.execute(sql`
              SELECT COUNT(*) as count
              FROM forum_replies
              WHERE post_id = ${post.id}
            `);
            const replyCount = repliesResult.rows[0] ? parseInt((repliesResult.rows[0] as any).count) : 0;
            return { ...post, user, replyCount };
          } catch (error: any) {
            console.error(`Error processing post ${post.id}:`, error);
            return null; // Skip posts with errors
          }
        })
      );

      // Filter out null posts (posts with missing users or errors)
      return postsWithUserAndCount.filter((post) => post !== null) as (ForumPost & { user: User; replyCount: number })[];
    } catch (error: any) {
      console.error("Error in getForumPosts:", error);
      console.error("Error stack:", error?.stack);
      throw error; // Re-throw to be caught by route handler
    }
  }

  async getForumPost(id: string): Promise<(ForumPost & { user: User }) | undefined> {
    try {
      // Use raw SQL to avoid edited_at column issues
      const result = await db.execute(sql`
        SELECT id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
        FROM forum_posts
        WHERE id = ${id}
        LIMIT 1
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0] as any;
      const post: ForumPost = {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        category: row.category,
        imageUrl: row.image_url || null,
        isLocked: row.is_locked,
        isArchived: row.is_archived,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        editedAt: null,
      };
      
      const [user] = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
      if (!user) return undefined;
      
      return { ...post, user };
    } catch (error: any) {
      console.error("Error in getForumPost:", error);
      throw error;
    }
  }

  async updateForumPost(id: string, updates: Partial<ForumPost>): Promise<ForumPost | undefined> {
    try {
      // Build update query dynamically
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (updates.title !== undefined) {
        updateParts.push(`title = $${paramIndex}`);
        values.push(updates.title);
        paramIndex++;
      }
      if (updates.content !== undefined) {
        updateParts.push(`content = $${paramIndex}`);
        values.push(updates.content);
        paramIndex++;
      }
      if (updates.category !== undefined) {
        updateParts.push(`category = $${paramIndex}`);
        values.push(updates.category);
        paramIndex++;
      }
      if (updates.imageUrl !== undefined) {
        updateParts.push(`image_url = $${paramIndex}`);
        values.push(updates.imageUrl);
        paramIndex++;
      }
      if (updates.isLocked !== undefined) {
        updateParts.push(`is_locked = $${paramIndex}`);
        values.push(updates.isLocked);
        paramIndex++;
      }
      if (updates.isArchived !== undefined) {
        updateParts.push(`is_archived = $${paramIndex}`);
        values.push(updates.isArchived);
        paramIndex++;
      }
      
      if (updateParts.length === 0) {
        // No updates, just return the post
        return await this.getForumPost(id);
      }
      
      // Use pool directly for dynamic updates
      values.push(id);
      const setClause = updateParts.join(', ');
      const queryText = `
        UPDATE forum_posts
        SET ${setClause}
        WHERE id = $${paramIndex}
        RETURNING id, user_id, title, content, category, image_url, is_locked, is_archived, created_at
      `;
      
      const result = await pool.query(queryText, values);
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        category: row.category,
        imageUrl: row.image_url || null,
        isLocked: row.is_locked,
        isArchived: row.is_archived,
        createdAt: row.created_at,
        editedAt: null,
      };
    } catch (error: any) {
      console.error("Error in updateForumPost:", error);
      throw error;
    }
  }

  async deleteForumPost(id: string): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  // Forum reply operations
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    try {
      // Use raw SQL to avoid edited_at column issues
      const result = await db.execute(sql`
        INSERT INTO forum_replies (post_id, user_id, content, image_url, quoted_reply_id, created_at)
        VALUES (${reply.postId}, ${reply.userId}, ${reply.content}, ${reply.imageUrl || null}, ${reply.quotedReplyId || null}, NOW())
        RETURNING id, post_id, user_id, content, image_url, quoted_reply_id, created_at
      `);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error("Failed to create forum reply - no reply returned");
      }
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        postId: row.post_id,
        userId: row.user_id,
        content: row.content,
        imageUrl: row.image_url || null,
        quotedReplyId: row.quoted_reply_id || null,
        createdAt: row.created_at,
        editedAt: null,
      };
    } catch (error: any) {
      console.error("Error in createForumReply:", error);
      throw error;
    }
  }

  async getForumReplies(postId: string): Promise<(ForumReply & { user: User; quotedReply?: ForumReply & { user: User } })[]> {
    try {
      // Use raw SQL to avoid edited_at column issues
      // Order by created_at ASC (oldest first, newest at bottom)
      const result = await db.execute(sql`
        SELECT id, post_id, user_id, content, image_url, quoted_reply_id, created_at
        FROM forum_replies
        WHERE post_id = ${postId}
        ORDER BY created_at ASC
      `);
      
      const replies = result.rows.map((row: any) => ({
        id: row.id,
        postId: row.post_id,
        userId: row.user_id,
        content: row.content,
        imageUrl: row.image_url || null,
        quotedReplyId: row.quoted_reply_id || null,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        editedAt: null,
      }));

      const repliesWithUser = await Promise.all(
        replies.map(async (reply) => {
          const [user] = await db.select().from(users).where(eq(users.id, reply.userId)).limit(1);
          
          // Get quoted reply if exists
          let quotedReply: (ForumReply & { user: User }) | undefined = undefined;
          if (reply.quotedReplyId) {
            try {
              const quotedResult = await db.execute(sql`
                SELECT id, post_id, user_id, content, image_url, quoted_reply_id, created_at
                FROM forum_replies
                WHERE id = ${reply.quotedReplyId}
                LIMIT 1
              `);
              
              if (quotedResult.rows && quotedResult.rows.length > 0) {
                const quotedRow = quotedResult.rows[0] as any;
                const [quotedUser] = await db.select().from(users).where(eq(users.id, quotedRow.user_id)).limit(1);
                if (quotedUser) {
                  quotedReply = {
                    id: quotedRow.id,
                    postId: quotedRow.post_id,
                    userId: quotedRow.user_id,
                    content: quotedRow.content,
                    imageUrl: quotedRow.image_url || null,
                    quotedReplyId: quotedRow.quoted_reply_id || null,
                    createdAt: quotedRow.created_at instanceof Date ? quotedRow.created_at : new Date(quotedRow.created_at),
                    editedAt: null,
                    user: quotedUser,
                  };
                }
              }
            } catch (e) {
              console.error("Error fetching quoted reply:", e);
            }
          }
          
          return { ...reply, user, quotedReply };
        })
      );

      return repliesWithUser;
    } catch (error: any) {
      console.error("Error in getForumReplies:", error);
      throw error;
    }
  }

  async getForumReply(id: string): Promise<(ForumReply & { user: User }) | undefined> {
    try {
      // Use raw SQL to avoid edited_at column issues
      const result = await db.execute(sql`
        SELECT id, post_id, user_id, content, image_url, quoted_reply_id, created_at
        FROM forum_replies
        WHERE id = ${id}
        LIMIT 1
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0] as any;
      const reply: ForumReply = {
        id: row.id,
        postId: row.post_id,
        userId: row.user_id,
        content: row.content,
        imageUrl: row.image_url || null,
        quotedReplyId: row.quoted_reply_id || null,
        createdAt: row.created_at,
        editedAt: null,
      };
      
      const [user] = await db.select().from(users).where(eq(users.id, reply.userId)).limit(1);
      if (!user) return undefined;
      
      return { ...reply, user };
    } catch (error: any) {
      console.error("Error in getForumReply:", error);
      throw error;
    }
  }

  async updateForumReply(id: string, updates: Partial<ForumReply>): Promise<ForumReply | undefined> {
    try {
      // Build update query dynamically
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (updates.content !== undefined) {
        updateParts.push(`content = $${paramIndex}`);
        values.push(updates.content);
        paramIndex++;
      }
      if (updates.imageUrl !== undefined) {
        updateParts.push(`image_url = $${paramIndex}`);
        values.push(updates.imageUrl);
        paramIndex++;
      }
      
      if (updateParts.length === 0) {
        // No updates, just return the reply
        return await this.getForumReply(id);
      }
      
      // Use pool directly for dynamic updates
      values.push(id);
      const setClause = updateParts.join(', ');
      const queryText = `
        UPDATE forum_replies
        SET ${setClause}
        WHERE id = $${paramIndex}
        RETURNING id, post_id, user_id, content, image_url, quoted_reply_id, created_at
      `;
      
      const result = await pool.query(queryText, values);
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        postId: row.post_id,
        userId: row.user_id,
        content: row.content,
        imageUrl: row.image_url || null,
        quotedReplyId: row.quoted_reply_id || null,
        createdAt: row.created_at,
        editedAt: null,
      };
    } catch (error: any) {
      console.error("Error in updateForumReply:", error);
      throw error;
    }
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
    try {
      // Check if image_url column exists, if not, don't include it in insert
      let hasImageUrl = false;
      try {
        const columnCheck = await db.execute(sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'private_messages'
            AND column_name = 'image_url'
          )
        `);
        hasImageUrl = columnCheck.rows[0] ? (columnCheck.rows[0] as any).exists : false;
      } catch (e) {
        // If check fails, assume column doesn't exist
        hasImageUrl = false;
      }
      
      // Use raw SQL to ensure compatibility
      let result;
      if (hasImageUrl) {
        result = await db.execute(sql`
          INSERT INTO private_messages (sender_id, receiver_id, message, image_url, is_read, created_at)
          VALUES (${message.senderId}, ${message.receiverId}, ${message.message}, ${message.imageUrl || null}, false, NOW())
          RETURNING id, sender_id, receiver_id, message, image_url, is_read, created_at
        `);
      } else {
        // If image_url column doesn't exist, insert without it
        result = await db.execute(sql`
          INSERT INTO private_messages (sender_id, receiver_id, message, is_read, created_at)
          VALUES (${message.senderId}, ${message.receiverId}, ${message.message}, false, NOW())
          RETURNING id, sender_id, receiver_id, message, is_read, created_at
        `);
      }
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error("Failed to create private message - no message returned");
      }
      
      const row = result.rows[0] as any;
      return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        message: row.message,
        imageUrl: hasImageUrl ? (row.image_url || null) : null,
        isRead: row.is_read,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
      };
    } catch (error: any) {
      console.error("Error in sendPrivateMessage:", error);
      console.error("Message data:", message);
      console.error("Error stack:", error?.stack);
      console.error("Error code:", error?.code);
      console.error("Error constraint:", error?.constraint);
      console.error("Error detail:", error?.detail);
      throw error;
    }
  }

  async getConversations(userId: string): Promise<Array<{ otherUser: User; lastMessage: PrivateMessage; unreadCount: number }>>  {
    const { or, and } = await import("drizzle-orm");
    
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

  async getLeagueFixtures(): Promise<(LeagueFixture & { homeTeam: LeagueTeam | null; awayTeam: LeagueTeam | null; goals: (MatchGoal & { player: User | null; playerName: string | null; assistPlayer: User | null; assistPlayerName: string | null })[] })[]> {
    const { asc, inArray } = await import("drizzle-orm");
    
    // Get all fixtures and teams in parallel (2 queries instead of N+1)
    const [fixtures, allTeams] = await Promise.all([
      db.select().from(leagueFixtures).orderBy(asc(leagueFixtures.week), asc(leagueFixtures.matchDate)),
      db.select().from(leagueTeams)
    ]);
    
    // Create a map of teams for O(1) lookup
    const teamMap = new Map(allTeams.map(team => [team.id, team]));
    
    // Get all goals for played fixtures in a single batch query
    const playedFixtureIds = fixtures
      .filter(f => f.isPlayed && !f.isBye)
      .map(f => f.id);
    
    let allGoals: any[] = [];
    if (playedFixtureIds.length > 0) {
      // Fetch all goals for all fixtures in one query
      const goals = await db
        .select()
        .from(matchGoals)
        .where(inArray(matchGoals.fixtureId, playedFixtureIds));
      
      if (goals.length > 0) {
        // Get all unique user IDs
        const userIds = new Set<string>();
        goals.forEach(goal => {
          if (goal.playerId) userIds.add(goal.playerId);
          if (goal.assistPlayerId) userIds.add(goal.assistPlayerId);
        });
        
        // Fetch all users in one query
        const usersList = userIds.size > 0
          ? await db.select().from(users).where(inArray(users.id, Array.from(userIds)))
          : [];
        
        const userMap = new Map(usersList.map(user => [user.id, user]));
        
        // Map goals with users
        allGoals = goals.map(goal => ({
          ...goal,
          player: goal.playerId ? (userMap.get(goal.playerId) || null) : null,
          playerName: goal.playerName || null,
          assistPlayer: goal.assistPlayerId ? (userMap.get(goal.assistPlayerId) || null) : null,
          assistPlayerName: goal.assistPlayerName || null,
        }));
      }
    }
    
    // Group goals by fixture ID
    const goalsByFixture = new Map<string, any[]>();
    allGoals.forEach(goal => {
      if (!goalsByFixture.has(goal.fixtureId)) {
        goalsByFixture.set(goal.fixtureId, []);
      }
      goalsByFixture.get(goal.fixtureId)!.push(goal);
    });
    
    // Map fixtures with teams and goals (O(n) instead of O(n*2) queries)
    return fixtures.map(fixture => ({
      ...fixture,
      homeTeam: fixture.homeTeamId ? (teamMap.get(fixture.homeTeamId) || null) : null,
      awayTeam: fixture.awayTeamId ? (teamMap.get(fixture.awayTeamId) || null) : null,
      goals: goalsByFixture.get(fixture.id) || [],
    }));
  }

  async getLeagueFixture(id: string): Promise<(LeagueFixture & { homeTeam: LeagueTeam | null; awayTeam: LeagueTeam | null }) | undefined> {
    const [fixture] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    if (!fixture) return undefined;
    
    const homeTeam = fixture.homeTeamId ? await this.getLeagueTeam(fixture.homeTeamId) : null;
    const awayTeam = fixture.awayTeamId ? await this.getLeagueTeam(fixture.awayTeamId) : null;
    
    return {
      ...fixture,
      homeTeam: homeTeam || null,
      awayTeam: awayTeam || null,
    };
  }

  async createLeagueFixture(fixture: InsertLeagueFixture): Promise<LeagueFixture> {
    const [newFixture] = await db.insert(leagueFixtures).values(fixture).returning();
    return newFixture;
  }

  async updateLeagueFixtureScore(id: string, homeScore: number, awayScore: number): Promise<LeagueFixture | undefined> {
    const fixture = await this.getLeagueFixture(id);
    if (!fixture) return undefined;

    // BAY geçme durumunda skor güncellemesi yapılamaz
    if (fixture.isBye) {
      throw new Error("BAY geçme durumunda skor güncellenemez");
    }

    // If match was already played, revert the previous score effects
    if (fixture.isPlayed && fixture.homeScore !== null && fixture.awayScore !== null && fixture.homeTeamId && fixture.awayTeamId) {
      await this.revertMatchResult(fixture.homeTeamId, fixture.awayTeamId, fixture.homeScore, fixture.awayScore);
    }

    // Update fixture - preserve matchDate and week
    await db.update(leagueFixtures).set({
      homeScore,
      awayScore,
      isPlayed: true,
      // matchDate and week are preserved automatically, but explicitly set to ensure they're not lost
      matchDate: fixture.matchDate,
      week: fixture.week,
    }).where(eq(leagueFixtures.id, id));

    // Update team standings (only if both teams exist)
    if (fixture.homeTeamId && fixture.awayTeamId) {
      await this.updateTeamStandings(fixture.homeTeamId, fixture.awayTeamId, homeScore, awayScore);
    }

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

  async updateLeagueFixtureDate(id: string, matchDate: Date): Promise<LeagueFixture | undefined> {
    await db.update(leagueFixtures).set({ matchDate }).where(eq(leagueFixtures.id, id));
    const [updated] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    return updated;
  }

  async updateLeagueFixturePostponed(id: string, isPostponed: boolean): Promise<LeagueFixture | undefined> {
    await db.update(leagueFixtures).set({ isPostponed }).where(eq(leagueFixtures.id, id));
    const [updated] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    return updated;
  }

  async updateLeagueFixtureForfeit(id: string, isForfeit: boolean): Promise<LeagueFixture | undefined> {
    await db.update(leagueFixtures).set({ isForfeit }).where(eq(leagueFixtures.id, id));
    const [updated] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    return updated;
  }

  async updateLeagueFixtureWithDetails(
    id: string, 
    homeScore: number, 
    awayScore: number, 
    goals: InsertMatchGoal[], 
    matchRecordingUrl?: string,
    isPostponed?: boolean
  ): Promise<LeagueFixture | undefined> {
    const fixture = await this.getLeagueFixture(id);
    if (!fixture) return undefined;

    // BAY geçme durumunda skor güncellemesi yapılamaz
    if (fixture.isBye) {
      throw new Error("BAY geçme durumunda skor güncellenemez");
    }

    // If match was already played, revert the previous score effects
    if (fixture.isPlayed && fixture.homeScore !== null && fixture.awayScore !== null && fixture.homeTeamId && fixture.awayTeamId) {
      await this.revertMatchResult(fixture.homeTeamId, fixture.awayTeamId, fixture.homeScore, fixture.awayScore);
    }

    // Delete existing goals for this fixture
    await this.deleteMatchGoalsByFixture(id);

    // Insert new goals with fixtureId
    if (goals.length > 0) {
      const goalsWithFixtureId = goals.map(goal => ({
        ...goal,
        fixtureId: id,
      }));
      await db.insert(matchGoals).values(goalsWithFixtureId);
    }

    // Update fixture
    const updateData: any = {
      homeScore,
      awayScore,
      isPlayed: true,
      matchDate: fixture.matchDate,
      week: fixture.week,
    };
    if (matchRecordingUrl !== undefined) {
      updateData.matchRecordingUrl = matchRecordingUrl;
    }
    if (isPostponed !== undefined) {
      updateData.isPostponed = isPostponed;
    }
    
    await db.update(leagueFixtures).set(updateData).where(eq(leagueFixtures.id, id));

    // Update team standings (only if both teams exist)
    if (fixture.homeTeamId && fixture.awayTeamId) {
      await this.updateTeamStandings(fixture.homeTeamId, fixture.awayTeamId, homeScore, awayScore);
    }

    const [updated] = await db.select().from(leagueFixtures).where(eq(leagueFixtures.id, id)).limit(1);
    return updated;
  }

  async deleteLeagueFixture(id: string): Promise<void> {
    await db.delete(leagueFixtures).where(eq(leagueFixtures.id, id));
  }

  // Match goals operations
  async getMatchGoals(fixtureId: string): Promise<(MatchGoal & { player: User | null; playerName: string | null; assistPlayer: User | null; assistPlayerName: string | null })[]> {
    const goals = await db.select().from(matchGoals).where(eq(matchGoals.fixtureId, fixtureId));
    
    if (goals.length === 0) {
      return [];
    }
    
    // Get all unique user IDs
    const userIds = new Set<string>();
    goals.forEach(goal => {
      if (goal.playerId) userIds.add(goal.playerId);
      if (goal.assistPlayerId) userIds.add(goal.assistPlayerId);
    });
    
    // Fetch all users in a single query instead of N queries
    const users = userIds.size > 0 
      ? await db.select().from(users).where(inArray(users.id, Array.from(userIds)))
      : [];
    
    // Create a map for O(1) lookup
    const userMap = new Map(users.map(user => [user.id, user]));
    
    // Map goals with users
    return goals.map(goal => ({
      ...goal,
      player: goal.playerId ? (userMap.get(goal.playerId) || null) : null,
      playerName: goal.playerName || null,
      assistPlayer: goal.assistPlayerId ? (userMap.get(goal.assistPlayerId) || null) : null,
      assistPlayerName: goal.assistPlayerName || null,
    }));
  }

  async createMatchGoal(goal: InsertMatchGoal): Promise<MatchGoal> {
    const [newGoal] = await db.insert(matchGoals).values(goal).returning();
    return newGoal;
  }

  async deleteMatchGoalsByFixture(fixtureId: string): Promise<void> {
    await db.delete(matchGoals).where(eq(matchGoals.fixtureId, fixtureId));
  }

  // Player match stats operations
  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [newStats] = await db.insert(playerStats).values(stats).returning();
    return newStats;
  }

  async getPlayerStatsByFixture(fixtureId: string): Promise<(PlayerStats & { user: User | null; team: LeagueTeam; playerName: string | null })[]> {
    const stats = await db.select()
      .from(playerStats)
      .where(eq(playerStats.fixtureId, fixtureId));
    
    const result = [];
    for (const stat of stats) {
      const user = stat.userId ? await this.getUser(stat.userId) : null;
      const [team] = await db.select().from(leagueTeams).where(eq(leagueTeams.id, stat.teamId)).limit(1);
      if (team) {
        result.push({ ...stat, user: user || null, team, playerName: stat.playerName || null });
      }
    }
    return result;
  }

  async getPlayerStatsLeaderboard(): Promise<Array<{ userId: string; username: string; teamId: string | null; teamName: string | null; teamLogo: string | null; totalGoals: number; totalAssists: number; totalDm: number; totalCleanSheets: number; totalSaves: number }>> {
    const { sql, sum } = await import("drizzle-orm");
    
    // Get aggregated stats per user
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
    
    // Get latest team for each user (most recent stat's team)
    // We need to handle both userId-based and playerName-based stats
    const userIds = leaderboard.map(row => row.userId).filter((id): id is string => id !== null);
    const usernames = leaderboard.map(row => row.username).filter((name): name is string => name !== null && name !== '');
    
    // Get latest teams for users by userId
    const latestTeamsByUserId = userIds.length > 0
      ? await db
          .select({
            userId: playerStats.userId,
            teamId: playerStats.teamId,
          })
          .from(playerStats)
          .where(inArray(playerStats.userId, userIds))
          .orderBy(desc(playerStats.createdAt))
      : [];
    
    // Get latest teams for users by playerName (for stats without userId)
    const latestTeamsByPlayerName = usernames.length > 0
      ? await db
          .select({
            userId: playerStats.userId,
            teamId: playerStats.teamId,
            playerName: playerStats.playerName,
          })
          .from(playerStats)
          .where(inArray(playerStats.playerName, usernames))
          .orderBy(desc(playerStats.createdAt))
      : [];
    
    // Combine both approaches
    const allLatestTeams = [...latestTeamsByUserId, ...latestTeamsByPlayerName];
    
    // Get unique team IDs
    const teamIds = [...new Set(allLatestTeams.map(t => t.teamId).filter((id): id is string => id !== null))];
    
    const teams = teamIds.length > 0
      ? await db.select().from(leagueTeams).where(inArray(leagueTeams.id, teamIds))
      : [];
    
    const teamMap = new Map(teams.map(team => [team.id, team]));
    
    // Create a map of userId -> latest teamId
    const userTeamMap = new Map<string, string | null>();
    latestTeamsByUserId.forEach(stat => {
      if (stat.userId && !userTeamMap.has(stat.userId)) {
        userTeamMap.set(stat.userId, stat.teamId);
      }
    });
    
    // Create a map of username -> latest teamId (for playerName-based stats)
    const usernameTeamMap = new Map<string, string | null>();
    latestTeamsByPlayerName.forEach(stat => {
      if (stat.playerName && !usernameTeamMap.has(stat.playerName)) {
        usernameTeamMap.set(stat.playerName, stat.teamId);
      }
    });
    
    // Also map by username from userId-based stats - we need to get usernames from users table
    if (userIds.length > 0) {
      const usersWithTeams = await db
        .select({
          userId: playerStats.userId,
          teamId: playerStats.teamId,
          username: users.username,
        })
        .from(playerStats)
        .leftJoin(users, eq(playerStats.userId, users.id))
        .where(inArray(playerStats.userId, userIds))
        .orderBy(desc(playerStats.createdAt));
      
      usersWithTeams.forEach(stat => {
        if (stat.username && stat.teamId && !usernameTeamMap.has(stat.username)) {
          usernameTeamMap.set(stat.username, stat.teamId);
        }
      });
    }
    
    return leaderboard.map(row => {
      // Try to get team by userId first, then by username
      let teamId: string | null = null;
      if (row.userId) {
        teamId = userTeamMap.get(row.userId) || null;
      }
      if (!teamId && row.username) {
        teamId = usernameTeamMap.get(row.username) || null;
      }
      
      const team = teamId ? teamMap.get(teamId) : null;
      return {
        userId: row.userId,
        username: row.username || '',
        teamId: team?.id || null,
        teamName: team?.name || null,
        teamLogo: team?.logo || null,
        totalGoals: Number(row.totalGoals) || 0,
        totalAssists: Number(row.totalAssists) || 0,
        totalDm: Number(row.totalDm) || 0,
        totalCleanSheets: Number(row.totalCleanSheets) || 0,
        totalSaves: Number(row.totalSaves) || 0,
      };
    });
  }

  async updatePlayerMatchStats(id: string, updates: Partial<PlayerStats>): Promise<PlayerStats | undefined> {
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
    try {
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
    } catch (error: any) {
      // Tablo yoksa veya hata varsa boş array döndür
      console.error("Error getting user custom roles:", error);
      return [];
    }
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
