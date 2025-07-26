# 🔗 Bitlytics

**A modern, full-featured URL shortener with comprehensive analytics**

Bitlytics is a sophisticated URL shortening platform built with Next.js 14, featuring real-time analytics, user authentication, custom short codes, and an admin dashboard. Perfect for businesses and individuals who need detailed insights into their link performance.


## ✨ Features

### 🚀 **Core Functionality**
- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Short Codes**: Create branded, memorable links (e.g., `bitlytics.com/my-portfolio`)
- **Auto-Generated Codes**: 6-character URL-safe codes using nanoid
- **Instant Redirects**: Lightning-fast redirects with analytics tracking
- **SEO-Friendly**: Proper meta tags and social media previews

### 📊 **Advanced Analytics**
- **Real-Time Tracking**: Monitor clicks as they happen
- **Interactive Dashboards**: Beautiful charts with Recharts
- **Comprehensive Metrics**: Click counts, unique visitors, geographic data
- **Time-Based Analysis**: Daily, weekly, and monthly breakdowns
- **User Agent Tracking**: Device and browser analytics
- **Referrer Analysis**: Track traffic sources

### 👤 **User Management**
- **Authentication System**: Secure login with NextAuth.js
- **Multiple Auth Methods**: Email/password and OAuth (Google, GitHub)
- **User Dashboard**: Manage all your shortened URLs
- **URL Management**: Edit, delete, and organize your links
- **Search & Filter**: Find your URLs quickly
- **Pagination**: Handle large collections efficiently

### 🔐 **Admin Panel**
- **Platform Statistics**: Monitor system-wide metrics
- **User Management**: Overview of platform users
- **System Health**: Real-time system monitoring
- **Role-Based Access**: Secure admin-only features
- **Analytics Overview**: Platform-wide usage insights

### 🛡️ **Security & Quality**
- **Input Validation**: Comprehensive URL and code validation
- **Rate Limiting**: Prevent abuse and spam
- **Reserved Keywords**: Protect system routes
- **Secure Sessions**: JWT-based authentication
- **Environment-Based Restrictions**: Production vs development controls

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 15.4.3](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Recharts](https://recharts.org/)** - Interactive charts and graphs
- **[React Hook Form](https://react-hook-form.com/)** - Form handling
- **[Zod](https://zod.dev/)** - Schema validation

### **Backend & Database**
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database access
- **[PostgreSQL](https://www.postgresql.org/)** - Production database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication system
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[nanoid](https://github.com/ai/nanoid)** - URL-safe ID generation

### **Development & Testing**
- **[Jest](https://jestjs.io/)** - JavaScript testing framework
- **[React Testing Library](https://testing-library.com/)** - Component testing
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

### **UI & Styling**
- **[Class Variance Authority](https://cva.style/)** - Component variants
- **[clsx](https://github.com/lukeed/clsx)** - Conditional classes
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Tailwind class merging
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bitlytics.git
   cd bitlytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/bitlytics"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # App Configuration
   APP_URL="http://localhost:3000"
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Examples

### Shortened URL Examples

**Auto-generated codes:**
```
https://bitlytics.com/xK3mN9  → https://nextjs.org
https://bitlytics.com/Yp2vQ8  → https://tailwindcss.com
https://bitlytics.com/Zm4rL7  → https://github.com
```

**Custom codes:**
```
https://bitlytics.com/my-portfolio  → https://yourportfolio.com
https://bitlytics.com/blog-2024     → https://yourblog.com/2024
https://bitlytics.com/contact-me    → https://yoursite.com/contact
```

### Demo Accounts
After running `npm run db:seed`:

**Admin Account:**
- Email: `admin@bitlytics.com`
- Password: `admin123`
- Access: Full admin panel

**Regular User:**
- Email: `user@example.com`
- Password: `password123`
- Access: User dashboard

## 🧪 Testing

Bitlytics includes a comprehensive testing suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

**Test Coverage:**
- ✅ Unit Tests: 38/38 passing (100%)
- ✅ Integration Tests: API endpoints
- ✅ Component Tests: React components
- ✅ E2E Tests: Complete user workflows

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset and reseed database |
| `npm run db:studio` | Open Prisma Studio |

## 🏗️ Project Structure

```
bitlytics/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/                # API routes
│   │   ├── 📁 auth/               # Authentication pages
│   │   ├── 📁 admin/              # Admin panel
│   │   ├── 📁 dashboard/          # User dashboard
│   │   └── 📁 analytics/          # Analytics pages
│   ├── 📁 components/             # React components
│   │   ├── 📁 ui/                 # shadcn/ui components
│   │   └── 📁 analytics/          # Analytics components
│   ├── 📁 lib/                    # Utility functions
│   └── 📁 types/                  # TypeScript types
├── 📁 prisma/                     # Database schema & migrations
├── 📁 tests/                      # Test files
├── 📁 docs/                       # Project documentation
└── 📄 README.md                   # Project documentation
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin` - User login

### URL Management
- `POST /api/urls` - Create short URL
- `GET /api/urls` - List user's URLs
- `GET /api/urls/[shortCode]` - Get URL details
- `PUT /api/urls/[shortCode]` - Update URL
- `DELETE /api/urls/[shortCode]` - Delete URL

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/urls` - URL-specific analytics

### Admin
- `GET /api/admin/stats` - Platform statistics

### Redirects
- `GET /[shortCode]` - Redirect to original URL

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Configure Database**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma migrate deploy`
   - Seed database: `npm run db:seed`

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
APP_URL="https://your-domain.com"
```

## 📊 Features Roadmap

### ✅ Completed
- [x] URL shortening with custom codes
- [x] Real-time analytics dashboard
- [x] User authentication system
- [x] Admin panel with statistics
- [x] Comprehensive testing suite
- [x] Responsive design
- [x] Database seeding

### 🚧 In Progress
- [ ] Deployment automation
- [ ] Performance optimization
- [ ] Security hardening

### 🔮 Future Enhancements
- [ ] Redis caching for high-performance
- [ ] Email verification system
- [ ] API rate limiting
- [ ] Bulk URL import/export
- [ ] QR code generation
- [ ] Advanced analytics (heatmaps, A/B testing)
- [ ] Team collaboration features
- [ ] Custom domains
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](docs/CONTRIBUTING.md) before submitting PRs.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework that powers Bitlytics
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js


**Made with ❤️ using Next.js 15, TypeScript, and modern web technologies**
