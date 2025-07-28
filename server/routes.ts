import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMoodEntrySchema, insertCommunityPostSchema, insertMilestoneSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  // WebSocket server for real-time community chat
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
