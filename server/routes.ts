import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTicketSchema, 
  insertCommentSchema, 
  insertActivitySchema,
  loginSchema
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "support-desk-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        // In a real app, passwords would be hashed
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  const isAdminOrAgent = (req: Request, res: Response, next: any) => {
    if (
      req.isAuthenticated() && 
      req.user && 
      ((req.user as any).role === "admin" || (req.user as any).role === "agent")
    ) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(400).json({ message: info.message });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ 
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: "Invalid login credentials" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as any;
      res.json({ 
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users", isAdminOrAgent, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/agents", isAuthenticated, async (req, res) => {
    const agents = await storage.getUsersByRole("agent");
    res.json(agents);
  });

  // Ticket routes
  app.post("/api/tickets", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        createdById: (req.user as any).id
      });
      const ticket = await storage.createTicket(validatedData);
      
      // Create activity for ticket creation
      await storage.createActivity({
        type: "created",
        ticketId: ticket.id,
        userId: (req.user as any).id,
        message: `Created ticket #TK-${ticket.id}: ${ticket.subject}`
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.get("/api/tickets", isAuthenticated, async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { tickets, total } = await storage.getTicketsWithPagination(page, limit);
    
    // Enhance tickets with user info
    const enhancedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const createdBy = await storage.getUser(ticket.createdById);
        const assignedTo = ticket.assignedToId 
          ? await storage.getUser(ticket.assignedToId) 
          : undefined;
        const commentCount = (await storage.getCommentsByTicket(ticket.id)).length;
        
        return {
          ...ticket,
          createdBy,
          assignedTo,
          commentCount
        };
      })
    );
    
    res.json({
      tickets: enhancedTickets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  });

  app.get("/api/tickets/search", isAuthenticated, async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const tickets = await storage.searchTickets(query);
    res.json(tickets);
  });

  app.get("/api/tickets/status/:status", isAuthenticated, async (req, res) => {
    const status = req.params.status;
    const tickets = await storage.getTicketsByStatus(status);
    res.json(tickets);
  });

  app.get("/api/tickets/priority/:priority", isAuthenticated, async (req, res) => {
    const priority = req.params.priority;
    const tickets = await storage.getTicketsByPriority(priority);
    res.json(tickets);
  });

  app.get("/api/tickets/assigned/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const tickets = await storage.getTicketsByAssignee(id);
    res.json(tickets);
  });

  app.get("/api/tickets/created/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const tickets = await storage.getTicketsByCreator(id);
    res.json(tickets);
  });

  app.get("/api/tickets/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const ticket = await storage.getTicketWithRelations(id);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    res.json(ticket);
  });

  app.patch("/api/tickets/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const ticket = await storage.getTicket(id);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Only admin or agent can update a ticket that wasn't created by them
    if (
      ticket.createdById !== (req.user as any).id && 
      !["admin", "agent"].includes((req.user as any).role)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const updatedTicket = await storage.updateTicket(id, req.body);
      
      // Create activity for status change if status was updated
      if (req.body.status && req.body.status !== ticket.status) {
        let activityType: "updated" | "resolved" | "closed" | "reopened" = "updated";
        if (req.body.status === "resolved") activityType = "resolved";
        if (req.body.status === "closed") activityType = "closed";
        if (req.body.status === "open" && (ticket.status === "resolved" || ticket.status === "closed")) {
          activityType = "reopened";
        }
        
        await storage.createActivity({
          type: activityType,
          ticketId: id,
          userId: (req.user as any).id,
          message: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ticket #TK-${id}`
        });
      }
      
      // Create activity for assignee change if assignee was updated
      if (req.body.assignedToId && req.body.assignedToId !== ticket.assignedToId) {
        const assignedTo = await storage.getUser(req.body.assignedToId);
        if (assignedTo) {
          await storage.createActivity({
            type: "assigned",
            ticketId: id,
            userId: (req.user as any).id,
            message: `Assigned ticket #TK-${id} to ${assignedTo.name}`
          });
        }
      }
      
      // Create activity for priority change if priority was updated
      if (req.body.priority && req.body.priority !== ticket.priority) {
        let message = `Updated ticket #TK-${id} priority to ${req.body.priority}`;
        if (req.body.priority === "high") {
          message = `Escalated ticket #TK-${id} to high priority`;
        }
        
        await storage.createActivity({
          type: req.body.priority === "high" ? "escalated" : "updated",
          ticketId: id,
          userId: (req.user as any).id,
          message
        });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Comment routes
  app.post("/api/tickets/:id/comments", isAuthenticated, async (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        ticketId,
        userId: (req.user as any).id
      });
      
      const comment = await storage.createComment(validatedData);
      
      // Create activity for comment
      const ticketCreator = await storage.getUser(ticket.createdById);
      await storage.createActivity({
        type: "commented",
        ticketId,
        userId: (req.user as any).id,
        message: `Replied to ${ticketCreator?.name || "customer"} on #TK-${ticketId}`
      });
      
      // Update ticket's updatedAt time
      await storage.updateTicket(ticketId, {});
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.get("/api/tickets/:id/comments", isAuthenticated, async (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    const comments = await storage.getCommentsByTicket(ticketId);
    
    // Enhance comments with user info
    const enhancedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user
        };
      })
    );
    
    res.json(enhancedComments);
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await storage.getRecentActivities(limit);
    
    // Enhance activities with user info
    const enhancedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId);
        return {
          ...activity,
          user
        };
      })
    );
    
    res.json(enhancedActivities);
  });

  app.get("/api/tickets/:id/activities", isAuthenticated, async (req, res) => {
    const ticketId = parseInt(req.params.id);
    const ticket = await storage.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    const activities = await storage.getActivitiesByTicket(ticketId);
    
    // Enhance activities with user info
    const enhancedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId);
        return {
          ...activity,
          user
        };
      })
    );
    
    res.json(enhancedActivities);
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    const stats = await storage.getTicketStats();
    res.json(stats);
  });

  return httpServer;
}
