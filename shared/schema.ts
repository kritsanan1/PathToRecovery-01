import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  recoveryStartDate: date("recovery_start_date"),
  isPremium: boolean("is_premium").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily mood check-ins
export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: varchar("mood").notNull(), // 'great', 'okay', 'struggling', 'crisis'
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recovery milestones
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  targetDays: integer("target_days").notNull(),
  achieved: boolean("achieved").default(false),
  achievedAt: timestamp("achieved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational resources
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: varchar("type").notNull(), // 'article', 'video', 'audio', 'exercise'
  category: varchar("category").notNull(), // 'mental_health', 'strategy', 'support'
  estimatedTime: integer("estimated_time"), // in minutes
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Emergency contacts
export const emergencyContacts = pgTable("emergency_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  description: text("description"),
  isAvailable24h: boolean("is_available_24h").default(false),
  category: varchar("category").notNull(), // 'hotline', 'hospital', 'counseling'
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rehabilitation centers
export const rehabCenters = pgTable("rehab_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phoneNumber: varchar("phone_number"),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  openingHours: text("opening_hours"),
  services: text("services"),
  isOpen24h: boolean("is_open_24h").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discussion channels for community organization
export const discussionChannels = pgTable("discussion_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'support', 'recovery_stories', 'daily_check_in', 'resources'
  isPrivate: boolean("is_private").default(false),
  moderatorId: varchar("moderator_id").references(() => users.id),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced community posts with channel support
export const channelMessages = pgTable("channel_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default('text'), // 'text', 'image', 'voice_note'
  isAnonymous: boolean("is_anonymous").default(false),
  replyToId: varchar("reply_to_id"),
  reactions: jsonb("reactions").default({}), // {emoji: count}
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor consultations
export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialization: varchar("specialization").notNull(), // 'addiction_medicine', 'psychiatry', 'counseling'
  licenseNumber: varchar("license_number").notNull(),
  yearsExperience: integer("years_experience"),
  bio: text("bio"),
  availableHours: jsonb("available_hours"), // {day: [{start, end}]}
  consultationRate: integer("consultation_rate"), // per hour in THB
  languages: text("languages").array(), // ['thai', 'english']
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  rating: varchar("rating").default('0'), // average rating
  totalConsultations: integer("total_consultations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").default(60), // minutes
  status: varchar("status").notNull().default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  consultationType: varchar("consultation_type").notNull(), // 'text_chat', 'video_call', 'voice_call'
  notes: text("notes"),
  prescriptions: jsonb("prescriptions"),
  followUpDate: timestamp("follow_up_date"),
  rating: integer("rating"), // 1-5 patient rating
  cost: integer("cost"), // in THB
  paymentStatus: varchar("payment_status").default('pending'), // 'pending', 'paid', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
});

// AI chatbot conversations
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  title: text("title"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatbotMessages = pgTable("chatbot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => chatbotConversations.id),
  role: varchar("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // mood_detected, crisis_level, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced content management
export const contentCategories = pgTable("content_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  parentId: varchar("parent_id"),
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const enhancedResources = pgTable("enhanced_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: varchar("type").notNull(), // 'article', 'video', 'audio', 'exercise', 'worksheet', 'meditation'
  categoryId: varchar("category_id"),
  difficulty: varchar("difficulty").default('beginner'), // 'beginner', 'intermediate', 'advanced'
  estimatedTime: integer("estimated_time"), // in minutes
  prerequisites: text("prerequisites").array(),
  tags: text("tags").array(),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  downloadUrl: varchar("download_url"),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  isPublished: boolean("is_published").default(true),
  isPremium: boolean("is_premium").default(false),
  authorId: varchar("author_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  moodEntries: many(moodEntries),
  milestones: many(milestones),
  communityPosts: many(communityPosts),
}));

export const moodEntriesRelations = relations(moodEntries, ({ one }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  user: one(users, {
    fields: [milestones.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
}));

export const discussionChannelsRelations = relations(discussionChannels, ({ one, many }) => ({
  moderator: one(users, {
    fields: [discussionChannels.moderatorId],
    references: [users.id],
  }),
  messages: many(channelMessages),
}));

export const channelMessagesRelations = relations(channelMessages, ({ one }) => ({
  channel: one(discussionChannels, {
    fields: [channelMessages.channelId],
    references: [discussionChannels.id],
  }),
  user: one(users, {
    fields: [channelMessages.userId],
    references: [users.id],
  }),
  replyTo: one(channelMessages, {
    fields: [channelMessages.replyToId],
    references: [channelMessages.id],
  }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  consultations: many(consultations),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  patient: one(users, {
    fields: [consultations.patientId],
    references: [users.id],
  }),
  doctor: one(doctors, {
    fields: [consultations.doctorId],
    references: [doctors.id],
  }),
}));

export const chatbotConversationsRelations = relations(chatbotConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatbotConversations.userId],
    references: [users.id],
  }),
  messages: many(chatbotMessages),
}));

export const chatbotMessagesRelations = relations(chatbotMessages, ({ one }) => ({
  conversation: one(chatbotConversations, {
    fields: [chatbotMessages.conversationId],
    references: [chatbotConversations.id],
  }),
}));

export const contentCategoriesRelations = relations(contentCategories, ({ one, many }) => ({
  parent: one(contentCategories, {
    fields: [contentCategories.parentId],
    references: [contentCategories.id],
  }),
  children: many(contentCategories),
  resources: many(enhancedResources),
}));

export const enhancedResourcesRelations = relations(enhancedResources, ({ one }) => ({
  category: one(contentCategories, {
    fields: [enhancedResources.categoryId],
    references: [contentCategories.id],
  }),
  author: one(users, {
    fields: [enhancedResources.authorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({ id: true, createdAt: true });
export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true });
export const insertDiscussionChannelSchema = createInsertSchema(discussionChannels).omit({ id: true, createdAt: true });
export const insertChannelMessageSchema = createInsertSchema(channelMessages).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, createdAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true });
export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatbotMessageSchema = createInsertSchema(chatbotMessages).omit({ id: true, createdAt: true });
export const insertContentCategorySchema = createInsertSchema(contentCategories).omit({ id: true, createdAt: true });
export const insertEnhancedResourceSchema = createInsertSchema(enhancedResources).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type RehabCenter = typeof rehabCenters.$inferSelect;
export type DiscussionChannel = typeof discussionChannels.$inferSelect;
export type InsertDiscussionChannel = z.infer<typeof insertDiscussionChannelSchema>;
export type ChannelMessage = typeof channelMessages.$inferSelect;
export type InsertChannelMessage = z.infer<typeof insertChannelMessageSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotMessage = typeof chatbotMessages.$inferSelect;
export type InsertChatbotMessage = z.infer<typeof insertChatbotMessageSchema>;
export type ContentCategory = typeof contentCategories.$inferSelect;
export type InsertContentCategory = z.infer<typeof insertContentCategorySchema>;
export type EnhancedResource = typeof enhancedResources.$inferSelect;
export type InsertEnhancedResource = z.infer<typeof insertEnhancedResourceSchema>;
