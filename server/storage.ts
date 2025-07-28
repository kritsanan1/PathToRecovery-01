import {
  users,
  moodEntries,
  milestones,
  resources,
  communityPosts,
  emergencyContacts,
  rehabCenters,
  discussionChannels,
  channelMessages,
  doctors,
  consultations,
  chatbotConversations,
  chatbotMessages,
  contentCategories,
  enhancedResources,
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
  type DiscussionChannel,
  type InsertDiscussionChannel,
  type ChannelMessage,
  type InsertChannelMessage,
  type Doctor,
  type InsertDoctor,
  type Consultation,
  type InsertConsultation,
  type ChatbotConversation,
  type InsertChatbotConversation,
  type ChatbotMessage,
  type InsertChatbotMessage,
  type ContentCategory,
  type InsertContentCategory,
  type EnhancedResource,
  type InsertEnhancedResource,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void>;
  
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
  
  // Enhanced content management
  getContentCategories(): Promise<ContentCategory[]>;
  createContentCategory(category: InsertContentCategory): Promise<ContentCategory>;
  getEnhancedResources(categoryId?: string): Promise<EnhancedResource[]>;
  createEnhancedResource(resource: InsertEnhancedResource): Promise<EnhancedResource>;
  getEnhancedResource(id: string): Promise<EnhancedResource | undefined>;
  updateResourceViews(id: string): Promise<void>;
  
  // Community
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number): Promise<CommunityPost[]>;
  
  // Discussion channels
  getDiscussionChannels(): Promise<DiscussionChannel[]>;
  createDiscussionChannel(channel: InsertDiscussionChannel): Promise<DiscussionChannel>;
  getChannelMessages(channelId: string, limit?: number): Promise<ChannelMessage[]>;
  createChannelMessage(message: InsertChannelMessage): Promise<ChannelMessage>;
  
  // Doctor consultation
  getDoctors(specialization?: string): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getConsultations(userId: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: string, status: string): Promise<Consultation>;
  
  // AI Chatbot
  getChatbotConversations(userId: string): Promise<ChatbotConversation[]>;
  createChatbotConversation(conversation: InsertChatbotConversation): Promise<ChatbotConversation>;
  getChatbotMessages(conversationId: string): Promise<ChatbotMessage[]>;
  createChatbotMessage(message: InsertChatbotMessage): Promise<ChatbotMessage>;
  
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

  async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isPremium, updatedAt: new Date() })
      .where(eq(users.id, userId));
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

  async createResource(resource: any): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
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

  // Enhanced content management
  async getContentCategories(): Promise<ContentCategory[]> {
    return db.select().from(contentCategories).orderBy(contentCategories.orderIndex);
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    const [newCategory] = await db.insert(contentCategories).values(category).returning();
    return newCategory;
  }

  async getEnhancedResources(categoryId?: string): Promise<EnhancedResource[]> {
    if (categoryId) {
      return db
        .select()
        .from(enhancedResources)
        .where(and(eq(enhancedResources.categoryId, categoryId), eq(enhancedResources.isPublished, true)))
        .orderBy(desc(enhancedResources.createdAt));
    }
    return db.select().from(enhancedResources).where(eq(enhancedResources.isPublished, true)).orderBy(desc(enhancedResources.createdAt));
  }

  async createEnhancedResource(resource: InsertEnhancedResource): Promise<EnhancedResource> {
    const [newResource] = await db.insert(enhancedResources).values(resource).returning();
    return newResource;
  }

  async getEnhancedResource(id: string): Promise<EnhancedResource | undefined> {
    const [resource] = await db.select().from(enhancedResources).where(eq(enhancedResources.id, id));
    return resource;
  }

  async updateResourceViews(id: string): Promise<void> {
    await db
      .update(enhancedResources)
      .set({ viewCount: sql`${enhancedResources.viewCount} + 1` })
      .where(eq(enhancedResources.id, id));
  }

  // Discussion channels
  async getDiscussionChannels(): Promise<DiscussionChannel[]> {
    return db.select().from(discussionChannels).orderBy(discussionChannels.name);
  }

  async createDiscussionChannel(channel: InsertDiscussionChannel): Promise<DiscussionChannel> {
    const [newChannel] = await db.insert(discussionChannels).values(channel).returning();
    return newChannel;
  }

  async getChannelMessages(channelId: string, limit = 50): Promise<ChannelMessage[]> {
    return db
      .select()
      .from(channelMessages)
      .where(eq(channelMessages.channelId, channelId))
      .orderBy(desc(channelMessages.createdAt))
      .limit(limit);
  }

  async createChannelMessage(message: InsertChannelMessage): Promise<ChannelMessage> {
    const [newMessage] = await db.insert(channelMessages).values(message).returning();
    return newMessage;
  }

  // Doctor consultation
  async getDoctors(specialization?: string): Promise<Doctor[]> {
    if (specialization) {
      return db
        .select()
        .from(doctors)
        .where(and(eq(doctors.specialization, specialization), eq(doctors.isAvailable, true)))
        .orderBy(desc(doctors.rating));
    }
    return db.select().from(doctors).where(eq(doctors.isAvailable, true)).orderBy(desc(doctors.rating));
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [newDoctor] = await db.insert(doctors).values(doctor).returning();
    return newDoctor;
  }

  async getConsultations(userId: string): Promise<Consultation[]> {
    return db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, userId))
      .orderBy(desc(consultations.createdAt));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations).values(consultation).returning();
    return newConsultation;
  }

  async updateConsultationStatus(id: string, status: string): Promise<Consultation> {
    const [updated] = await db
      .update(consultations)
      .set({ status })
      .where(eq(consultations.id, id))
      .returning();
    return updated;
  }

  // AI Chatbot
  async getChatbotConversations(userId: string): Promise<ChatbotConversation[]> {
    return db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.userId, userId))
      .orderBy(desc(chatbotConversations.updatedAt));
  }

  async createChatbotConversation(conversation: InsertChatbotConversation): Promise<ChatbotConversation> {
    const [newConversation] = await db.insert(chatbotConversations).values(conversation).returning();
    return newConversation;
  }

  async getChatbotMessages(conversationId: string): Promise<ChatbotMessage[]> {
    return db
      .select()
      .from(chatbotMessages)
      .where(eq(chatbotMessages.conversationId, conversationId))
      .orderBy(chatbotMessages.createdAt);
  }

  async createChatbotMessage(message: InsertChatbotMessage): Promise<ChatbotMessage> {
    const [newMessage] = await db.insert(chatbotMessages).values(message).returning();
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
