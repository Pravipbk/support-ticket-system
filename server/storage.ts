import { 
  users, User, InsertUser, 
  tickets, Ticket, InsertTicket, 
  comments, Comment, InsertComment,
  activities, Activity, InsertActivity,
  articles, Article, InsertArticle,
  articleFeedback, ArticleFeedback, InsertArticleFeedback,
  type TicketWithRelations, type ArticleWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, and, gte, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Ticket methods
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketWithRelations(id: number): Promise<TicketWithRelations | undefined>;
  updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketsByStatus(status: string): Promise<Ticket[]>;
  getTicketsByPriority(priority: string): Promise<Ticket[]>;
  getTicketsByAssignee(assigneeId: number): Promise<Ticket[]>;
  getTicketsByCreator(creatorId: number): Promise<Ticket[]>;
  getTicketsWithPagination(page: number, limit: number): Promise<{ tickets: Ticket[], total: number }>;
  searchTickets(query: string): Promise<Ticket[]>;

  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByTicket(ticketId: number): Promise<Comment[]>;

  // Activity methods
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByTicket(ticketId: number): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;

  // Knowledge Base methods
  createArticle(article: InsertArticle): Promise<Article>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleWithRelations(id: number): Promise<ArticleWithRelations | undefined>;
  updateArticle(id: number, data: Partial<Article>): Promise<Article | undefined>;
  getAllArticles(): Promise<Article[]>;
  getArticlesByStatus(status: string): Promise<Article[]>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  getArticlesByAuthor(authorId: number): Promise<Article[]>;
  getArticlesWithPagination(page: number, limit: number): Promise<{ articles: Article[], total: number }>;
  searchArticles(query: string): Promise<Article[]>;
  incrementArticleViewCount(id: number): Promise<void>;
  publishArticle(id: number): Promise<Article | undefined>;
  
  // Article Feedback methods
  createArticleFeedback(feedback: InsertArticleFeedback): Promise<ArticleFeedback>;
  getArticleFeedbackByArticle(articleId: number): Promise<ArticleFeedback[]>;
  getArticleFeedbackStats(articleId: number): Promise<{ helpful: number, unhelpful: number }>;

  // Statistics
  getTicketStats(): Promise<{
    total: number;
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    highPriorityCount: number;
    resolvedToday: number;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, Ticket>;
  private comments: Map<number, Comment>;
  private activities: Map<number, Activity>;
  private articles: Map<number, Article>;
  private articleFeedbacks: Map<number, ArticleFeedback>;
  private currentUserId: number;
  private currentTicketId: number;
  private currentCommentId: number;
  private currentActivityId: number;
  private currentArticleId: number;
  private currentArticleFeedbackId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.comments = new Map();
    this.activities = new Map();
    this.articles = new Map();
    this.articleFeedbacks = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentCommentId = 1;
    this.currentActivityId = 1;
    this.currentArticleId = 1;
    this.currentArticleFeedbackId = 1;

    // Seed some initial data
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const admin = this.createUser(adminUser);

    // Create agent user
    const agentUser: InsertUser = {
      username: "agent",
      password: "agent123",
      name: "Adam Johnson",
      email: "agent@example.com",
      role: "agent",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const agent = this.createUser(agentUser);

    // Create customer users
    const customer1: InsertUser = {
      username: "sarah",
      password: "customer123",
      name: "Sarah Thompson",
      email: "sarah@example.com",
      role: "customer",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const sarah = this.createUser(customer1);

    const customer2: InsertUser = {
      username: "john",
      password: "customer123",
      name: "John Smith",
      email: "john@example.com",
      role: "customer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const john = this.createUser(customer2);

    const customer3: InsertUser = {
      username: "emily",
      password: "customer123",
      name: "Emily Chen",
      email: "emily@example.com",
      role: "customer",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const emily = this.createUser(customer3);

    const customer4: InsertUser = {
      username: "robert",
      password: "customer123",
      name: "Robert Johnson",
      email: "robert@example.com",
      role: "customer",
      avatarUrl: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    const robert = this.createUser(customer4);

    // Create tickets
    const ticket1: InsertTicket = {
      subject: "Cannot access admin dashboard",
      description: "I'm trying to access the admin dashboard but I'm getting a 403 error.",
      status: "in_progress",
      priority: "medium",
      category: "Website",
      createdById: sarah.id,
      assignedToId: agent.id
    };
    const ticket1Created = this.createTicket(ticket1);

    const ticket2: InsertTicket = {
      subject: "Payment processing error",
      description: "I'm trying to make a payment but I'm getting an error message.",
      status: "open",
      priority: "high",
      category: "Billing",
      createdById: john.id,
      assignedToId: agent.id
    };
    const ticket2Created = this.createTicket(ticket2);

    const ticket3: InsertTicket = {
      subject: "Need help with mobile app login",
      description: "I can't log in to the mobile app. It says 'Invalid credentials'.",
      status: "resolved",
      priority: "medium",
      category: "Mobile App",
      createdById: emily.id,
      assignedToId: agent.id
    };
    const ticket3Created = this.createTicket(ticket3);

    const ticket4: InsertTicket = {
      subject: "Feature request: Export data to CSV",
      description: "I would like to be able to export my data to CSV format.",
      status: "open",
      priority: "low",
      category: "Dashboard",
      createdById: robert.id,
      assignedToId: agent.id
    };
    const ticket4Created = this.createTicket(ticket4);

    // Create comments
    const comment1: InsertComment = {
      content: "I've tried clearing my cache but still having the issue.",
      ticketId: ticket1Created.id,
      userId: sarah.id
    };
    this.createComment(comment1);

    const comment2: InsertComment = {
      content: "Could you please provide screenshots of the error?",
      ticketId: ticket1Created.id,
      userId: agent.id
    };
    this.createComment(comment2);

    const comment3: InsertComment = {
      content: "I've attached the screenshot in the ticket description.",
      ticketId: ticket1Created.id,
      userId: sarah.id
    };
    this.createComment(comment3);

    const comment4: InsertComment = {
      content: "I'm looking into this issue now.",
      ticketId: ticket2Created.id,
      userId: agent.id
    };
    this.createComment(comment4);

    const comment5: InsertComment = {
      content: "The issue has been fixed. Please try again and let me know if it works.",
      ticketId: ticket3Created.id,
      userId: agent.id
    };
    this.createComment(comment5);

    const comment6: InsertComment = {
      content: "It works now. Thank you!",
      ticketId: ticket3Created.id,
      userId: emily.id
    };
    this.createComment(comment6);

    const comment7: InsertComment = {
      content: "Thanks for the suggestion. We'll consider adding this feature.",
      ticketId: ticket4Created.id,
      userId: agent.id
    };
    this.createComment(comment7);

    const comment8: InsertComment = {
      content: "Great! Looking forward to it.",
      ticketId: ticket4Created.id,
      userId: robert.id
    };
    this.createComment(comment8);

    // Create activities
    this.createActivity({
      type: "created",
      ticketId: ticket1Created.id,
      userId: sarah.id,
      message: `Created ticket #TK-${ticket1Created.id}: ${ticket1Created.subject}`
    });

    this.createActivity({
      type: "assigned",
      ticketId: ticket1Created.id,
      userId: agent.id,
      message: `Assigned ticket #TK-${ticket1Created.id} to ${agent.name}`
    });

    this.createActivity({
      type: "commented",
      ticketId: ticket1Created.id,
      userId: agent.id,
      message: `Replied to ${sarah.name} on #TK-${ticket1Created.id}`
    });

    this.createActivity({
      type: "created",
      ticketId: ticket2Created.id,
      userId: john.id,
      message: `Created ticket #TK-${ticket2Created.id}: ${ticket2Created.subject}`
    });

    this.createActivity({
      type: "escalated",
      ticketId: ticket2Created.id,
      userId: agent.id,
      message: `Escalated ticket #TK-${ticket2Created.id} to high priority`
    });

    this.createActivity({
      type: "created",
      ticketId: ticket3Created.id,
      userId: emily.id,
      message: `Created ticket #TK-${ticket3Created.id}: ${ticket3Created.subject}`
    });

    this.createActivity({
      type: "resolved",
      ticketId: ticket3Created.id,
      userId: agent.id,
      message: `Resolved ticket #TK-${ticket3Created.id}`
    });

    this.createActivity({
      type: "created",
      ticketId: ticket4Created.id,
      userId: robert.id,
      message: `Created ticket #TK-${ticket4Created.id}: ${ticket4Created.subject}`
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date();
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Ticket methods
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const timestamp = new Date();
    const newTicket: Ticket = {
      ...ticket,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketWithRelations(id: number): Promise<TicketWithRelations | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const createdBy = this.users.get(ticket.createdById);
    const assignedTo = ticket.assignedToId ? this.users.get(ticket.assignedToId) : undefined;
    const ticketComments = await this.getCommentsByTicket(id);

    if (!createdBy) return undefined;

    return {
      ...ticket,
      createdBy,
      assignedTo,
      comments: ticketComments,
    };
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;

    const updatedTicket = {
      ...ticket,
      ...data,
      updatedAt: new Date(),
    };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.status === status);
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.priority === priority);
  }

  async getTicketsByAssignee(assigneeId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.assignedToId === assigneeId);
  }

  async getTicketsByCreator(creatorId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.createdById === creatorId);
  }

  async getTicketsWithPagination(page: number, limit: number): Promise<{ tickets: Ticket[], total: number }> {
    const allTickets = Array.from(this.tickets.values());
    const total = allTickets.length;
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;
    const tickets = allTickets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(startIdx, endIdx);
    return { tickets, total };
  }

  async searchTickets(query: string): Promise<Ticket[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tickets.values()).filter(ticket => 
      ticket.subject.toLowerCase().includes(lowerQuery) || 
      ticket.description.toLowerCase().includes(lowerQuery) ||
      ticket.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const timestamp = new Date();
    const newComment: Comment = {
      ...comment,
      id,
      createdAt: timestamp,
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getCommentsByTicket(ticketId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const timestamp = new Date();
    const newActivity: Activity = {
      ...activity,
      id,
      createdAt: timestamp,
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesByTicket(ticketId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.ticketId === ticketId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Knowledge Base methods
  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const timestamp = new Date();
    const newArticle: Article = {
      ...article,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      publishedAt: null,
      viewCount: 0
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleWithRelations(id: number): Promise<ArticleWithRelations | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const author = this.users.get(article.authorId);
    if (!author) return undefined;

    const feedback = await this.getArticleFeedbackByArticle(id);

    return {
      ...article,
      author,
      feedback
    };
  }

  async updateArticle(id: number, data: Partial<Article>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const updatedArticle = {
      ...article,
      ...data,
      updatedAt: new Date()
    };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async getAllArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticlesByStatus(status: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.status === status);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.category === category);
  }

  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.authorId === authorId);
  }

  async getArticlesWithPagination(page: number, limit: number): Promise<{ articles: Article[], total: number }> {
    const allArticles = Array.from(this.articles.values());
    const total = allArticles.length;
    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;
    const articles = allArticles
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(startIdx, endIdx);
    return { articles, total };
  }

  async searchArticles(query: string): Promise<Article[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.articles.values()).filter(article => 
      article.title.toLowerCase().includes(lowerQuery) || 
      article.content.toLowerCase().includes(lowerQuery) ||
      article.category.toLowerCase().includes(lowerQuery)
    );
  }

  async incrementArticleViewCount(id: number): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.viewCount += 1;
      this.articles.set(id, article);
    }
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const publishedArticle = {
      ...article,
      status: "published" as const,
      publishedAt: new Date(),
      updatedAt: new Date()
    };
    this.articles.set(id, publishedArticle);
    return publishedArticle;
  }

  // Article Feedback methods
  async createArticleFeedback(feedback: InsertArticleFeedback): Promise<ArticleFeedback> {
    const id = this.currentArticleFeedbackId++;
    const timestamp = new Date();
    const newFeedback: ArticleFeedback = {
      ...feedback,
      id,
      createdAt: timestamp
    };
    this.articleFeedbacks.set(id, newFeedback);
    return newFeedback;
  }

  async getArticleFeedbackByArticle(articleId: number): Promise<ArticleFeedback[]> {
    return Array.from(this.articleFeedbacks.values())
      .filter(feedback => feedback.articleId === articleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getArticleFeedbackStats(articleId: number): Promise<{ helpful: number, unhelpful: number }> {
    const feedback = await this.getArticleFeedbackByArticle(articleId);
    const helpful = feedback.filter(f => f.helpful).length;
    const unhelpful = feedback.filter(f => !f.helpful).length;
    return { helpful, unhelpful };
  }

  // Statistics
  async getTicketStats(): Promise<{
    total: number;
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    highPriorityCount: number;
    resolvedToday: number;
  }> {
    const allTickets = Array.from(this.tickets.values());
    const total = allTickets.length;
    const openCount = allTickets.filter(ticket => ticket.status === "open").length;
    const inProgressCount = allTickets.filter(ticket => ticket.status === "in_progress").length;
    const resolvedCount = allTickets.filter(ticket => ticket.status === "resolved").length;
    const closedCount = allTickets.filter(ticket => ticket.status === "closed").length;
    const highPriorityCount = allTickets.filter(ticket => ticket.priority === "high").length;
    
    // Count tickets resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resolvedToday = allTickets.filter(ticket => 
      ticket.status === "resolved" && 
      ticket.updatedAt >= today
    ).length;

    return {
      total,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      highPriorityCount,
      resolvedToday
    };
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(sql`${users.role}::text = ${role}`);
  }

  // Ticket methods
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    return newTicket;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async getTicketWithRelations(id: number): Promise<TicketWithRelations | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (!ticket) return undefined;

    const [createdBy] = await db.select().from(users).where(eq(users.id, ticket.createdById));
    if (!createdBy) return undefined;

    let assignedTo = undefined;
    if (ticket.assignedToId) {
      const [assignee] = await db.select().from(users).where(eq(users.id, ticket.assignedToId));
      assignedTo = assignee;
    }

    const ticketComments = await this.getCommentsByTicket(id);

    return {
      ...ticket,
      createdBy,
      assignedTo,
      comments: ticketComments,
    };
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db.update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(sql`${tickets.status}::text = ${status}`);
  }

  async getTicketsByPriority(priority: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(sql`${tickets.priority}::text = ${priority}`);
  }

  async getTicketsByAssignee(assigneeId: number): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.assignedToId, assigneeId));
  }

  async getTicketsByCreator(creatorId: number): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.createdById, creatorId));
  }

  async getTicketsWithPagination(page: number, limit: number): Promise<{ tickets: Ticket[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Retrieve paginated tickets
    const ticketList = await db.select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total tickets
    const totalResult = await db.select({ 
      count: sql`count(*)` 
    }).from(tickets);
    const total = totalResult[0] ? Number(totalResult[0].count) : 0;

    return { 
      tickets: ticketList,
      total
    };
  }

  async searchTickets(query: string): Promise<Ticket[]> {
    const searchPattern = `%${query}%`;
    return await db.select()
      .from(tickets)
      .where(
        like(tickets.subject, searchPattern) ||
        like(tickets.description, searchPattern) ||
        like(tickets.category, searchPattern)
      );
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByTicket(ticketId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.ticketId, ticketId))
      .orderBy(comments.createdAt);
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getActivitiesByTicket(ticketId: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .where(eq(activities.ticketId, ticketId))
      .orderBy(desc(activities.createdAt));
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Knowledge Base methods
  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleWithRelations(id: number): Promise<ArticleWithRelations | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (!article) return undefined;

    const [author] = await db.select().from(users).where(eq(users.id, article.authorId));
    if (!author) return undefined;

    const feedbackItems = await this.getArticleFeedbackByArticle(id);

    return {
      ...article,
      author,
      feedback: feedbackItems
    };
  }

  async updateArticle(id: number, data: Partial<Article>): Promise<Article | undefined> {
    const [updatedArticle] = await db.update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle || undefined;
  }

  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticlesByStatus(status: string): Promise<Article[]> {
    return await db.select().from(articles).where(sql`${articles.status}::text = ${status}`);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return await db.select().from(articles).where(sql`${articles.category}::text = ${category}`);
  }

  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.authorId, authorId));
  }

  async getArticlesWithPagination(page: number, limit: number): Promise<{ articles: Article[], total: number }> {
    const offset = (page - 1) * limit;
    
    // Retrieve paginated articles
    const articleList = await db.select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total articles
    const totalResult = await db.select({ 
      count: sql`count(*)` 
    }).from(articles);
    const total = totalResult[0] ? Number(totalResult[0].count) : 0;

    return { 
      articles: articleList,
      total
    };
  }

  async searchArticles(query: string): Promise<Article[]> {
    const searchPattern = `%${query}%`;
    return await db.select()
      .from(articles)
      .where(
        like(articles.title, searchPattern) ||
        like(articles.content, searchPattern) ||
        like(articles.category, searchPattern)
      );
  }

  async incrementArticleViewCount(id: number): Promise<void> {
    await db.update(articles)
      .set({ 
        viewCount: sql`${articles.viewCount} + 1` 
      })
      .where(eq(articles.id, id));
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const timestamp = new Date();
    const [publishedArticle] = await db.update(articles)
      .set({ 
        status: "published",
        publishedAt: timestamp,
        updatedAt: timestamp
      })
      .where(eq(articles.id, id))
      .returning();
    return publishedArticle || undefined;
  }

  // Article Feedback methods
  async createArticleFeedback(feedback: InsertArticleFeedback): Promise<ArticleFeedback> {
    const [newFeedback] = await db.insert(articleFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getArticleFeedbackByArticle(articleId: number): Promise<ArticleFeedback[]> {
    return await db.select()
      .from(articleFeedback)
      .where(eq(articleFeedback.articleId, articleId))
      .orderBy(desc(articleFeedback.createdAt));
  }

  async getArticleFeedbackStats(articleId: number): Promise<{ helpful: number, unhelpful: number }> {
    // Get helpful feedback count
    const [helpfulResult] = await db.select({
      count: sql`count(*)`
    })
    .from(articleFeedback)
    .where(
      and(
        eq(articleFeedback.articleId, articleId),
        eq(articleFeedback.helpful, true)
      )
    );
    
    // Get unhelpful feedback count
    const [unhelpfulResult] = await db.select({
      count: sql`count(*)`
    })
    .from(articleFeedback)
    .where(
      and(
        eq(articleFeedback.articleId, articleId),
        eq(articleFeedback.helpful, false)
      )
    );

    return {
      helpful: Number(helpfulResult.count) || 0,
      unhelpful: Number(unhelpfulResult.count) || 0
    };
  }

  // Statistics
  async getTicketStats(): Promise<{
    total: number;
    openCount: number;
    inProgressCount: number;
    resolvedCount: number;
    closedCount: number;
    highPriorityCount: number;
    resolvedToday: number;
  }> {
    // Get total count
    const [totalResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets);
    
    // Get open tickets count
    const [openResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets).where(sql`${tickets.status}::text = 'open'`);
    
    // Get in-progress tickets count
    const [inProgressResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets).where(sql`${tickets.status}::text = 'in_progress'`);
    
    // Get resolved tickets count
    const [resolvedResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets).where(sql`${tickets.status}::text = 'resolved'`);
    
    // Get closed tickets count
    const [closedResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets).where(sql`${tickets.status}::text = 'closed'`);
    
    // Get high priority tickets count
    const [highPriorityResult] = await db.select({
      count: sql`count(*)`
    }).from(tickets).where(sql`${tickets.priority}::text = 'high'`);

    // Get today's date (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count resolved tickets from today
    const [resolvedTodayResult] = await db.select({
      count: sql`count(*)`
    })
    .from(tickets)
    .where(
      and(
        sql`${tickets.status}::text = 'resolved'`,
        gte(tickets.updatedAt, today)
      )
    );

    return {
      total: Number(totalResult.count) || 0,
      openCount: Number(openResult.count) || 0,
      inProgressCount: Number(inProgressResult.count) || 0,
      resolvedCount: Number(resolvedResult.count) || 0,
      closedCount: Number(closedResult.count) || 0,
      highPriorityCount: Number(highPriorityResult.count) || 0,
      resolvedToday: Number(resolvedTodayResult.count) || 0
    };
  }
}

// Use Database Storage implementation
export const storage = new DatabaseStorage();
