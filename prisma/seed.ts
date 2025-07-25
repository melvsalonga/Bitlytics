import { prisma } from '../src/lib/prisma';
import { generateShortCode } from '../src/lib/short-code';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding the database...');

  // Hash passwords for test users
  const hashedPassword = await bcrypt.hash('password123', 12);
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);

  // Create test user with password
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      emailVerified: new Date(),
      shortUrls: {
        create: [
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://github.com/vercel/next.js',
            title: 'Next.js GitHub Repository',
            description: 'The React Framework for Production',
          },
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://tailwindcss.com',
            title: 'Tailwind CSS',
            description: 'A utility-first CSS framework',
          },
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://prisma.io',
            title: 'Prisma',
            description: 'Next-generation ORM for TypeScript & JavaScript',
          },
        ],
      },
    },
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      shortUrls: {
        create: [
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://bitlytics.com/admin',
            title: 'Admin Dashboard',
            description: 'Administrative interface',
          },
        ],
      },
    },
  });

  console.log(`Created test user: ${testUser.email} (ID: ${testUser.id})`);
  console.log(`Created admin user: ${adminUser.email} (ID: ${adminUser.id})`);

  // Add some click data for analytics testing
  const shortUrls = await prisma.shortUrl.findMany();
  
  for (const url of shortUrls) {
    // Create some sample clicks for each URL
    const clicksToCreate = Math.floor(Math.random() * 20) + 5; // 5-25 clicks per URL
    
    for (let i = 0; i < clicksToCreate; i++) {
      await prisma.click.create({
        data: {
          shortUrlId: url.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          country: ['US', 'CA', 'UK', 'DE', 'FR'][Math.floor(Math.random() * 5)],
          city: ['New York', 'Toronto', 'London', 'Berlin', 'Paris'][Math.floor(Math.random() * 5)],
          referrer: Math.random() > 0.5 ? 'https://google.com' : null,
          clickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      });
    }
  }

  console.log('Added sample click data for analytics testing.');
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

