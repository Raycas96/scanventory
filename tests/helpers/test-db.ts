import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

let container: StartedPostgreSqlContainer | null = null;
let testPrisma: PrismaClient | null = null;

/**
 * Start PostgreSQL container and create Prisma client
 * This runs once before all tests
 */
export async function startTestDatabase(): Promise<PrismaClient> {
  if (container && testPrisma) {
    return testPrisma;
  }

  // Start PostgreSQL container
  container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("scanventory_test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  // Set environment variable for Prisma
  process.env.TEST_DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL = databaseUrl; // Also set for Prisma CLI

  // Run Prisma migrations or push schema
  try {
    execSync(`pnpm prisma db push --skip-generate --accept-data-loss`, {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: databaseUrl },
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("Failed to push Prisma schema:", error);
    throw error;
  }

  // Create Prisma client with test database
  testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  // Test connection
  await testPrisma.$connect();

  return testPrisma;
}

/**
 * Stop PostgreSQL container
 * This runs once after all tests
 */
export async function stopTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }

  if (container) {
    await container.stop();
    container = null;
  }
}

/**
 * Get the test Prisma client
 */
export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    throw new Error(
      "Test database not started. Call startTestDatabase() first.",
    );
  }
  return testPrisma;
}
