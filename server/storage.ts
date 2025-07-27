import {
  users,
  moodEntries,
  milestones,
  resources,
  communityPosts,
  emergencyContacts,
  rehabCenters,
  type User,
  type UpsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type Milestone,
  type InsertMilestone,
  type Resource,
  type CommunityPost,
  type InsertCommunityPost,
  type EmergencyContact,
  type RehabCenter,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Mood tracking
  createMoodEntry(moodEntry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]>;
  getTodayMoodEntry(userId: string): Promise<MoodEntry | undefined>;
  
  // Milestones
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getUserMilestones(userId: string): Promise<Milestone[]>;
  updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone>;
  
  // Resources
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  
  // Community
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number): Promise<CommunityPost[]>;
  
  // Emergency and locations
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  getRehabCenters(): Promise<RehabCenter[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Mood tracking
  async createMoodEntry(moodEntry: InsertMoodEntry): Promise<MoodEntry> {
    const [entry] = await db.insert(moodEntries).values(moodEntry).returning();
    return entry;
  }

  async getUserMoodEntries(userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    if (startDate && endDate) {
      return db
        .select()
        .from(moodEntries)
        .where(
          and(
            eq(moodEntries.userId, userId),
            gte(moodEntries.date, startDate),
            lte(moodEntries.date, endDate)
          )
        )
        .orderBy(desc(moodEntries.date));
    }
    
    return db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.date));
  }

  async getTodayMoodEntry(userId: string): Promise<MoodEntry | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [entry] = await db
      .select()
      .from(moodEntries)
      .where(and(eq(moodEntries.userId, userId), eq(moodEntries.date, today)));
    return entry;
  }

  // Milestones
  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [newMilestone] = await db.insert(milestones).values(milestone).returning();
    return newMilestone;
  }

  async getUserMilestones(userId: string): Promise<Milestone[]> {
    return db.select().from(milestones).where(eq(milestones.userId, userId)).orderBy(milestones.targetDays);
  }

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const [updated] = await db
      .update(milestones)
      .set(updates)
      .where(eq(milestones.id, id))
      .returning();
    return updated;
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    return db.select().from(resources).where(eq(resources.isPublished, true)).orderBy(desc(resources.createdAt));
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return db
      .select()
      .from(resources)
      .where(and(eq(resources.category, category), eq(resources.isPublished, true)))
      .orderBy(desc(resources.createdAt));
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  // Community
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async getCommunityPosts(limit = 20): Promise<CommunityPost[]> {
    return db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
  }

  // Emergency and locations
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return db.select().from(emergencyContacts).orderBy(emergencyContacts.name);
  }

  async getRehabCenters(): Promise<RehabCenter[]> {
    return db.select().from(rehabCenters).orderBy(rehabCenters.name);
  }
}

export const storage = new DatabaseStorage();
