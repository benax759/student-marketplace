# 🎓 CampusCart — Student Marketplace

A full-stack, production-ready marketplace built for students to buy and sell books, notes, electronics, and accessories within their campus community.

---

## 🖥️ Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| Frontend         | React 18, Vite, Tailwind CSS, Framer Motion       |
| Backend          | Node.js, Express.js                               |
| Database         | MongoDB (Mongoose ODM)                            |
| Auth             | JWT + bcryptjs                                    |
| Real-time        | Socket.IO                                         |
| Image Uploads    | Cloudinary + Multer                               |
| State Management | Zustand                                           |
| Deployment       | Vercel (FE) + Render/Railway (BE) + MongoDB Atlas |

---

## 📁 Project Structure

```
student-marketplace/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI (Skeletons, EmptyState, StarRating)
│   │   │   ├── layout/         # Navbar, Footer, Layout
│   │   │   └── listings/       # ListingCard
│   │   ├── lib/                # Axios instance
│   │   ├── pages/              # All route-level pages
│   │   ├── store/              # Zustand stores (auth, theme)
│   │   └── utils/              # Helpers (formatPrice, dates, etc.)
│   └── public/
└── backend/                    # Node.js + Express backend
    ├── config/                 # Cloudinary config
    ├── middleware/             # JWT auth middleware
    ├── models/                 # Mongoose models (User, Listing, Chat)
    ├── routes/                 # Express route handlers
    └── server.js               # Entry point + Socket.IO setup
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas URI)
- Cloudinary account (free tier works great)
- npm or yarn

---

### 1. Clone & Install

```bash
git clone https://github.com/yourname/student-marketplace.git
cd student-marketplace

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

---

### 2. Configure Environment Variables

**Backend** — create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/student-marketplace
JWT_SECRET=pick_a_long_random_secret_key_here
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### 3. Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free)
2. Go to **Dashboard** → copy your Cloud name, API Key, API Secret
3. Paste them into `backend/.env`

---

### 4. Set Up MongoDB Atlas (for production)

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP (or `0.0.0.0/0` for open access)
4. Copy the connection string into `MONGODB_URI`

---

### 5. Run the App

```bash
# Terminal 1 — Start backend
cd backend
npm run dev
# ✅ Server running on port 5000
# ✅ Connected to MongoDB

# Terminal 2 — Start frontend
cd frontend
npm run dev
# ✅ App running at http://localhost:5173
```

Visit **http://localhost:5173** 🎉

---

### 6. Create an Admin User

After registering normally, open MongoDB Compass or Atlas and manually set the user's `role` field to `"admin"`:

```json
{ "role": "admin" }
```

Then log in — you'll see the Admin Panel in your dropdown menu.

---

## 🌍 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Or deploy with Vercel CLI:
npx vercel --prod
```

**Vercel env vars to set:**

```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

### Backend → Render

1. Push your code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `backend/.env`

---

### Backend → Railway

```bash
cd backend
railway login
railway init
railway up
```

---

## ✨ Features

### Authentication

- JWT-based login/register
- Password hashing with bcryptjs
- Persistent sessions with localStorage
- Role-based access (user / admin)

### Listings

- Create, edit, delete listings
- Up to 5 images per listing (Cloudinary)
- Category, condition, price, location
- Status: available / reserved / sold
- View counter

### Browse & Search

- Full-text search (MongoDB text index)
- Filter by category, condition, price range, location
- Sort: newest, oldest, price asc/desc, most viewed
- Pagination (12 per page)
- URL-synced filters (shareable links)

### Product Detail

- Image gallery with lightbox zoom
- Seller profile card with rating
- Wishlist toggle
- Report listing
- Chat with seller
- WhatsApp redirect (if phone set)
- Related listings

### Real-time Chat

- Socket.IO powered messaging
- Persistent chat history (MongoDB)
- Linked to specific listing context
- Chat list with last message preview

### Wishlist & Recently Viewed

- Save/unsave items from any card or detail page
- Up to 10 recently viewed items tracked

### Ratings & Reviews

- Buyers can rate sellers (1–5 stars + comment)
- Average rating displayed on profile and listing cards

### Admin Panel

- Stats overview (users, listings, reports)
- Manage users (suspend/restore)
- Manage listings (remove/restore, feature/unfeature)
- View reported listings

### UX Extras

