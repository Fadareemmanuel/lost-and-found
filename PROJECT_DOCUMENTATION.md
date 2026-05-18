# 📚 PROJECT DOCUMENTATION

## **GROUP 2 | WEB TEAM | LOST AND FOUND**

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Project Goals](#project-goals)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Key Features](#key-features)
6. [Issues Encountered & Solutions](#issues-encountered--solutions)
7. [Database Schema](#database-schema)
8. [Installation & Setup](#installation--setup)
9. [Running the Application](#running-the-application)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**LASU Lost and Found** is a campus-based platform that helps students find lost items and connect with those who have found them. The system uses intelligent matching algorithms to suggest similar items across lost/found listings and facilitates communication between users.

**Organization:** LASU (Lagos State University)  
**Team:** Group 2 - Web Development Team  
**Target Users:** LASU Students and Staff  
**Primary Goal:** Reduce lost items on campus and help reunite belongings with their owners

---

## 🎯 Project Goals

✅ **Reduce Lost Items** — Provide a centralized platform for lost/found items  
✅ **Smart Matching** — Automatically suggest matches between lost and found items  
✅ **Campus Location Tracking** — Pin exact locations on an interactive map  
✅ **User Communication** — Enable messaging between item posters and claimants  
✅ **Admin Management** — Allow admins to review and approve item claims  
✅ **Notifications** — Alert users when matching items are posted  
✅ **Authentication** — Secure access using school emails and Google Sign-In  

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** — Modern UI framework with hooks
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS 4** — Utility-first styling framework
- **React Router v7** — Client-side routing
- **Leaflet + OpenStreetMap** — Free, open-source maps library
- **Zod** — Schema validation for forms

### **Backend**
- **Node.js + Express 5** — RESTful API server
- **SQLite (better-sqlite3)** — Lightweight embedded database
- **JWT (jsonwebtoken)** — Stateless authentication
- **bcryptjs** — Password hashing
- **Multer** — File upload middleware
- **CORS** — Cross-origin request handling
- **dotenv** — Environment variable management

### **DevOps & Tools**
- **Render** — Cloud hosting (backend API + database)
- **Vite** — Frontend build & development
- **Nodemon** — Auto-reload during development
- **Concurrently** — Run multiple npm scripts simultaneously
- **ESLint** — Code quality & linting

### **External Services**
- **Google OAuth 2.0** — Social authentication
- **OpenStreetMap/Nominatim** — Free geocoding & location search

---

## 🏗️ Project Architecture

```
LASULostAndFound/
├── server/                    # Backend API
│   ├── db.js                 # Database initialization & migrations
│   ├── index.js              # Express server setup
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # User registration & login
│   │   ├── items.js          # Lost/Found item CRUD
│   │   ├── claims.js         # Item claim management
│   │   ├── messages.js       # Direct messaging
│   │   └── notifications.js  # Notification endpoints
│   └── lib/
│       ├── upload.js         # File upload configuration
│       ├── matching.js       # Smart matching algorithm
│       ├── notificationService.js  # Notification logic
│       ├── extractAttributes.js    # Auto-extraction of attributes
│       ├── itemConstants.js       # Item categorization
│       └── schoolEmail.js         # School email validation
│
├── src/                       # Frontend React app
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main app component
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state
│   ├── hooks/
│   │   └── useNotificationPoll.js  # Polling hook for notifications
│   ├── lib/
│   │   ├── api.js            # API client utilities
│   │   └── itemOptions.js    # Category/size options
│   ├── components/
│   │   ├── Navbar.jsx        # Navigation bar
│   │   ├── ItemCard.jsx      # Item listing card
│   │   ├── ItemDetailPage    # Full item details
│   │   ├── LocationPicker.jsx # Map & location selection
│   │   ├── ChatBox.jsx       # Messaging interface
│   │   ├── MatchSuggestions.jsx  # Similar items widget
│   │   └── ProtectedRoute.jsx    # Route authentication
│   └── pages/
│       ├── LoginPage.jsx     # User login/signup
│       ├── NewItemPage.jsx   # Create new item listing
│       ├── ItemsPage.jsx     # Browse items
│       ├── ItemDetailPage.jsx # View single item + claims
│       ├── NotificationsPage.jsx # View notifications
│       └── AdminClaimPage.jsx   # Admin claim review
│
├── public/                    # Static assets
├── uploads/                   # User-uploaded images
├── .env                       # Environment variables
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js         # Tailwind CSS config
└── eslint.config.js          # ESLint rules
```

---

## ✨ Key Features

### 1. **User Authentication**
- Google OAuth 2.0 sign-in
- Email/password registration
- School email domain validation (@st.lasu.edu.ng)
- JWT-based session tokens
- Role-based access (student/admin)

### 2. **Item Management**
- Post lost or found items
- Add description, category, color, size, location, date
- Upload item images with preview
- Auto-extract attributes from description text
- Search & filter by category, color, size

### 3. **Smart Matching Algorithm**
- Automatically suggests similar items
- Scores based on category, color, size, title, description similarity
- Notifies users when matches are found
- Prevents duplicate notifications

### 4. **Location Tracking**
- Interactive map with OpenStreetMap/Leaflet
- Search location by name (Nominatim geocoding)
- Pin exact coordinates on map
- Display location label

### 5. **Claims & Communication**
- Users can claim items as lost/found
- Direct messaging between claimant and item poster
- Admin review of claims with approval/denial
- Status tracking (pending, approved, declined)

### 6. **Notifications**
- Real-time notifications for matching items
- Notification history
- Mark as read
- Configurable notification types

### 7. **Admin Dashboard**
- Review pending claims
- Approve/deny claims
- View claim details and messages
- Manage item status

---

## 🐛 Issues Encountered & Solutions

### **Issue #1: Image Not Displaying in Listings**

**Problem:**  
When users uploaded images to publish items, the images showed correctly in the preview but disappeared when viewing listings on the production (Render) site.

**Root Cause:**  
- Images were stored with hardcoded full URLs: `http://localhost:4000/uploads/...`
- On Render, these localhost URLs didn't exist, causing broken image links
- The upload path was also environment-dependent

**Solution Implemented:**
1. **Backend** — Modified `/api/upload` endpoint to return relative paths (`/uploads/filename`) instead of full URLs
2. **Frontend** — Added `getImageUrl()` helper function in `ItemCard.jsx` and `ItemDetailPage.jsx` to dynamically construct the correct base URL based on environment
3. **Upload Preview** — Fixed preview to show full URL by constructing it from the relative path
4. **Consistency** — Ensured all image displays use the same resolution logic

**Files Modified:**
- `server/index.js` — Upload endpoint
- `src/pages/NewItemPage.jsx` — Upload handler
- `src/components/ItemCard.jsx` — Image display
- `src/pages/ItemDetailPage.jsx` — Image display

**Result:** ✅ Images now display correctly in both local dev and production

---

### **Issue #2: Database Schema Mismatch on Render**

**Problem:**  
505 error when publishing items. The production database didn't have `latitude`, `longitude` columns that were added locally.

**Root Cause:**  
- Migrations in `server/db.js` had a bug: `latitude`, `longitude`, `location_label` were nested inside the `size_bucket` check
- They only got added if `size_bucket` was missing, not independently
- When the Render database had `size_bucket`, the location columns were never created

**Solution Implemented:**
1. **Fixed Migration Logic** — Separated the column checks so each is independent
2. **Added location_label Column** — For storing human-readable location names
3. **Proper Schema** — Ensured all columns are created regardless of others

**Code Fix:**
```javascript
// BEFORE (WRONG) — nested inside size_bucket check
if (!names.has("size_bucket")) {
  db.exec("ALTER TABLE items ADD COLUMN size_bucket TEXT");
  if (!names.has("latitude")) {
    db.exec("ALTER TABLE items ADD COLUMN latitude REAL");
  }
  // ...
}

// AFTER (CORRECT) — independent checks
if (!names.has("size_bucket")) {
  db.exec("ALTER TABLE items ADD COLUMN size_bucket TEXT");
}
if (!names.has("latitude")) {
  db.exec("ALTER TABLE items ADD COLUMN latitude REAL");
}
```

**Files Modified:**
- `server/db.js` — Fixed `migrateItems()` function

**Result:** ✅ Database schema is now properly created on first run

---

### **Issue #3: Google Maps API Cost**

**Problem:**  
Initially replaced OpenStreetMap with Google Maps, but discovered Google Maps requires paid API key ($7+/month, minimum billing).

**Solution Implemented:**
- **Reverted to OpenStreetMap + Leaflet** — 100% free, open-source, no API key required
- **Removed Google Maps API configuration** — Cleaned up unnecessary config
- **No functionality loss** — Leaflet provides all same features (mapping, search, markers)

**Benefits of OpenStreetMap:**
- ✅ No cost
- ✅ No API key needed
- ✅ No rate limits
- ✅ Community-maintained
- ✅ Full feature parity

**Files Modified:**
- `src/components/LocationPicker.jsx` — Reverted to Leaflet
- `.env` — Removed Google API key

**Result:** ✅ Maps work perfectly without any payment

---

### **Issue #4: Form Validation & Error Handling**

**Problem:**  
Initially had basic error handling; improved to provide clearer feedback to users.

**Solution:**
- **Zod Schema Validation** — Strict schema validation on backend
- **Field-level Errors** — Display specific field errors to users
- **User-friendly Messages** — Clear, actionable error messages
- **Input Constraints** — Frontend validation before submission

---

## 🗄️ Database Schema

### **users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'student',
  auth_provider TEXT DEFAULT 'password',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **items Table**
```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  type TEXT CHECK(type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  color TEXT,
  size_bucket TEXT,
  location TEXT,
  latitude REAL,
  longitude REAL,
  location_label TEXT,
  date TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'open',
  posted_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **claims Table**
```sql
CREATE TABLE claims (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  claimant_id INTEGER NOT NULL REFERENCES users(id),
  claim_type TEXT DEFAULT 'claim_found',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **messages Table**
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  claim_id INTEGER NOT NULL REFERENCES claims(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### **notifications Table**
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  item_id INTEGER REFERENCES items(id),
  claim_id INTEGER REFERENCES claims(id),
  read_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Git
- Text editor (VS Code recommended)

### **Steps**

1. **Clone Repository**
   ```bash
   git clone https://github.com/Fadareemmanuel/lost-and-found.git
   cd lost-and-found
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   JWT_SECRET=your_secret_key
   PORT=4000
   GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_CLIENT_ID=same_as_above
   ALLOWED_EMAIL_DOMAIN=st.lasu.edu.ng
   VITE_API_BASE=http://localhost:4000/api  # for dev
   CORS_ORIGINS=http://localhost:5173
   ```

4. **Initialize Database**
   ```bash
   node server/db.js
   ```
   This creates `lostfound.db` with all tables and migrations.

---

## 🚀 Running the Application

### **Development Mode (Full Stack)**
Run frontend + backend simultaneously:
```bash
npm run dev:all
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Start Express API on `http://localhost:4000`

### **Frontend Only**
```bash
npm run dev
```
Requires backend running separately or production API.

### **Backend Only**
```bash
npm run server
```
Uses Nodemon for auto-reload on file changes.

### **Production Build**
```bash
npm run build
```
Creates optimized frontend build in `dist/`

---

## 🚀 Deployment

### **Frontend Deployment (Vercel/Render)**
1. Build the project: `npm run build`
2. Deploy `dist/` folder to Vercel or similar
3. Set `VITE_API_BASE` environment variable to production API URL

### **Backend Deployment (Render)**
1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables in Render dashboard
4. Render automatically builds and deploys on push

### **Database**
- Uses SQLite (`better-sqlite3`)
- Database file (`lostfound.db`) stored in project root
- On Render, uses ephemeral storage (file persists during app uptime)
- **Note:** For production, migrate to PostgreSQL for persistent storage

### **Render Configuration**
- **Backend URL:** `https://lasu-lost-and-found-api.onrender.com`
- **Frontend URL:** `https://lasu-lost-and-found.vercel.app` (or similar)
- **Environment variables:** Configure JWT_SECRET, CORS_ORIGINS, etc.

---

## 📝 Important Notes

### **File Uploads**
- Uploaded images stored in `/uploads` directory
- Maximum file size: 5MB
- Supported formats: JPEG, PNG, WebP, GIF
- On production, use cloud storage (AWS S3, Cloudinary) for reliability

### **Authentication**
- JWT tokens valid for session
- Refresh tokens not implemented (stateless)
- Logout clears token from client localStorage

### **Matching Algorithm**
- Scores items based on multiple factors
- Runs when item is posted and existing items are matched
- Minimum score threshold prevents irrelevant suggestions
- Notifications only sent if score exceeds threshold

### **Rate Limiting**
- Not currently implemented
- Recommended for production to prevent abuse

---

## 🔒 Security Considerations

1. **Password Hashing** — bcryptjs with salt rounds
2. **SQL Injection Prevention** — better-sqlite3 with parameterized queries
3. **CORS** — Whitelisted origins only
4. **JWT Validation** — All protected routes require valid token
5. **Email Validation** — School email domain enforcement
6. **File Upload Validation** — MIME type & size restrictions

---

## 🤝 Team & Contributors

**Group 2 - Web Development Team**
- Full-stack development
- Feature implementation
- Bug fixes and optimization
- Documentation

---

## 📞 Support & Questions

For issues or questions about the project, please:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact the team lead

---

**Last Updated:** May 18, 2026  
**Version:** 1.0.0  
**Status:** Active Development
