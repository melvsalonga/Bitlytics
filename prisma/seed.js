const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function generateShortCode(length = 6) {
  return nanoid(length);
}

async function main() {
  console.log('Seeding the database...');

  // Hash passwords for test users
  const hashedPassword = await bcrypt.hash('password123', 12);
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bitlytics.com',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      shortUrls: {
        create: [
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://nextjs.org',
            title: 'Next.js Official Website',
            description: 'The React Framework for Production',
          },
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://tailwindcss.com',
            title: 'Tailwind CSS',
            description: 'A utility-first CSS framework',
          },
        ],
      },
    },
  });

  console.log(`Created admin user with id: ${adminUser.id}`);

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
      emailVerified: new Date(),
      shortUrls: {
        create: [
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://github.com',
            title: 'GitHub',
            description: 'Where software is built',
          },
          {
            shortCode: 'custom-link',
            originalUrl: 'https://vercel.com',
            title: 'Vercel',
            description: 'Deploy and scale apps',
            customCode: 'custom-link',
          },
        ],
      },
    },
  });

  console.log(`Created regular user with id: ${regularUser.id}`);

  // Add some click data for analytics
  const urls = await prisma.shortUrl.findMany();
  
  for (const url of urls) {
    // Add some sample clicks
    await prisma.click.createMany({
      data: [
        {
          shortUrlId: url.id,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          country: 'United States',
          city: 'New York',
          referrer: 'https://google.com',
          clickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        },
        {
          shortUrlId: url.id,
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          country: 'Canada',
          city: 'Toronto',
          referrer: 'https://twitter.com',
          clickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
        {
          shortUrlId: url.id,
          ipAddress: '172.16.0.1',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          country: 'United Kingdom',
          city: 'London',
          clickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Update click counts
    await prisma.shortUrl.update({
      where: { id: url.id },
      data: {
        clickCount: 3,
        uniqueClickCount: 3,
      },
    });
  }

  console.log('Added sample click data for analytics');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