- Dark / Light mode toggle (system-aware default)
- Loading skeletons on all data-heavy pages
- Toast notifications for all actions
- Friendly empty states
- Mobile-first responsive design
- Smooth Framer Motion animations throughout

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Auth | Description       |
| ------ | -------------------- | ---- | ----------------- |
| POST   | `/api/auth/register` | ❌   | Register new user |
| POST   | `/api/auth/login`    | ❌   | Login             |
| GET    | `/api/auth/me`       | ✅   | Get current user  |

### Listings

| Method | Endpoint                     | Auth | Description                    |
| ------ | ---------------------------- | ---- | ------------------------------ |
| GET    | `/api/listings`              | ❌   | Browse with filters/pagination |
| GET    | `/api/listings/featured`     | ❌   | Get featured listings          |
| GET    | `/api/listings/:id`          | ❌   | Get listing detail + related   |
| POST   | `/api/listings`              | ✅   | Create listing (multipart)     |
| PUT    | `/api/listings/:id`          | ✅   | Update listing                 |
| DELETE | `/api/listings/:id`          | ✅   | Delete listing                 |
| POST   | `/api/listings/:id/report`   | ✅   | Report listing                 |
| GET    | `/api/listings/user/:userId` | ❌   | Get user's listings            |

**GET /api/listings query params:**

```
search, category, condition, minPrice, maxPrice, location, sort, page, limit
```

### Users

| Method | Endpoint                           | Auth | Description                |
| ------ | ---------------------------------- | ---- | -------------------------- |
| GET    | `/api/users/:id`                   | ❌   | Get public profile         |
| PUT    | `/api/users/profile/update`        | ✅   | Update profile (multipart) |
| POST   | `/api/users/wishlist/:listingId`   | ✅   | Toggle wishlist item       |
| GET    | `/api/users/wishlist/items`        | ✅   | Get wishlist               |
| POST   | `/api/users/recently-viewed/:id`   | ✅   | Track recently viewed      |
| GET    | `/api/users/recently-viewed/items` | ✅   | Get recently viewed        |
| POST   | `/api/users/:id/rate`              | ✅   | Rate a seller              |

### Chat

| Method | Endpoint                    | Auth | Description         |
| ------ | --------------------------- | ---- | ------------------- |
| GET    | `/api/chat`                 | ✅   | Get all user chats  |
| POST   | `/api/chat/start`           | ✅   | Start or get a chat |
| GET    | `/api/chat/:chatId`         | ✅   | Get chat messages   |
| POST   | `/api/chat/:chatId/message` | ✅   | Send message        |

### Admin

| Method | Endpoint                          | Auth     | Description            |
| ------ | --------------------------------- | -------- | ---------------------- |
| GET    | `/api/admin/stats`                | ✅ Admin | Dashboard stats        |
| GET    | `/api/admin/users`                | ✅ Admin | List all users         |
| PUT    | `/api/admin/users/:id/toggle`     | ✅ Admin | Suspend/activate user  |
| GET    | `/api/admin/listings`             | ✅ Admin | List all listings      |
| PUT    | `/api/admin/listings/:id/toggle`  | ✅ Admin | Remove/restore listing |
| PUT    | `/api/admin/listings/:id/feature` | ✅ Admin | Toggle featured        |

---

## 🔒 Security Notes

- All passwords hashed with bcryptjs (salt rounds: 12)
- JWT tokens expire in 30 days
- All user-owned resource mutations verify ownership
- Admin routes protected by `adminOnly` middleware
- File uploads limited to images only (5MB listings, 2MB avatars)
- CORS configured with explicit origin whitelist
- Request body size limited to 10MB

---

## 🧪 Demo Seed Data (optional)

To quickly populate your database with sample data for testing, you can create a `seed.js` script in the backend folder and run:

```bash
cd backend
node seed.js
```

---

## 📱 Screenshots

The app includes:

- A hero landing page with animated search
- Full-featured browse page with sidebar filters
- Rich product detail page with image gallery
- Two-column real-time chat interface
- Profile pages with tabs (listings, reviews, wishlist)
- Polished auth pages (split-screen design)
- Responsive admin panel with data tables

---

## 🤝 Contributing

PRs welcome! Please open an issue first for major changes.

---

## 📄 License

MIT — feel free to use this as a starting point for your own campus marketplace.

---

Made with ❤️ for students everywhere.
