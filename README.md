# EduNexus - Full Stack MERN Application

> A student platform built with MongoDB, Express, React, and Node.js (MERN Stack)

## What This App Does

EduNexus is a platform for students with 7 main features:

| Feature | Description |
|---------|-------------|
| **Auth** | Register/Login with JWT authentication |
| **Resume Builder** | Build, save, and print resumes with AI summary generation |
| **Notes Sharing** | Upload PDFs, earn reputation for sharing, unlock notes |
| **Q&A (Doubt Solving)** | Ask questions, post answers, vote on answers |
| **Social Feed** | Create posts, like and comment |
| **Network** | Send/accept connection requests to other students |
| **Profile** | Edit your profile, showcase projects |

---

## Project Structure

```
edunexus/
├── server.ts              ← Express backend entry point
├── server/
│   ├── middleware/
│   │   ├── auth.ts        ← JWT authentication middleware
│   │   └── upload.ts      ← Multer file upload middleware
│   ├── models/            ← MongoDB/Mongoose models (database schemas)
│   │   ├── User.ts
│   │   ├── Note.ts
│   │   ├── Question.ts
│   │   ├── Post.ts
│   │   ├── Resume.ts
│   │   ├── Connection.ts
│   │   ├── Project.ts
│   │   └── Notification.ts
│   └── routes/            ← Express route handlers (API endpoints)
│       ├── auth.ts        → /api/auth
│       ├── notes.ts       → /api/notes
│       ├── qa.ts          → /api/qa
│       ├── social.ts      → /api/social
│       ├── resumes.ts     → /api/resumes
│       ├── users.ts       → /api/users
│       ├── projects.ts    → /api/projects
│       ├── files.ts       → /api/files
│       └── notifications.ts → /api/notifications
├── src/                   ← React frontend
│   ├── main.tsx           ← React entry point
│   ├── App.tsx            ← Router setup
│   ├── index.css          ← All styles (plain CSS)
│   ├── store/
│   │   └── AuthContext.tsx ← Global login state (React Context)
│   ├── components/
│   │   └── Layout.tsx      ← Sidebar navigation wrapper
│   └── pages/
│       ├── Landing.tsx     ← Home/Welcome page
│       ├── Login.tsx       ← Login form
│       ├── Register.tsx    ← Registration form
│       ├── Dashboard.tsx   ← Stats + Pomodoro timer
│       ├── Notes.tsx       ← Notes upload/browse
│       ├── QA.tsx          ← Q&A forum
│       ├── SocialFeed.tsx  ← Posts feed
│       ├── Network.tsx     ← Student connections
│       ├── Profile.tsx     ← User profile
│       └── ResumeBuilder.tsx ← Resume builder + PDF print
├── .env                   ← Environment variables (not committed to git)
└── package.json           ← Dependencies
```

---

## MERN Stack Concepts Used

### MongoDB + Mongoose
- **Models**: Define the shape of data (User, Note, Question, Post, etc.)
- **Schema**: Blueprint for MongoDB documents
- **ObjectId references**: Like foreign keys in SQL (`ref: 'User'`)
- **populate()**: Join related documents (like SQL JOIN)

### Express.js
- **Routes**: Handle HTTP requests (GET, POST, PUT, DELETE)
- **Middleware**: Functions that run before route handlers (auth check)
- **Router**: Organize routes into separate files

### React
- **Components**: Reusable UI pieces
- **useState**: Store and update component data
- **useEffect**: Run code on load or when state changes
- **Context API**: Share state (like logged-in user) across all components
- **React Router**: Navigate between pages without reloading

### Node.js
- **Express** runs on Node.js
- **bcryptjs**: Hash passwords before storing in DB
- **jsonwebtoken (JWT)**: Secure authentication tokens
- **multer**: Handle file uploads

---

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```
   MONGODB_URI=mongodb://localhost:27017/edunexus
   JWT_SECRET=your_secret_key_here
   GEMINI_API_KEY=your_google_ai_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:4004

---

## Key Concepts to Explain to Your Professor

1. **JWT Authentication Flow**: User logs in → server creates a token → client stores in localStorage → sends with every request → server verifies token
2. **Protected Routes**: Frontend redirects to login if no token; Backend middleware rejects requests without valid token
3. **REST API**: Each feature has its own route file with standard HTTP methods (GET=read, POST=create, PUT=update, DELETE=delete)
4. **React Context**: Like a global variable that any component can read (used for user login state)
5. **Gamification**: Reputation points are earned by uploading notes (+40), answering questions (+5), and spent by unlocking notes (-10)
"# Edunexus" 
"# Edunexus" 
