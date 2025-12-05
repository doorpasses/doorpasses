import { beforeAll, afterAll, afterEach } from 'vitest';
import prisma from '../src/config/database';
import redis from '../src/config/redis';
import { execSync } from 'child_process';
import path from 'path';

// Setup hooks
beforeAll(async () => {
  // Run database migrations before tests
  try {
    const dbPath = path.resolve(__dirname, '../../packages/database');
    execSync('npm run db:migrate:deploy', { cwd: dbPath, stdio: 'pipe' });
    console.log('Database migrations applied');
  } catch (error) {
    console.error('Failed to run migrations:', error);
  }

  // Database and Redis connections are already established by importing config
  console.log('Test environment setup complete');
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
