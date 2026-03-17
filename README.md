# Loopify — Campus Micro-Rental Platform 🎓

A full-stack web application that enables students to list, discover, book, and pay for equipment rentals within verified university communities.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Tech Stack](https://img.shields.io/badge/Express.js-4-green?logo=express)
![Tech Stack](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)

---

## ✨ Features

- **🔐 JWT Authentication** — Signup, login, campus email verification
- **📦 Equipment Listings** — Create, edit, pause, delete with photo uploads
- **🔍 Smart Discovery** — Search, category filters, sort, Instant Access mode
- **📅 Booking System** — Request → Approve → Pickup → Return → Complete
- **💳 Razorpay Payments** — Rent + deposit, automatic refund on return
- **📷 Handover Verification** — Photo proof at pickup and return
- **⭐ Rating System** — Bidirectional reviews, reputation scores
- **💬 Real-time Chat** — Socket.IO powered messaging
- **👤 User Dashboard** — Listings, bookings, requests, transaction history
- **🛡️ Admin Panel** — User management, listing moderation, analytics

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com/))

### 1. Clone & Setup

```bash
cd loopify
```

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `.env` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/loopify
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

> Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

> Frontend runs on `http://localhost:3000`

---

## 🔑 Demo Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| User (Owner) | `aarav@university.edu` | `password123` |
| User | `priya@university.edu` | `password123` |
| User | `rahul@university.edu` | `password123` |
| Admin | `admin@loopify.com` | `admin123` |

---

## 🏗️ Project Structure

```
loopify/
├── client/                     # Next.js 14 Frontend
│   └── src/
│       ├── app/                # App Router pages
│       │   ├── page.js         # Landing page
│       │   ├── explore/        # Browse listings
│       │   ├── items/[id]/     # Item details
│       │   ├── booking/[id]/   # Book item
│       │   ├── create-listing/ # List equipment
│       │   ├── dashboard/      # User dashboard
│       │   ├── chat/           # Messaging
│       │   ├── profile/        # User profile
│       │   ├── admin/          # Admin dashboard
│       │   ├── login/          # Auth
│       │   └── signup/         # Auth
│       ├── components/         # Reusable components
│       ├── context/            # Auth context
│       └── lib/                # API client
├── server/                     # Express.js Backend
│   ├── config/                 # DB connection
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, upload, admin
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── seeds/                  # Seed data
│   ├── utils/                  # Email, Razorpay helpers
│   └── server.js               # Entry point
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/items` | List items (search/filter) |
| POST | `/api/items` | Create listing |
| GET | `/api/items/:id` | Item details |
| POST | `/api/bookings` | Request booking |
| PATCH | `/api/bookings/:id/approve` | Approve booking |
| PATCH | `/api/bookings/:id/complete` | Complete booking |
| POST | `/api/payments/create-order` | Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/chat/conversations` | User conversations |
| POST | `/api/reviews` | Submit review |
| GET | `/api/admin/stats` | Admin stats |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `PORT` | Server port (default: 5000) | ❌ |
| `CLOUDINARY_*` | Cloudinary credentials | ❌ (uses local uploads) |
| `RAZORPAY_*` | Razorpay API keys | ❌ (uses mock payments) |
| `SMTP_*` | Email SMTP settings | ❌ (logs to console) |

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd client
npx vercel
```

### Backend (Render)
1. Create a new Web Service on Render
2. Set the root directory to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables

---

## 📋 Future Roadmap

- [ ] Society equipment lockers
- [ ] Delivery service integration
- [ ] Insurance integration
- [ ] AI fraud detection
- [ ] Smart dynamic pricing
- [ ] Push notifications
- [ ] Google Maps integration
