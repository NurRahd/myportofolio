# Portfolio Backend + Admin Panel — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ (running locally)
- pgAdmin or any PostgreSQL client

---

## 1. Setup PostgreSQL Database

1. Open pgAdmin or psql
2. Create a new database:
   ```sql
   CREATE DATABASE portfolio_db;
   ```

---

## 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file and edit if needed
copy .env.example .env
# Edit .env: set your PostgreSQL password in DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with initial data
node prisma/seed.js

# Start development server
npm run dev
```

Backend runs on: **http://localhost:3001**

---

## 3. Start Frontend

```bash
# From the root project folder (New folder (2))
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 4. Access Admin Panel

Open: **http://localhost:5173/admin**

Default credentials:
- Username: `admin`
- Password: `admin123`

⚠️ Change the password immediately after first login via Admin → Password section.

---

## Features

### Admin Panel Sections
| Section | What you can manage |
|---------|-------------------|
| Profile | Hero text, navbar brand, footer copyright |
| Social Links | All social media links with custom icons |
| Skills | Skill groups and individual skills with Lucide icons |
| Experience | Work experience with logo images, bullets, skills |
| Education | Schools with logo images |
| Certificates | Certificates with images, IDs, expiry dates |
| Activities | Organizations/activities with multiple images |
| Projects | Portfolio projects with images, featured toggle |
| Messages | Contact form submissions (read/reply/delete) |
| Password | Change admin password |

### API Endpoints
```
GET  /api/profile          - Get profile settings (public)
GET  /api/social-links     - Get social links (public)
GET  /api/skills           - Get skill groups + skills (public)
GET  /api/experiences      - Get experiences (public)
GET  /api/education        - Get education (public)
GET  /api/certificates     - Get certificates (public)
GET  /api/activities       - Get activities (public)
GET  /api/projects         - Get projects (public, ?featured=true)
POST /api/messages         - Submit contact form (public)
POST /api/auth/login       - Admin login
```

Admin-only (require Bearer token):
```
PUT    /api/profile
POST/PUT/DELETE /api/social-links/:id
POST/PUT/DELETE /api/skills/groups/:id
POST/PUT/DELETE /api/skills/:id
POST/PUT/DELETE /api/experiences/:id
POST/PUT/DELETE /api/education/:id
POST/PUT/DELETE /api/certificates/:id
POST/PUT/DELETE /api/activities/:id
POST/PUT/DELETE /api/projects/:id
GET/DELETE      /api/messages/:id
```

### Image Uploads
- Uploaded files are stored in `backend/uploads/`
- Served at `/uploads/<filename>` via Vite proxy in development
- Max file size: 5MB
- Supported formats: jpg, jpeg, png, gif, webp, svg
