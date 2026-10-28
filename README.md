# Lost & Found — Full-Stack Community Reconnection Platform

> **"Every Lost Item Deserves a Way Home."**

A complete, production-ready, full-stack MERN application that connects people who have lost belongings with people who have found them. Built with React 18 (Vite), Node.js, Express.js, MongoDB (Atlas / Community), and modern Tailwind CSS with a mobile-first responsive architecture.

---

## 🌟 Key Features & Workflow

### 1. Complete End-to-End Lifecycle
1. **Report Lost Item** (`/report/lost`): Users describe lost items with photos, campus landmarks, dates, categories, and secret verification questions.
2. **Report Found Item** (`/report/found`): Finders log discovered items, custody status, and safekeeping locations.
3. **Smart Matching in Found Section** (`/found-items`): When matching lost and found reports are submitted, the lost item appears in the found items section with match confidence indicators.
4. **Claim Ownership with Proof** (`/items/:id`): True owners can click "Claim Ownership" to upload private proof of ownership (purchase receipts, serial numbers, distinguishing marks).
5. **Manager/Admin Verification** (`/admin/claims`): Administrators review proof and either approve or reject claims.
6. **Private In-App Messaging** (`/conversations`): Once a claim is approved, a private in-app conversation is unlocked between claimant and finder with an automated safe handover guide.
7. **Safe Handover & Mark as Returned**: The verified owner, finder, or administrator can mark the item as returned, resolving both the found item and matching lost reports simultaneously.

### 2. Modern UI & Mobile-First Responsive Design
- **Clean Aesthetic**: Crisp white surfaces (`bg-white`), modern slate borders (`border-slate-200/80`), subtle elevations (`shadow-card`, `shadow-soft`), and vibrant blue & purple accents.
- **Native Bottom Navigation Bar**: Floating mobile navigation (`lg:hidden`) featuring Home, Found, Lost, Messages, and an elevated "+ Report" action sheet.
- **Mobile-Adaptive Chat**: Intelligent single/split view preventing cramped side-by-side chat layouts on smartphones.
- **iOS Viewport Optimization**: Auto-zoom on input focus is prevented with standardized `16px` font sizes on mobile devices.
- **Touch-Friendly Tap Targets**: All buttons, links, and cards feature haptic-like micro-interactions (`active:scale-[0.98]`).

### 3. Authentication & Security
- Strict session authentication with **HTTP-only, SameSite cookies** to prevent XSS token theft.
- Password hashing using **bcryptjs** (salt factor 10).
- Password recovery workflow with crypto-hashed single-use reset tokens.
- Role-based access control (`user` vs `admin`).
- Rate limiting for auth and API endpoints to prevent brute-force attacks.
- Strict IDOR protections on claims, reports, and private conversations.

### 4. Smart Matching Engine
- Multi-factor weighted matching algorithm comparing:
  - Exact category matching (30%)
  - Title and description keyword similarity (25%)
  - Brand name detection and overlap (15%)
  - Color recognition and token overlap (10%)
  - Date and time proximity within 1-30 days (10%)
  - Location landmark similarity (10%)
- Real-time match scoring (0-100%) with human-readable reason breakdowns.

