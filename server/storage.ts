import { 
  users, User, InsertUser, 
  tickets, Ticket, InsertTicket, 
  comments, Comment, InsertComment,
  activities, Activity, InsertActivity,
  type TicketWithRelations
} from "@shared/schema";

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
  private currentUserId: number;
  private currentTicketId: number;
  private currentCommentId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.comments = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentCommentId = 1;
    this.currentActivityId = 1;

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

export const storage = new MemStorage();
