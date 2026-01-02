import { afterAll, beforeEach } from "vitest";
import {
  startTestDatabase,
  stopTestDatabase,
  getTestPrisma,
} from "./helpers/test-db";

// Start DB container before any test file runs
await startTestDatabase(); // sets DATABASE_URL for Prisma

// Clean database before each test
beforeEach(async () => {
  const testPrisma = getTestPrisma();
  await testPrisma.job.deleteMany();
  await testPrisma.producthistory.deleteMany();
  await testPrisma.productCache.deleteMany();
  await testPrisma.locationCache.deleteMany();
  await testPrisma.shopSettings.deleteMany();
  await testPrisma.shop.deleteMany();
  await testPrisma.session.deleteMany();
});

// Stop DB after all tests
afterAll(async () => {
  await stopTestDatabase();
});
