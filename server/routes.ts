import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // Issues
  app.get(api.issues.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const issues = await storage.getIssues();
    res.json(issues);
  });

  app.post(api.issues.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.issues.create.input.parse(req.body);
      const issue = await storage.createIssue({ ...input, reporterId: req.user!.id });
      res.status(201).json(issue);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.issues.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const issue = await storage.getIssue(Number(req.params.id));
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    
    const comments = await storage.getComments(issue.id);
    res.json({ ...issue, comments });
  });

  app.patch(api.issues.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.issues.update.input.parse(req.body);
      const issue = await storage.updateIssue(Number(req.params.id), input);
      res.json(issue);
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });

  // Comments
  app.post(api.comments.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.comments.create.input.parse(req.body);
      const comment = await storage.createComment({ ...input, userId: req.user!.id });
      res.status(201).json(comment);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Announcements
  app.get(api.announcements.list.path, async (req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.post(api.announcements.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    try {
      const input = api.announcements.create.input.parse(req.body);
      const announcement = await storage.createAnnouncement({ ...input, authorId: req.user!.id });
      res.status(201).json(announcement);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Lost & Found
  app.get(api.lostFound.list.path, async (req, res) => {
    const items = await storage.getLostFound();
    res.json(items);
  });

  app.post(api.lostFound.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.lostFound.create.input.parse(req.body);
      const item = await storage.createLostFound(input);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });
  
  app.patch(api.lostFound.update.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      try {
          const input = api.lostFound.update.input.parse(req.body);
          const item = await storage.updateLostFound(Number(req.params.id), input);
          res.json(item);
      } catch (err) {
          res.status(500).json({ message: "Update failed" });
      }
  });

  // Analytics
  app.get(api.analytics.get.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") return res.sendStatus(403);
    
    const issues = await storage.getIssues();
    const totalIssues = issues.length;
    const pendingIssues = issues.filter(i => i.status === "Open" || i.status === "In Progress").length;
    const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
    
    const byCategory: Record<string, number> = {};
    issues.forEach(i => {
      byCategory[i.category] = (byCategory[i.category] || 0) + 1;
    });

    res.json({
      totalIssues,
      pendingIssues,
      resolvedIssues,
      byCategory,
    });
  });

  // Seed Data (Basic)
  const existingUsers = await storage.getUserByUsername("student");
  if (!existingUsers) {
    // We can't use createUser directly with password here easily without hashing, but standard auth handles it.
    // Ideally we should run a seed script or just let the first user register.
    // But let's log to console that seeding is manual via register page for now to avoid complexity in this file.
    console.log("Database initialized. Please register a 'student' and 'admin' user via the UI.");
  }

  return httpServer;
}
