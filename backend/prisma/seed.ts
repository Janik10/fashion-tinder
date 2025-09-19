import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  // Clean the database
  await prisma.vote.deleteMany();
  await prisma.voteSession.deleteMany();
  await prisma.like.deleteMany();
  await prisma.save.deleteMany();
  await prisma.pass.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();
  await prisma.item.deleteMany();

  // Create test users
  const password = await bcrypt.hash('password123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice',
        passwordHash: password,
        bio: 'Fashion enthusiast',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob',
        passwordHash: password,
        bio: 'Streetwear lover',
      },
    }),
  ]);

  // Create sample items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: 'Classic White Sneakers',
        brand: 'Nike',
        price: 89.99,
        images: ['https://example.com/sneakers1.jpg'],
        tags: ['sneakers', 'casual', 'white', 'unisex'],
        gender: 'unisex',
        season: 'all',
      },
    }),
    prisma.item.create({
      data: {
        name: 'Denim Jacket',
        brand: 'Levi\'s',
        price: 129.99,
        images: ['https://example.com/jacket1.jpg'],
        tags: ['denim', 'jacket', 'casual', 'streetwear'],
        gender: 'unisex',
        season: 'spring',
      },
    }),
    // Add more items here
  ]);

  // Create some interactions
  await prisma.like.create({
    data: {
      userId: users[0].id,
      itemId: items[0].id,
    },
  });

  await prisma.save.create({
    data: {
      userId: users[0].id,
      itemId: items[1].id,
    },
  });

  await prisma.friendship.create({
    data: {
      userAId: users[0].id,
      userBId: users[1].id,
      status: 'accepted',
    },
  });

  console.log('Database has been seeded');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });