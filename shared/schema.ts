import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toolUsage = pgTable("tool_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  category: text("category").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
  sessionId: text("session_id"),
});

export const fileProcessingJobs = pgTable("file_processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  toolId: text("tool_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  progress: real("progress").default(0),
  resultPath: text("result_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  deleteAt: timestamp("delete_at"),
});

export const currencyRates = pgTable("currency_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: text("base_currency").notNull(),
  targetCurrency: text("target_currency").notNull(),
  rate: real("rate").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  language: text("language").default("en"),
  currency: text("currency").default("USD"),
  theme: text("theme").default("light"),
  timezone: text("timezone").default("UTC"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertToolUsageSchema = createInsertSchema(toolUsage).pick({
  toolId: true,
  category: true,
  sessionId: true,
});

export const insertFileProcessingJobSchema = createInsertSchema(fileProcessingJobs).pick({
  toolId: true,
  fileName: true,
  fileSize: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  language: true,
  currency: true,
  theme: true,
  timezone: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = z.infer<typeof insertToolUsageSchema>;
export type FileProcessingJob = typeof fileProcessingJobs.$inferSelect;
export type InsertFileProcessingJob = z.infer<typeof insertFileProcessingJobSchema>;
export type CurrencyRate = typeof currencyRates.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

// Tool definitions
export const toolCategories = {
  calculators: "Calculators",
  converters: "Converters",
  "image-tools": "Image Tools",
  "document-tools": "Document Tools",
  "audio-video-tools": "Audio & Video",
} as const;

export type ToolCategory = keyof typeof toolCategories;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  clientOnly: boolean;
  popular: boolean;
  tags: string[];
}
