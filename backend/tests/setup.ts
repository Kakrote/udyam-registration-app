import { PrismaClient } from '@prisma/client';

// Global test setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db', // Use SQLite for tests
    },
  },
});

beforeAll(async () => {
  // Setup test database
  // In a real project, you'd run migrations here
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up test data before each test
  // await prisma.udyamRegistration.deleteMany();
  // await prisma.formSubmissionLog.deleteMany();
});

export { prisma };
