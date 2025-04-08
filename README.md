# Support Ticket System

A comprehensive support ticketing system designed to enhance customer service efficiency through intelligent workflow management and user-friendly interfaces.

## Overview

This full-stack application provides a complete support ticket management solution with:
- Multiple user roles (admin, agent, customer)
- Ticket creation, assignment, and lifecycle management
- Dashboard with analytics and real-time stats
- Team collaboration features
- Knowledge base backend (API only)
- Responsive design that works on desktop and mobile

## Technology Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom auth with Passport.js
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: Wouter for lightweight client-side routing

## User Accounts and Roles

The system comes with pre-configured user accounts for testing:

### Admin User
- Username: `admin`
- Password: `admin123`
- Capabilities: Full access to all features, manage agents and settings

### Agent User
- Username: `agent`
- Password: `agent123`
- Capabilities: Handle tickets, communicate with customers, access knowledge base

### Customer Users
- Username: `customer1`, `customer2`, `customer3`, `customer4`
- Password: `customer123` (for all customer accounts)
- Capabilities: Create tickets, view ticket status, provide feedback

## Features and Functionality

### Authentication & User Management
- Secure login and session management
- Role-based access control
- User profile management

### Dashboard
- Overview of ticket statistics
- Recent activity feed
- Performance metrics
- Quick action shortcuts

### Ticket Management
- Create new support tickets
- Different views (All Tickets, My Tickets)
- Detailed ticket view with conversation history
- Status and priority management
- Assignment controls
- Activity timeline

### Team Collaboration
- Ticket assignment to specific agents
- Internal notes visible only to agents
- Activity tracking for accountability

### Knowledge Base (Backend API only)
- Article management with draft/publish workflow
- Categorization system
- View tracking and analytics
- User feedback collection (helpful/not helpful)
## Installation and Running

1. Clone the repository
2. Install dependencies
3. Set up PostgreSQL database
4. Push schema to database
5. Start the application
6. Access at http://localhost:5000
