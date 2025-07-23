import { prisma } from '../src/lib/prisma';
import { generateShortCode } from '../src/lib/short-code';

async function main() {
  console.log('Seeding the database...');

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      shortUrls: {
        create: [
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://example.com/page1',
            title: 'Example Page 1',
          },
          {
            shortCode: generateShortCode(),
            originalUrl: 'https://example.com/page2',
            title: 'Example Page 2',
          },
        ],
      },
    },
  });

  console.log(`Created user with id: ${user.id}`);

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

