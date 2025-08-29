import { type User, type InsertUser, type ToolUsage, type InsertToolUsage, type FileProcessingJob, type InsertFileProcessingJob, type CurrencyRate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  trackToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsageStats(): Promise<Record<string, number>>;
  createFileProcessingJob(job: InsertFileProcessingJob): Promise<FileProcessingJob>;
  updateFileProcessingJob(id: string, updates: Partial<FileProcessingJob>): Promise<void>;
  getFileProcessingJob(id: string): Promise<FileProcessingJob | undefined>;
  getExpiredJobs(): Promise<FileProcessingJob[]>;
  deleteFileProcessingJob(id: string): Promise<void>;
  saveCurrencyRate(baseCurrency: string, targetCurrency: string, rate: number): Promise<void>;
  getCurrencyRate(baseCurrency: string, targetCurrency: string): Promise<CurrencyRate | undefined>;
  getCurrencyRates(baseCurrency: string): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private toolUsages: Map<string, ToolUsage>;
  private fileJobs: Map<string, FileProcessingJob>;
  private currencyRates: Map<string, CurrencyRate>;

  constructor() {
    this.users = new Map();
    this.toolUsages = new Map();
    this.fileJobs = new Map();
    this.currencyRates = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      settings: {},
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async trackToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const id = randomUUID();
    const toolUsage: ToolUsage = {
      ...usage,
      id,
      userId: null, // Anonymous usage for now
      usedAt: new Date()
    };
    this.toolUsages.set(id, toolUsage);
    return toolUsage;
  }

  async getToolUsageStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    for (const usage of this.toolUsages.values()) {
      stats[usage.toolId] = (stats[usage.toolId] || 0) + 1;
    }
    
    return stats;
  }

  async createFileProcessingJob(job: InsertFileProcessingJob): Promise<FileProcessingJob> {
    const id = randomUUID();
    const fileJob: FileProcessingJob = {
      ...job,
      id,
      userId: null,
      status: 'pending',
      progress: 0,
      resultPath: null,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: null,
      deleteAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    };
    this.fileJobs.set(id, fileJob);
    return fileJob;
  }

  async updateFileProcessingJob(id: string, updates: Partial<FileProcessingJob>): Promise<void> {
    const existing = this.fileJobs.get(id);
    if (existing) {
      this.fileJobs.set(id, { ...existing, ...updates });
    }
  }

  async getFileProcessingJob(id: string): Promise<FileProcessingJob | undefined> {
    return this.fileJobs.get(id);
  }

  async getExpiredJobs(): Promise<FileProcessingJob[]> {
    const now = new Date();
    return Array.from(this.fileJobs.values()).filter(job => 
      job.deleteAt && job.deleteAt <= now
    );
  }

  async deleteFileProcessingJob(id: string): Promise<void> {
    this.fileJobs.delete(id);
  }

  async saveCurrencyRate(baseCurrency: string, targetCurrency: string, rate: number): Promise<void> {
    const id = randomUUID();
    const rateData: CurrencyRate = {
      id,
      baseCurrency,
      targetCurrency,
      rate,
      lastUpdated: new Date()
    };
    
    const key = `${baseCurrency}-${targetCurrency}`;
    this.currencyRates.set(key, rateData);
  }

  async getCurrencyRate(baseCurrency: string, targetCurrency: string): Promise<CurrencyRate | undefined> {
    const key = `${baseCurrency}-${targetCurrency}`;
    return this.currencyRates.get(key);
  }

  async getCurrencyRates(baseCurrency: string): Promise<Record<string, number>> {
    const rates: Record<string, number> = {};
    
    for (const [key, rateData] of this.currencyRates.entries()) {
      if (rateData.baseCurrency === baseCurrency) {
        rates[rateData.targetCurrency] = rateData.rate;
      }
    }
    
    return rates;
  }
}

export const storage = new MemStorage();
