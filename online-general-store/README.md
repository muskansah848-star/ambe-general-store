# Online General Store — MERN E-Commerce App

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run seed           # seed sample data
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials (after seeding)
- Admin: admin@store.com / admin123
- Customer: john@example.com / john123

## Features
- JWT Auth with role-based access (Admin / Customer)
- Product CRUD with Cloudinary image upload
- Search, filter by category, sort by price/rating
- Shopping cart with localStorage persistence
- Multi-step checkout (Address → Payment → Review)
- COD + Stripe payment support
- Order tracking with status updates
- Email notifications via Nodemailer
- PDF invoice download
- Admin dashboard with analytics
- Real-time updates via Socket.io
- Dark mode toggle
- Responsive mobile-friendly UI

## Tech Stack
- MongoDB + Mongoose
- Express.js + Node.js
- React 18 + Vite
- Tailwind CSS
- Socket.io
- Cloudinary (image hosting)
- Nodemailer (emails)
- PDFKit (invoices)
- Stripe (payments)
