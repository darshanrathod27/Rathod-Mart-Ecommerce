<p align="center">
  <img src="./screenshots/logo.png" alt="Rathod Mart Logo" width="200"/>
</p>

<h1 align="center">🛒 Rathod Mart - E-Commerce Platform</h1>

<p align="center">
  <strong>A modern, full-stack e-commerce platform built with MERN Stack</strong>
</p>

<p align="center">
  <a href="https://rathod-mart-store.onrender.com">🌐 Live Store</a> •
  <a href="https://rathod-mart-admin.onrender.com">👨‍💼 Admin Panel</a> •
  <a href="https://rathod-mart-backend.onrender.com">⚙️ API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Material_UI-5.x-0081CB?style=for-the-badge&logo=mui&logoColor=white" alt="MUI"/>
  <img src="https://img.shields.io/badge/Redux_Toolkit-1.x-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux"/>
  <img src="https://img.shields.io/badge/Cloudinary-Images-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"/>
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/>
</p>

---

## 📸 Screenshots

<p align="center">
  <img src="./screenshots/home.png" alt="Home Page" width="800"/>
</p>

<details>
<summary>🖥️ Desktop Screenshots</summary>

### Customer Store
<table>
  <tr>
    <td align="center"><b>Home Page</b></td>
    <td align="center"><b>Products</b></td>
    <td align="center"><b>Cart</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/home.png" alt="Home" width="280"/></td>
    <td><img src="./screenshots/product.png" alt="Product" width="280"/></td>
    <td><img src="./screenshots/cart.png" alt="Cart" width="280"/></td>
  </tr>
</table>

### Admin Panel
<table>
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Products</b></td>
    <td align="center"><b>Orders</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/admin-dashboard.png" alt="Dashboard" width="280"/></td>
    <td><img src="./screenshots/admin-products.png" alt="Products" width="280"/></td>
    <td><img src="./screenshots/admin-orders.png" alt="Orders" width="280"/></td>
  </tr>
</table>

</details>

<details>
<summary>📱 Mobile Responsive Screenshots</summary>

<table>
  <tr>
    <td align="center"><b>Mobile Home</b></td>
    <td align="center"><b>Mobile Products</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/mobile-home.png" alt="Mobile Home" width="200"/></td>
    <td><img src="./screenshots/mobile-products.png" alt="Mobile Products" width="200"/></td>
  </tr>
</table>

</details>

---

## ✨ Features

### 🛍️ Customer Store
| Feature | Description |
|---------|-------------|
| 🔐 **Google OAuth** | One-click login with Google |
| 🛒 **Smart Cart** | Add, remove, update quantities |
| ❤️ **Wishlist** | Save products for later |
| 🔍 **Advanced Search** | Filter by category, price, size |
| 📱 **Responsive Design** | Beautiful on all devices |
| 🎨 **Modern UI** | Glassmorphism, animations |
| 💳 **Easy Checkout** | Simple checkout process |
| ⭐ **Product Reviews** | Rate and review products |

### 👨‍💼 Admin Panel
| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Sales analytics & stats |
| 📦 **Product Management** | CRUD with image upload |
| 📁 **Category Management** | Nested categories |
| 👥 **User Management** | Customer & staff roles |
| 🏷️ **Promo Codes** | Create discount codes |
| 📋 **Order Management** | Track & update orders |
| 📏 **Size/Color Mapping** | Product variants |
| 📈 **Inventory Tracking** | Stock management |

---

## 🛠️ Tech Stack

### Frontend
```
React 18 • Material UI 5 • Redux Toolkit • Framer Motion
React Router 6 • React Hook Form • Yup • Swiper.js
Axios • React Hot Toast • Chart.js
```

### Backend
```
Node.js • Express.js • MongoDB • Mongoose
JWT • Passport.js • Google OAuth 2.0
Cloudinary • Bcrypt • Cookie-Parser
```

### DevOps & Tools
```
Render (Deployment) • MongoDB Atlas • Cloudinary CDN
Git • VS Code • Postman
```

---

## 🚀 Live Demo

| Application | URL | Status |
|-------------|-----|--------|
| 🛍️ **Customer Store** | [rathod-mart-store.onrender.com](https://rathod-mart-store.onrender.com) | ✅ Live |
| 👨‍💼 **Admin Panel** | [rathod-mart-admin.onrender.com](https://rathod-mart-admin.onrender.com) | ✅ Live |
| ⚙️ **Backend API** | [rathod-mart-backend.onrender.com](https://rathod-mart-backend.onrender.com) | ✅ Live |

---

## 📁 Project Structure

```
Rathod-Mart-Ecommerce/
├── 📂 rathod-mart-frontend/     # Customer Store (React)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Redux store
│   │   ├── context/             # React contexts
│   │   └── data/                # API services
│   └── public/
│
├── 📂 rathod-mart-admin/
│   ├── 📂 frontend/             # Admin Panel (React + Vite)
│   │   ├── src/
│   │   │   ├── components/      # Admin components
│   │   │   ├── pages/           # Admin pages
│   │   │   └── services/        # API services
│   │   └── public/
│   │
│   └── 📂 backend/              # API Server (Express)
│       ├── config/              # Database & passport config
│       ├── controllers/         # Route controllers
│       ├── middleware/          # Auth & error handlers
│       ├── models/              # Mongoose models
│       ├── routes/              # API routes
│       └── utils/               # Helper functions
│
└── 📂 screenshots/              # Project screenshots
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Rathod-Mart-Ecommerce.git
cd Rathod-Mart-Ecommerce

# Install Backend dependencies
cd rathod-mart-admin/backend
npm install

# Install Admin Frontend dependencies
cd ../frontend
npm install

# Install Customer Frontend dependencies
cd ../../rathod-mart-frontend
npm install
```

### Environment Variables

Create `.env` files in each project:

**Backend** (`rathod-mart-admin/backend/.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Run Development Servers

```bash
# Terminal 1 - Backend (Port 5000)
cd rathod-mart-admin/backend
npm start

# Terminal 2 - Admin Panel (Port 5173)
cd rathod-mart-admin/frontend
npm run dev

# Terminal 3 - Customer Store (Port 3000)
cd rathod-mart-frontend
npm start
```

---

## 🔗 API Endpoints

<details>
<summary>📋 View API Routes</summary>

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/google` | Google OAuth |
| POST | `/api/users/logout` | Logout user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart & Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart` | Add to cart |
| GET | `/api/wishlist` | Get user wishlist |
| POST | `/api/wishlist` | Add to wishlist |

</details>

---

## 👨‍💻 Author

<p align="center">
  <img src="https://github.com/darshanrathod27.png" width="100" style="border-radius: 50%"/>
</p>

<p align="center">
  <strong>Darshan Rathod</strong>
</p>

<p align="center">
  <a href="https://github.com/darshanrathod27">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <a href="https://linkedin.com/in/darshanrathod27">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/darshanrathod27">Darshan Rathod</a>
</p>

<p align="center">
  ⭐ Star this repo if you like it!
</p>
