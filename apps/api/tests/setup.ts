import prisma from '../src/config/database';
import redis from '../src/config/redis';

// Setup hooks for Jest
beforeAll(async () => {
  // Database and Redis connections are already established by importing config
  console.log('Jest test environment setup complete');
});

afterEach(async () => {
  // Clean up test data after each test
  // Note: Uncomment the lines below if you want to clean up data after each test
  // await prisma.accessPass.deleteMany({ where: { id: { contains: 'test' } } });
  // await prisma.cardTemplate.deleteMany({ where: { id: { contains: 'test' } } });
});

afterAll(async () => {
  // Cleanup connections
  await prisma.$disconnect();
  redis.disconnect();
});

// Increase timeout for integration tests
jest.setTimeout(10000);
