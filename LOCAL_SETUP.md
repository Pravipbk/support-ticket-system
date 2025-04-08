# Local Setup Guide for Support Ticket System

This document provides detailed instructions for setting up and running the Support Ticket System on your local machine without Replit.

## Prerequisites

1. **Node.js**: Version 18 or higher
   - Download from: https://nodejs.org/
   - Verify installation with: node -v

2. **PostgreSQL**: Version 13 or higher
   - Download from: https://www.postgresql.org/download/
   - Create a database named support_tickets

3. **Git**: For cloning the repository
   - Download from: https://git-scm.com/downloads

## Step 1: Clone the Repository

Clone the repository from GitHub:
git clone https://github.com/Pravipbk/support-ticket-system.git
cd support-ticket-system

## Step 2: Install Dependencies

Install the project dependencies using Node Package Manager.

## Step 3: Configure Database Connection

1. Create a .env file in the root directory of the project
2. Add the following content, adjusting values to match your PostgreSQL setup:

DATABASE_URL=postgresql://username:password@localhost:5432/support_tickets

Replace:
- username with your PostgreSQL username
- password with your PostgreSQL password
- localhost with your database host if not using localhost
- 5432 with your PostgreSQL port if different
- support_tickets with your database name

## Step 4: Set Up the Database Schema

Run the database migration command to create all necessary tables.

## Step 5: Start the Application

Start both the frontend and backend servers.

## Step 6: Access the Application

Open your browser and navigate to:
http://localhost:5000

## Login Credentials

Use these pre-configured accounts to test different user roles:

### Admin
- Username: admin
- Password: admin123

### Agent
- Username: agent
- Password: agent123

### Customers
- Username: customer1 (also customer2, customer3, customer4)
- Password: customer123

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
   - Windows: Check Services
   - Mac/Linux: Check status with appropriate command

2. Check connection string in .env file

3. Create database if it doesn't exist:
   CREATE DATABASE support_tickets;

### Port Conflicts

If port 5000 is already in use:

1. Edit server/index.ts to change the port number
2. Update the URLs in your code if necessary

### Other Common Issues

If you encounter module not found errors or other issues:
- Delete node_modules folder and reinstall dependencies
- Make sure you're using the right Node.js version

## Application Structure

- /client: Frontend React application
- /server: Backend Express server
- /shared: Shared schemas and types
- drizzle.config.ts: Database configuration

## Key Features & Navigation

1. **Dashboard**: View ticket statistics and recent activities
2. **Tickets**: Create, view, and manage support tickets
3. **Team Members**: View and manage support agents
4. **Knowledge Base**: Access articles and documentation (backend only currently)
5. **Settings**: Configure application settings

## Development Notes

- The application uses Drizzle ORM for database operations
- Authentication is handled via Express session
- The frontend uses React Query for data fetching
- Styling is done with Tailwind CSS and Shadcn UI components
