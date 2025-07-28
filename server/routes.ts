import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMoodEntrySchema, 
  insertCommunityPostSchema, 
  insertMilestoneSchema,
  insertDiscussionChannelSchema,
  insertChannelMessageSchema,
  insertConsultationSchema,
  insertChatbotConversationSchema,
  insertChatbotMessageSchema,
  insertEnhancedResourceSchema,
  insertContentCategorySchema
} from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mood tracking routes
  app.post('/api/mood', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
        date: new Date().toISOString().split('T')[0]
      });
      
      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ message: "Failed to create mood entry" });
    }
  });

  app.get('/api/mood/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.getTodayMoodEntry(userId);
      res.json(entry);
    } catch (error) {
      console.error("Error fetching today's mood:", error);
      res.status(500).json({ message: "Failed to fetch mood entry" });
    }
  });

  app.get('/api/mood/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const entries = await storage.getUserMoodEntries(userId, startDate as string, endDate as string);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood history:", error);
      res.status(500).json({ message: "Failed to fetch mood history" });
    }
  });

  // Milestones routes
  app.get('/api/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestones = await storage.getUserMilestones(userId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMilestoneSchema.parse({
        ...req.body,
        userId
      });
      
      const milestone = await storage.createMilestone(validatedData);
      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(400).json({ message: "Failed to create milestone" });
    }
  });

  app.patch('/api/milestones/:id/achieve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const milestone = await storage.updateMilestone(id, {
        achieved: true,
        achievedAt: new Date()
      });
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(400).json({ message: "Failed to update milestone" });
    }
  });

  // Resources routes
  app.get('/api/resources', async (req, res) => {
    try {
      const { category } = req.query;
      const resources = category 
        ? await storage.getResourcesByCategory(category as string)
        : await storage.getResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get('/api/resources/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const { limit } = req.query;
      const posts = await storage.getCommunityPosts(limit ? parseInt(limit as string) : undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId
      });
      
      const post = await storage.createCommunityPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  // Emergency and location routes
  app.get('/api/emergency-contacts', async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.get('/api/rehab-centers', async (req, res) => {
    try {
      const centers = await storage.getRehabCenters();
      res.json(centers);
    } catch (error) {
      console.error("Error fetching rehab centers:", error);
      res.status(500).json({ message: "Failed to fetch rehab centers" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = "thb", productName } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          productName: productName || "RecoveryPath Premium",
          userEmail: user?.email || "",
        },
        receipt_email: user?.email || undefined,
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/create-qr-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = "thb", productName } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Create payment intent for QR code payments (PromptPay in Thailand)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method_types: ['promptpay'], // Thai QR payment method
        metadata: {
          userId,
          productName: productName || "RecoveryPath Premium",
          userEmail: user?.email || "",
          paymentType: "qr_code",
        },
        receipt_email: user?.email || undefined,
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentMethod: 'promptpay'
      });
    } catch (error: any) {
      console.error("Error creating QR payment:", error);
      res.status(500).json({ message: "Error creating QR payment: " + error.message });
    }
  });

  app.post("/api/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update user to premium status
        await storage.updateUserPremiumStatus(userId, true);
        
        res.json({ 
          status: 'succeeded',
          message: 'Payment successful! Premium features unlocked.',
          isPremium: true
        });
      } else {
        res.json({ 
          status: paymentIntent.status,
          message: 'Payment is being processed.'
        });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  app.get("/api/payment-status/:paymentIntentId", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.params;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      res.json({ 
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase()
      });
    } catch (error: any) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ message: "Error checking payment status: " + error.message });
    }
  });

  // Enhanced Content Management Routes
  app.get('/api/content/categories', async (req, res) => {
    try {
      const categories = await storage.getContentCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      res.status(500).json({ message: "Failed to fetch content categories" });
    }
  });

  app.post('/api/content/categories', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertContentCategorySchema.parse(req.body);
      const category = await storage.createContentCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating content category:", error);
      res.status(400).json({ message: "Failed to create content category" });
    }
  });

  app.get('/api/enhanced-resources', async (req, res) => {
    try {
      const { categoryId } = req.query;
      const resources = await storage.getEnhancedResources(categoryId as string);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching enhanced resources:", error);
      res.status(500).json({ message: "Failed to fetch enhanced resources" });
    }
  });

  app.get('/api/enhanced-resources/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const resource = await storage.getEnhancedResource(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Update view count
      await storage.updateResourceViews(id);
      res.json(resource);
    } catch (error) {
      console.error("Error fetching enhanced resource:", error);
      res.status(500).json({ message: "Failed to fetch enhanced resource" });
    }
  });

  // Discussion Channels Routes
  app.get('/api/channels', async (req, res) => {
    try {
      const channels = await storage.getDiscussionChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching discussion channels:", error);
      res.status(500).json({ message: "Failed to fetch discussion channels" });
    }
  });

  app.post('/api/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDiscussionChannelSchema.parse({
        ...req.body,
        moderatorId: userId
      });
      const channel = await storage.createDiscussionChannel(validatedData);
      res.json(channel);
    } catch (error) {
      console.error("Error creating discussion channel:", error);
      res.status(400).json({ message: "Failed to create discussion channel" });
    }
  });

  app.get('/api/channels/:channelId/messages', async (req, res) => {
    try {
      const { channelId } = req.params;
      const { limit } = req.query;
      const messages = await storage.getChannelMessages(channelId, limit ? parseInt(limit as string) : 50);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      res.status(500).json({ message: "Failed to fetch channel messages" });
    }
  });

  app.post('/api/channels/:channelId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user.claims.sub;
      const validatedData = insertChannelMessageSchema.parse({
        ...req.body,
        channelId,
        userId
      });
      const message = await storage.createChannelMessage(validatedData);
      
      // Send real-time notification via WebSocket
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'new_channel_message',
              channelId,
              message
            }));
          }
        });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error creating channel message:", error);
      res.status(400).json({ message: "Failed to create channel message" });
    }
  });

  // Doctor Consultation Routes
  app.get('/api/doctors', async (req, res) => {
    try {
      const { specialization } = req.query;
      const doctors = await storage.getDoctors(specialization as string);
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get('/api/consultations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultations = await storage.getConsultations(userId);
      res.json(consultations);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.post('/api/consultations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConsultationSchema.parse({
        ...req.body,
        patientId: userId
      });
      const consultation = await storage.createConsultation(validatedData);
      res.json(consultation);
    } catch (error) {
      console.error("Error creating consultation:", error);
      res.status(400).json({ message: "Failed to create consultation" });
    }
  });

  // AI Chatbot Routes
  app.get('/api/chatbot/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getChatbotConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching chatbot conversations:", error);
      res.status(500).json({ message: "Failed to fetch chatbot conversations" });
    }
  });

  app.post('/api/chatbot/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const validatedData = insertChatbotConversationSchema.parse({
        userId,
        sessionId,
        title: req.body.title || "New Conversation"
      });
      const conversation = await storage.createChatbotConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating chatbot conversation:", error);
      res.status(400).json({ message: "Failed to create chatbot conversation" });
    }
  });

  app.get('/api/chatbot/conversations/:conversationId/messages', isAuthenticated, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getChatbotMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chatbot messages:", error);
      res.status(500).json({ message: "Failed to fetch chatbot messages" });
    }
  });

  app.post('/api/chatbot/conversations/:conversationId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const userMessage = insertChatbotMessageSchema.parse({
        conversationId,
        role: 'user',
        content: req.body.content
      });
      
      await storage.createChatbotMessage(userMessage);
      
      // Here you would integrate with Perplexity AI API for intelligent responses
      // For now, we'll create a simple response
      const aiResponse = insertChatbotMessageSchema.parse({
        conversationId,
        role: 'assistant',
        content: `ขอบคุณที่แบ่งปันความรู้สึกของคุณ ฉันเข้าใจว่าการฟื้นฟูเป็นเส้นทางที่ท้าทาย คุณต้องการคำแนะนำเกี่ยวกับเรื่องใดเป็นพิเศษ?`,
        metadata: { 
          mood_detected: 'neutral',
          crisis_level: 'low'
        }
      });
      
      const response = await storage.createChatbotMessage(aiResponse);
      res.json({ userMessage, aiResponse: response });
    } catch (error) {
      console.error("Error creating chatbot message:", error);
      res.status(400).json({ message: "Failed to create chatbot message" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time community chat and channel messages
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
