import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  year: integer("year").default(1),
  canAccessYears: jsonb("can_access_years").default([1]).notNull(),
  canEditYears: jsonb("can_edit_years").default([]).notNull(),
});

// Dashboard Quick Access Cards
export const quickAccessCards = pgTable("quick_access_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  link: text("link").notNull(),
  year: integer("year").notNull(),
  order: integer("order").notNull(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["info", "warning", "error"] }).notNull().default("info"),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(),
});

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  link: text("link").notNull(),
  icon: text("icon").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertQuickAccessCardSchema = createInsertSchema(quickAccessCards).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuickAccessCard = typeof quickAccessCards.$inferSelect;
export type InsertQuickAccessCard = z.infer<typeof insertQuickAccessCardSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

// Auth Schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
