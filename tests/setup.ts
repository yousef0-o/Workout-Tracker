import { beforeAll, afterAll } from 'vitest';
import prisma from '../src/prisma';
import { seed } from '../prisma/seed';

beforeAll(async () => {
  // Ensure database is connected and seeded
  await prisma.$connect();
  await seed();
});

afterAll(async () => {
  await prisma.$disconnect();
});
