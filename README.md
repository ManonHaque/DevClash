# DevClash
```markdown
# 🍕 Smart Campus Ordering System

A pickup-only food ordering platform for CUET students and campus vendors.

## 🚀 Features

**Students:**
- Browse vendor menus
- Shopping cart with real-time updates
- Order tracking (Pending → Preparing → Ready → Completed)
- CUET email authentication

**Vendors:**
- Menu management (CRUD operations)
- Order status updates
- Dashboard analytics

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment:** SSLCommerz (sandbox)

## 🏃‍♂️ Quick Start

```bash
# Clone repository
git clone <your-repo-url>

# Backend setup
cd backend
npm install
npm start

# Frontend setup
cd frontend
npm install
npm start
```

## 📝 Environment Variables

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

## 👥 User Roles

- **Students:** Browse, order, track (@cuet.ac.bd email required)
- **Vendors:** Manage menu, process orders

## 📱 Core Routes

- `/vendors` - Browse vendors
- `/cart` - Shopping cart (students)
- `/orders` - Order management
- `/vendor/menu` - Menu management (vendors)

Built for CUET campus community 🎓
```
