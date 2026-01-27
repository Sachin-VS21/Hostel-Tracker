import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  const existing = await storage.getUserByUsername("student");
  if (existing) {
    console.log("Users exist, skipping seed.");
    return;
  }

  const studentPass = await hashPassword("student123");
  const student = await storage.createUser({
    username: "student",
    password: studentPass,
    role: "student",
    name: "John Student",
    hostel: "Hostel A",
    room: "101",
  });
  console.log("Created student user: student / student123");

  const adminPass = await hashPassword("admin123");
  const admin = await storage.createUser({
    username: "admin",
    password: adminPass,
    role: "admin",
    name: "Admin User",
    hostel: "Office",
    room: "001",
  });
  console.log("Created admin user: admin / admin123");

  const issue = await storage.createIssue({
    title: "Leaking Tap in Bathroom",
    description: "The tap in room 101 bathroom is dripping constantly.",
    category: "Plumbing",
    priority: "Medium",
    status: "Open",
    visibility: "public",
    location: "Hostel A - Room 101",
    reporterId: student.id,
  });
  console.log("Created sample issue");

  await storage.createComment({
    issueId: issue.id,
    userId: admin.id,
    content: "Maintenance has been notified.",
  });
  console.log("Created sample comment");

  await storage.createAnnouncement({
    title: "Water Supply Interruption",
    content: "Water supply will be off tomorrow from 10 AM to 2 PM for maintenance.",
    target: "Hostel A",
    authorId: admin.id,
    urgent: true,
  });
  console.log("Created sample announcement");

  await storage.createLostFound({
    title: "Blue Umbrella",
    description: "Found a blue umbrella in the common room.",
    type: "Found",
    status: "Open",
    location: "Common Room",
    contact: "Warden Office",
  });
  console.log("Created sample lost & found item");

  console.log("Seeding complete!");
}

seed().catch(console.error);
