import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertAnnouncementSchema, 
  insertQuickAccessCardSchema, 
  insertResourceSchema,
  insertUserSchema
} from "@shared/schema";
import session from "express-session";
import memoryStore from "memorystore";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStore = memoryStore(session);
  
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'education-dashboard-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Middleware to handle zod validation errors
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ error: validationError.message });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    };
  };
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
  
  // Authorization middleware for admin
  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    
    next();
  };
  
  // Authorization middleware for editing content of a specific year
  const canEditYear = (yearParam: string) => {
    return async (req: Request, res: Response, next: Function) => {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const yearToEdit = parseInt(req.params[yearParam]);
      
      // Admins can edit any year
      if (user.role === "admin") {
        return next();
      }
      
      // Check if user can edit the specified year
      if (user.canEditYears.includes(yearToEdit)) {
        return next();
      }
      
      return res.status(403).json({ error: "Forbidden - You don't have permission to edit this year" });
    };
  };
  
  // Authentication routes
  app.post("/api/auth/register", validateRequest(insertUserSchema), async (req, res) => {
    const { username, email, ...userData } = req.body;
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Check if email already exists
    const users = await storage.getAllUsers();
    const existingEmail = users.find(user => user.email === email);
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    try {
      // By default, new students are assigned to year 1 with access to year 1 only
      const newUser = await storage.createUser({
        ...userData,
        username,
        email,
        role: "student",
        year: 1,
        canAccessYears: [1],
        canEditYears: [],
      });
      
      // Set userId in session (automatically log in)
      req.session.userId = newUser.id;
      
      // Return user data except password
      const { password: _, ...newUserData } = newUser;
      res.status(201).json(newUserData);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  app.post("/api/auth/login", validateRequest(loginSchema), async (req, res) => {
    const { username, password } = req.body;
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Set userId in session
    req.session.userId = user.id;
    
    // Return user data except password
    const { password: _, ...userData } = user;
    res.json(userData);
  });
  
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found" });
    }
    
    // Return user data except password
    const { password: _, ...userData } = user;
    return res.json(userData);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
  
  // Dashboard data routes
  app.get("/api/dashboard/:year/quick-access", requireAuth, async (req, res) => {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 1 || year > 3) {
      return res.status(400).json({ error: "Invalid year" });
    }
    
    const user = await storage.getUser(req.session.userId!);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Check if user can access this year
    if (user.role !== "admin" && !user.canAccessYears.includes(year)) {
      return res.status(403).json({ error: "Forbidden - You don't have permission to access this year" });
    }
    
    const cards = await storage.getQuickAccessCardsByYear(year);
    res.json(cards);
  });
  
  app.get("/api/dashboard/:year/announcements", requireAuth, async (req, res) => {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 1 || year > 3) {
      return res.status(400).json({ error: "Invalid year" });
    }
    
    const user = await storage.getUser(req.session.userId!);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Check if user can access this year
    if (user.role !== "admin" && !user.canAccessYears.includes(year)) {
      return res.status(403).json({ error: "Forbidden - You don't have permission to access this year" });
    }
    
    const announcements = await storage.getAnnouncementsByYear(year);
    res.json(announcements);
  });
  
  app.get("/api/dashboard/:year/resources", requireAuth, async (req, res) => {
    const year = parseInt(req.params.year);
    if (isNaN(year) || year < 1 || year > 3) {
      return res.status(400).json({ error: "Invalid year" });
    }
    
    const user = await storage.getUser(req.session.userId!);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Check if user can access this year
    if (user.role !== "admin" && !user.canAccessYears.includes(year)) {
      return res.status(403).json({ error: "Forbidden - You don't have permission to access this year" });
    }
    
    const resources = await storage.getResourcesByYear(year);
    res.json(resources);
  });
  
  // Content management routes - Quick Access Cards
  app.post(
    "/api/content/:year/quick-access", 
    requireAuth, 
    canEditYear("year"),
    validateRequest(insertQuickAccessCardSchema), 
    async (req, res) => {
      const year = parseInt(req.params.year);
      const cardData = { ...req.body, year };
      
      const newCard = await storage.createQuickAccessCard(cardData);
      res.status(201).json(newCard);
    }
  );
  
  app.put(
    "/api/content/quick-access/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const card = await storage.quickAccessCards.get(id);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this card's year
      if (user.role !== "admin" && !user.canEditYears.includes(card.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to edit this content" });
      }
      
      const updatedCard = await storage.updateQuickAccessCard(id, req.body);
      res.json(updatedCard);
    }
  );
  
  app.delete(
    "/api/content/quick-access/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const card = await storage.quickAccessCards.get(id);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this card's year
      if (user.role !== "admin" && !user.canEditYears.includes(card.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to delete this content" });
      }
      
      await storage.deleteQuickAccessCard(id);
      res.json({ success: true });
    }
  );
  
  // Content management routes - Announcements
  app.post(
    "/api/content/:year/announcements", 
    requireAuth, 
    canEditYear("year"),
    validateRequest(insertAnnouncementSchema), 
    async (req, res) => {
      const year = parseInt(req.params.year);
      const announcementData = { 
        ...req.body, 
        year,
        createdBy: req.session.userId! 
      };
      
      const newAnnouncement = await storage.createAnnouncement(announcementData);
      res.status(201).json(newAnnouncement);
    }
  );
  
  app.put(
    "/api/content/announcements/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const announcement = await storage.announcements.get(id);
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this announcement's year
      if (user.role !== "admin" && !user.canEditYears.includes(announcement.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to edit this content" });
      }
      
      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      res.json(updatedAnnouncement);
    }
  );
  
  app.delete(
    "/api/content/announcements/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const announcement = await storage.announcements.get(id);
      if (!announcement) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this announcement's year
      if (user.role !== "admin" && !user.canEditYears.includes(announcement.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to delete this content" });
      }
      
      await storage.deleteAnnouncement(id);
      res.json({ success: true });
    }
  );
  
  // Content management routes - Resources
  app.post(
    "/api/content/:year/resources", 
    requireAuth, 
    canEditYear("year"),
    validateRequest(insertResourceSchema), 
    async (req, res) => {
      const year = parseInt(req.params.year);
      const resourceData = { 
        ...req.body, 
        year,
        createdBy: req.session.userId! 
      };
      
      const newResource = await storage.createResource(resourceData);
      res.status(201).json(newResource);
    }
  );
  
  app.put(
    "/api/content/resources/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const resource = await storage.resources.get(id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this resource's year
      if (user.role !== "admin" && !user.canEditYears.includes(resource.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to edit this content" });
      }
      
      const updatedResource = await storage.updateResource(id, req.body);
      res.json(updatedResource);
    }
  );
  
  app.delete(
    "/api/content/resources/:id", 
    requireAuth, 
    async (req, res) => {
      const id = parseInt(req.params.id);
      
      const resource = await storage.resources.get(id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      // Check if user can edit this resource's year
      if (user.role !== "admin" && !user.canEditYears.includes(resource.year)) {
        return res.status(403).json({ error: "Forbidden - You don't have permission to delete this content" });
      }
      
      await storage.deleteResource(id);
      res.json({ success: true });
    }
  );

  const httpServer = createServer(app);

  return httpServer;
}
