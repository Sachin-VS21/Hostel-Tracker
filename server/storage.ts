import { users, issues, comments, announcements, lostFound, type User, type InsertUser, type Issue, type InsertIssue, type Comment, type InsertComment, type Announcement, type InsertAnnouncement, type LostFound, type InsertLostFound } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getIssues(): Promise<(Issue & { reporter: User })[]>;
  getIssue(id: number): Promise<(Issue & { reporter: User }) | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, updates: Partial<InsertIssue>): Promise<Issue>;
  
  getComments(issueId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  getLostFound(): Promise<LostFound[]>;
  createLostFound(item: InsertLostFound): Promise<LostFound>;
  updateLostFound(id: number, updates: Partial<InsertLostFound>): Promise<LostFound>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getIssues(): Promise<(Issue & { reporter: User })[]> {
    const result = await db
      .select({
        issue: issues,
        reporter: users,
      })
      .from(issues)
      .leftJoin(users, eq(issues.reporterId, users.id))
      .orderBy(desc(issues.createdAt));
    
    return result.map(({ issue, reporter }) => ({ ...issue, reporter: reporter! }));
  }

  async getIssue(id: number): Promise<(Issue & { reporter: User }) | undefined> {
    const [result] = await db
      .select({
        issue: issues,
        reporter: users,
      })
      .from(issues)
      .leftJoin(users, eq(issues.reporterId, users.id))
      .where(eq(issues.id, id));
    
    if (!result) return undefined;
    return { ...result.issue, reporter: result.reporter! };
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [newIssue] = await db.insert(issues).values(issue).returning();
    return newIssue;
  }

  async updateIssue(id: number, updates: Partial<InsertIssue>): Promise<Issue> {
    const [updatedIssue] = await db.update(issues).set(updates).where(eq(issues.id, id)).returning();
    return updatedIssue;
  }

  async getComments(issueId: number): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.issueId, issueId))
      .orderBy(comments.createdAt);
      
    return result.map(({ comment, user }) => ({ ...comment, user: user! }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async getLostFound(): Promise<LostFound[]> {
    return await db.select().from(lostFound).orderBy(desc(lostFound.createdAt));
  }

  async createLostFound(item: InsertLostFound): Promise<LostFound> {
    const [newItem] = await db.insert(lostFound).values(item).returning();
    return newItem;
  }

  async updateLostFound(id: number, updates: Partial<InsertLostFound>): Promise<LostFound> {
    const [updatedItem] = await db.update(lostFound).set(updates).where(eq(lostFound.id, id)).returning();
    return updatedItem;
  }
}

export const storage = new DatabaseStorage();
