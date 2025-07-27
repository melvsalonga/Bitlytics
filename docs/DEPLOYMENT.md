# 🚀 Bitlytics Deployment Guide

This guide covers deploying Bitlytics to production environments, with a focus on Vercel deployment.

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database accessible
- [ ] Domain name configured (optional)
- [ ] Sentry account for error tracking (optional)
- [ ] OAuth app credentials (Google, GitHub - optional)

### ✅ Environment Setup
- [ ] Production environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificate configured
- [ ] DNS records configured

## 🌐 Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

```bash
# Ensure your code is committed and pushed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. **Sign up/Login to Vercel**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Click "New Project" → Import from Git
3. **Select Repository**: Choose your Bitlytics repository
4. **Configure Project**: Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

Add these environment variables in Vercel dashboard:

#### Required Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
APP_URL=https://your-domain.vercel.app
```

#### Optional Variables
```env
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_SENTRY_DSN=https://your-public-sentry-dsn@sentry.io/project
```

### Step 4: Configure Build Settings

In Vercel dashboard:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Development Command**: `npm run dev`

### Step 5: Database Setup

#### Option A: Vercel Postgres
```bash
# Install Vercel CLI
npm i -g vercel

# Connect to your project
vercel link

# Add Postgres database
vercel postgres create
```

#### Option B: External PostgreSQL
```bash
# Set up your PostgreSQL database
# Update DATABASE_URL in Vercel environment variables
```

### Step 6: Deploy

```bash
# Deploy manually (optional)
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```

### Step 7: Post-Deployment Setup

```bash
# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/bitlytics
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
      - APP_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=bitlytics
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run db:seed
```

## 🔧 Manual Server Deployment

### System Requirements
- **OS**: Ubuntu 20.04+ or similar
- **Node.js**: 18+
- **PM2**: Process manager
- **Nginx**: Reverse proxy
- **PostgreSQL**: Database

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

### Step 2: Application Setup
```bash
# Clone repository
git clone https://github.com/yourusername/bitlytics.git
cd bitlytics

# Install dependencies
npm ci --only=production

# Set up environment variables
cp .env.production.example .env.production
# Edit .env.production with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build
```

### Step 3: Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bitlytics',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Step 4: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /healthz {
        proxy_pass http://localhost:3000/healthz;
        access_log off;
    }
}
```

## 📊 Monitoring Setup

### Sentry Configuration

1. **Create Sentry Project**: Go to [sentry.io](https://sentry.io)
2. **Get DSN**: Copy your project DSN
3. **Add Environment Variables**:
   ```env
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   NEXT_PUBLIC_SENTRY_DSN=https://your-public-dsn@sentry.io/project-id
   ```

### Health Monitoring

The application includes a health check endpoint at `/healthz`:

```bash
# Check application health
curl https://your-domain.com/healthz

# Response format
{
  "status": "healthy",
  "timestamp": "2024-01-26T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "database": {
    "status": "connected",
    "users": 10,
    "urls": 150,
    "clicks": 1250
  },
  "uptime": 3600,
  "memory": {
    "used": 120,
    "total": 512,
    "external": 25
  }
}
```

### Uptime Monitoring

Set up monitoring with services like:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring features
- **StatusCake**: Website monitoring

## 🔐 Security Considerations

### SSL/TLS Configuration
- Use Let's Encrypt for free SSL certificates
- Enable HTTP/2 for better performance
- Configure HSTS headers

### Environment Security
- Use strong, unique secrets for all environments
- Rotate secrets regularly
- Use environment-specific database credentials

### Access Control
- Limit database access to application servers only
- Use VPC/private networks when possible
- Enable database connection encryption

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run lint
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db push --preview-feature

# Check connection string format
echo $DATABASE_URL
```

#### Performance Issues
```bash
# Monitor process usage
pm2 monit

# Check memory usage
free -h

# Analyze bundle size
npm run build -- --analyze
```

### Logs and Debugging

```bash
# View application logs
pm2 logs bitlytics

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
```

## 📈 Performance Optimization

### CDN Setup
- Configure Vercel Edge Network (automatic with Vercel)
- Or use CloudFlare for custom domains

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_shorturl_shortcode ON "ShortUrl"("shortCode");
CREATE INDEX idx_click_shorturlid ON "Click"("shortUrlId");
CREATE INDEX idx_click_createdat ON "Click"("clickedAt");
```

### Caching Strategy
```javascript
// Next.js revalidation
export const revalidate = 3600; // 1 hour

// API route caching
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support

If you encounter issues during deployment:

1. **Check the logs**: Always start with application and server logs
2. **Verify environment variables**: Ensure all required variables are set
3. **Test database connectivity**: Verify database is accessible
4. **Check DNS configuration**: Ensure domain points to correct server
5. **Review security settings**: Verify firewalls and security groups

---

**Happy deploying! 🚀**
