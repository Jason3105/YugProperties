# Yug Properties - Premium Real Estate Platform

A full-stack real estate application for managing and showcasing premium properties across Mumbai. Built with React, Node.js, PostgreSQL, and Firebase Storage.

## 🌟 Features

### For Users
- **Property Listings**: Browse residential and commercial properties
- **Advanced Search**: Filter by location, price, type, and features
- **Property Details**: High-quality images, brochure downloads, virtual tours
- **Responsive Design**: Seamless experience across all devices
- **SEO Optimized**: Maximum visibility in search results

### For Admins
- **Property Management**: Add, edit, delete property listings
- **Image Upload**: Multiple images with Firebase Storage integration
- **PDF Brochures**: Upload and manage property brochures (20MB limit)
- **Growth Analytics**: Track storage usage and system metrics
- **User Management**: Secure authentication and authorization

## 🚀 Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Navigation
- **React Helmet Async** - SEO meta tags
- **Recharts** - Analytics visualization

### Backend
- **Node.js & Express** - Server framework
- **PostgreSQL (Neon)** - Serverless database
- **Firebase Storage** - File storage
- **JWT** - Authentication
- **Helmet** - Security headers
- **Express Rate Limit** - API protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Neon recommended)
- Firebase project with Storage enabled

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Jason3105/YugProperties.git
cd YugProperties
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_database_url_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Admin Default Credentials
ADMIN_EMAIL=admin@yugproperties.co.in
ADMIN_PASSWORD=your_secure_password
```

Create `firebase-service-account.json` in the backend directory with your Firebase credentials.

Run database migrations:
```bash
node config/initDb.js
node migrations/createStorageHistoryTable.js
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SITE_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm start
```

## 🔒 Security Features

- **Helmet.js**: Security headers and CSP directives
- **Rate Limiting**: 100 requests/15min (general), 5 attempts/15min (auth)
- **CORS**: Configured for development and production
- **JWT Authentication**: Secure token-based auth
- **Environment Variables**: Sensitive data protection

## 📱 SEO Optimization

- Comprehensive meta tags (Open Graph, Twitter Cards, Geo tags)
- Schema.org structured data (RealEstateAgent, WebSite)
- Dynamic SEO component system with React Helmet
- Sitemap generator (`/sitemap.xml`)
- Optimized robots.txt
- PWA-capable with manifest.json
- Multi-platform favicon support (17+ sizes)

## 📊 Storage Tracking

- Monthly storage usage tracking
- Breakdown by file type (images vs brochures)
- Growth reports with visual charts
- Manual sync script: `npm run sync-storage`

## 🎨 Key Functionalities

### Property Management
- Add properties with multiple images
- Upload PDF brochures (optional, 20MB limit)
- Edit property details
- Delete properties (auto-cleanup of files)
- Featured property marking

### File Lifecycle
- Automatic Firebase Storage cleanup on:
  - File replacement
  - Property deletion
  - Brochure removal
- Monthly storage history tracking

### Analytics Dashboard
- Property count tracking
- User registrations
- Storage growth visualization
- Monthly metrics

## 📝 Available Scripts

### Backend
```bash
npm start          # Start the server
npm run sync-storage  # Sync storage statistics
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🌐 Deployment

### Environment Configuration

For production, update environment variables:

**Backend `.env`:**
```env
NODE_ENV=production
BACKEND_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SITE_URL=https://your-frontend-domain.com
```

### Deployment Checklist
- [ ] Update all environment variables
- [ ] Build frontend: `npm run build`
- [ ] Test all API endpoints
- [ ] Verify Firebase Storage access
- [ ] Submit sitemap to Google Search Console
- [ ] Test robots.txt accessibility
- [ ] Run Lighthouse audit (target 90+ SEO score)
- [ ] Test mobile responsiveness
- [ ] Create og-image.jpg for social sharing

## 📞 Contact

**Email:** subhash@yugproperties.co.in  
**Phone:** +91 88051 17788 | +91 78751 17788  
**Location:** Virar West, Mumbai, Maharashtra 401303

## 👨‍💻 Developer

Crafted with ❤️ by [The xDEVS Co](https://www.linkedin.com/company/the-xdevs/)

## 📄 License

© 2025 Yug Properties. All rights reserved.

## 🤝 Contributing

This is a private project. For any inquiries, please contact the development team.

---

**Note:** Make sure to keep your `.env` files and Firebase service account credentials secure and never commit them to version control.
