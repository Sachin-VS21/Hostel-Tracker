import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // 'student' | 'admin'
  name: text("name").notNull(),
  hostel: text("hostel"),
  room: text("room"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'Plumbing', 'Electrical', 'Cleanliness', 'Internet', 'Furniture', 'Others'
  priority: text("priority").notNull().default("Medium"), // 'Low', 'Medium', 'High', 'Emergency'
  status: text("status").notNull().default("Open"), // 'Open', 'In Progress', 'Resolved'
  visibility: text("visibility").notNull().default("public"), // 'public' | 'private'
  mediaUrl: text("media_url"),
  location: text("location"), // "Hostel A - Room 101"
  reporterId: integer("reporter_id").notNull(), // Foreign key to users.id logic
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  target: text("target"), // "Hostel A", "All"
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  urgent: boolean("urgent").default(false),
});

export const lostFound = pgTable("lost_found", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'Lost' | 'Found'
  status: text("status").notNull().default("Open"), // 'Open' | 'Claimed'
  location: text("location"),
  imageUrl: text("image_url"),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdAt: true, updatedAt: true, reporterId: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, userId: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, authorId: true });
export const insertLostFoundSchema = createInsertSchema(lostFound).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type LostFound = typeof lostFound.$inferSelect;
export type InsertLostFound = z.infer<typeof insertLostFoundSchema>;
