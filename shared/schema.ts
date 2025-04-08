import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumerations
export const roleEnum = pgEnum("role", ["admin", "agent", "customer"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high"]);
export const activityTypeEnum = pgEnum("activity_type", ["created", "updated", "commented", "assigned", "resolved", "closed", "reopened", "escalated"]);
export const articleStatusEnum = pgEnum("article_status", ["draft", "published", "archived"]);
export const articleCategoryEnum = pgEnum("article_category", ["general", "account", "billing", "technical", "how_to", "faq"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("customer"),
  avatarUrl: text("avatar_url"),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: activityTypeEnum("type").notNull(),
  ticketId: integer("ticket_id").references(() => tickets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Knowledge Base Articles table
export const articles = pgTable("kb_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: articleStatusEnum("status").notNull().default("draft"),
  category: articleCategoryEnum("category").notNull().default("general"),
  tags: text("tags").array(),
  viewCount: integer("view_count").notNull().default(0),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

// Article Feedback table
export const articleFeedback = pgTable("kb_article_feedback", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id),
  userId: integer("user_id").references(() => users.id),
  helpful: boolean("helpful").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: "createdTickets" }),
  assignedTickets: many(tickets, { relationName: "assignedTickets" }),
  comments: many(comments),
  activities: many(activities),
  articles: many(articles, { relationName: "authoredArticles" }),
  articleFeedback: many(articleFeedback)
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tickets.createdById],
    references: [users.id],
    relationName: "createdTickets"
  }),
  assignedTo: one(users, { 
    fields: [tickets.assignedToId],
    references: [users.id],
    relationName: "assignedTickets"
  }),
  comments: many(comments),
  activities: many(activities)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [comments.ticketId],
    references: [tickets.id]
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  ticket: one(tickets, {
    fields: [activities.ticketId],
    references: [tickets.id]
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
    relationName: "authoredArticles"
  }),
  feedback: many(articleFeedback)
}));

export const articleFeedbackRelations = relations(articleFeedback, ({ one }) => ({
  article: one(articles, {
    fields: [articleFeedback.articleId],
    references: [articles.id]
  }),
  user: one(users, {
    fields: [articleFeedback.userId],
    references: [users.id]
  })
}));

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true, viewCount: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const insertArticleFeedbackSchema = createInsertSchema(articleFeedback).omit({ id: true, createdAt: true });
export type InsertArticleFeedback = z.infer<typeof insertArticleFeedbackSchema>;
export type ArticleFeedback = typeof articleFeedback.$inferSelect;

// Extended schema for ticket with related data
export type TicketWithRelations = Ticket & {
  createdBy: User;
  assignedTo?: User;
  comments?: Comment[];
};

// Extended schema for article with related data
export type ArticleWithRelations = Article & {
  author: User;
  feedback?: ArticleFeedback[];
};

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