### 5. Comprehensive Administrator Portal
- **Dashboard Overview**: Platform-wide metrics (total users, lost reports, found reports, returned belongings, open claims, abuse reports).
- **User Management**: Search members, toggle account activation / suspension, promote or demote administrator privileges.
- **Listing Moderation**: Hide or reinstate prohibited/violating listings.
- **Claim Dispute Resolution**: Review contested claims and enforce authoritative decisions.
- **Abuse Reports**: Review and resolve community violation reports.
- **Audit Logs**: Chronological log of security actions, IP addresses, actors, and metadata.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom blue (`#2563eb`) and purple (`#7c3aed`) palette
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`, `NotificationContext`)
- **HTTP Client**: Axios with `withCredentials: true`

### Backend
- **Runtime**: Node.js v18+ / v20+ / v24+
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in secure HTTP-only cookies
- **Security**: Helmet, Express Rate Limit, Cookie-Parser, CORS
- **Uploads**: Multer with local disk storage & optional Cloudinary integration
- **Email**: Nodemailer with SMTP & local development console logger fallback
- **Testing**: Vitest & Supertest

---

## 📂 Project Structure

```text
Lost & Found/
├── backend/
│   ├── config/             # Database, Cloudinary, Nodemailer configurations
│   ├── controllers/        # Express request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── itemController.js
│   │   ├── matchController.js
│   │   ├── claimController.js
│   │   ├── notificationController.js
│   │   ├── conversationController.js
│   │   ├── abuseReportController.js
│   │   └── adminController.js
│   ├── middleware/         # Auth, Admin, Upload, RateLimit, Error middlewares
│   ├── models/             # Mongoose schemas (User, Item, Claim, Notification, Conversation, AbuseReport, AuditLog)
│   ├── routes/             # REST API routes
│   ├── services/           # Matching engine, Notification, Audit, Email services
│   ├── scripts/            # Database seed script
│   ├── tests/              # Vitest + Supertest integration test suite
│   ├── uploads/            # Local image upload directory
│   ├── server.js           # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, MobileBottomNav, ItemCard, MatchCard, Modal, etc.)
│   │   ├── context/        # AuthContext and NotificationContext
│   │   ├── layouts/        # AppLayout, AuthLayout, ProtectedRoute, AdminRoute
│   │   ├── pages/          # All application views & Admin portal
│   │   ├── services/       # Centralized Axios API service
│   │   ├── utils/          # Date & status formatters
│   │   ├── App.jsx         # App router configuration
│   │   └── main.jsx        # React root
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── package.json            # Root orchestration script
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas URI)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ThapaAyush/Lost_and_Found.git
cd Lost_and_Found

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Database Connection (MongoDB URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=lost_and_found

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false

# Optional Cloudinary (If omitted, uploads automatically fall back to backend/uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional Email Service (If omitted, emails log cleanly to development console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Lost & Found Support <noreply@lostandfound.local>"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=/api
```

---

### 3. Seed the Database

Populate realistic demo users, lost/found items, candidate matches, claims, and conversations:
```bash
cd backend
node scripts/seed.js
```

#### Demo Credentials:
- **Administrator**: `admin@lostandfound.com` / `AdminPassword123!`
- **User (John)**: `john@example.com` / `Password123!`
- **User (Sarah)**: `sarah@example.com` / `Password123!`
- **User (Mike)**: `mike@example.com` / `Password123!`

---

### 4. Run the Application

In terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Starts backend server on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd frontend
npm run dev
# Starts Vite development server on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

Run backend integration tests:
```bash
cd backend
npm test
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in & issue HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated session | Yes |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |
| `GET` | `/api/users/me` | Fetch user profile | Yes |
| `PATCH` | `/api/users/me` | Update name, phone, or avatar | Yes |
| `POST` | `/api/users/change-password`| Change current password | Yes |
| `GET` | `/api/users/stats` | Personalized dashboard statistics | Yes |
| `GET` | `/api/items` | Search & filter lost/found items | Optional |
| `POST` | `/api/items` | Publish a new report (multipart) | Yes |
| `GET` | `/api/items/:id` | Get item details & lifecycle | Optional |
| `PATCH` | `/api/items/:id` | Update item report | Yes (Owner/Admin) |
| `PATCH` | `/api/items/:id/status` | Update item lifecycle status | Yes (Owner/Admin/Claimant) |
| `DELETE` | `/api/items/:id` | Delete item report | Yes (Owner/Admin) |
| `GET` | `/api/items/mine` | List reports owned by user | Yes |
| `GET` | `/api/items/:id/matches` | Find candidate matches for item | Optional |
| `GET` | `/api/matches/community` | Get public matched lost reports | Optional |
| `GET` | `/api/matches` | Get matches across user reports | Yes |
| `POST` | `/api/items/:id/claims` | Submit ownership claim (evidence) | Yes |
| `GET` | `/api/claims/mine` | List user's submitted claims | Yes |
| `GET` | `/api/claims/:id` | View claim & confidential proof | Yes (Authorized) |
| `PATCH` | `/api/claims/:id` | Review, approve, reject claim | Yes (Owner/Admin) |
| `GET` | `/api/notifications` | Paginated in-app notifications | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | Yes |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications read | Yes |
| `GET` | `/api/conversations` | List user's active conversations | Yes |
| `POST` | `/api/conversations` | Start or retrieve conversation | Yes |
| `POST` | `/api/conversations/:id/messages` | Send message in conversation | Yes |
| `POST` | `/api/reports` | Submit community abuse report | Yes |
| `GET` | `/api/admin/stats` | Platform overview metrics | Yes (Admin) |
| `GET` | `/api/admin/users` | Manage registered users | Yes (Admin) |
| `PATCH` | `/api/admin/users/:id/status`| Suspend or promote user | Yes (Admin) |
| `GET` | `/api/admin/items` | Moderate all listings | Yes (Admin) |
| `PATCH` | `/api/admin/items/:id/moderate` | Toggle prohibited visibility | Yes (Admin) |
| `GET` | `/api/admin/claims` | Review contested claims | Yes (Admin) |
| `GET` | `/api/admin/abuse-reports` | Review community abuse flags | Yes (Admin) |
| `PATCH` | `/api/admin/abuse-reports/:id`| Resolve abuse report | Yes (Admin) |
| `GET` | `/api/admin/audit-logs` | Platform audit history | Yes (Admin) |

---

## 🛡️ Security Best Practices Implemented
- **No plaintext credentials** or tokens in `localStorage`.
- **JWT token in HTTP-only, SameSite cookie** ensures JavaScript cannot inspect authentication session.
- **Protection against IDOR** (Insecure Direct Object Reference) on claims, item edits, conversation streams, and profile updates.
- **Mongoose Sanitization & Centralized Validation** prevents NoSQL injection and malformed inputs.
- **Production-grade Error Handler** prevents internal stack trace leaks to clients.
