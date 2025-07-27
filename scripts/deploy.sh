#!/bin/bash

# Bitlytics Deployment Script
# This script handles the deployment process for Bitlytics

set -e  # Exit on any error

echo "🚀 Starting Bitlytics deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    print_error "NEXTAUTH_SECRET environment variable is not set"
    exit 1
fi

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Step 2: Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Step 3: Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Step 4: Build the application
print_status "Building application..."
npm run build

# Step 5: Run tests (optional, can be skipped in production)
if [ "$SKIP_TESTS" != "true" ]; then
    print_status "Running tests..."
    npm run test:ci
fi

# Step 6: Check if build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Deployment completed successfully!"

# Step 7: Optional - Seed database if specified
if [ "$SEED_DATABASE" = "true" ]; then
    print_status "Seeding database..."
    npm run db:seed
    print_success "Database seeded successfully!"
fi

# Step 8: Health check
print_status "Performing health check..."
if command -v curl &> /dev/null; then
    # Wait a moment for the server to start
    sleep 5
    
    if curl -f -s "${APP_URL:-http://localhost:3000}/healthz" > /dev/null; then
        print_success "Health check passed!"
    else
        print_warning "Health check failed - server might not be ready yet"
    fi
else
    print_warning "curl not available - skipping health check"
fi

echo ""
print_success "🎉 Bitlytics deployment completed!"
echo ""
echo "Next steps:"
echo "1. Verify the application is running at ${APP_URL:-http://localhost:3000}"
echo "2. Check the health endpoint at ${APP_URL:-http://localhost:3000}/healthz"
echo "3. Monitor logs for any errors"
echo ""
echo "Happy shortening! 🔗"
