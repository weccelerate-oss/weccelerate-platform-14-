/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton instance of PrismaClient.
 * For Prisma 7, you may need to use the adapter approach.
 * 
 * Usage:
 * import { prisma } from '@/lib/db';
 * const users = await prisma.user.findMany();
 * 
 * Note: Run `npx prisma generate` after setting up your database
 * to generate the Prisma client.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaClientType = any;

// Add prisma to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

// Mock client for when Prisma isn't available
function createMockPrismaClient(): PrismaClientType {
  const createMockMethod = () => async () => null;
  
  const mockModel = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (args: { data: Record<string, unknown> }) => ({ id: 'mock-id', ...args.data }),
    update: async (args: { data: Record<string, unknown> }) => ({ id: 'mock-id', ...args.data }),
    delete: async () => ({ id: 'mock-id' }),
    count: async () => 0,
    upsert: async (args: { create: Record<string, unknown> }) => ({ id: 'mock-id', ...args.create }),
    deleteMany: async () => ({ count: 0 }),
    updateMany: async () => ({ count: 0 }),
    createMany: async () => ({ count: 0 }),
    aggregate: async () => ({}),
    groupBy: async () => [],
  };
  
  const handler = {
    get: (_target: object, prop: string) => {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {};
      }
      if (prop === '$transaction') {
        return async (fn: (tx: PrismaClientType) => Promise<unknown>) => fn(createMockPrismaClient());
      }
      if (prop === '$queryRaw' || prop === '$executeRaw') {
        return async () => [];
      }
      // Return mock model for any model access
      return mockModel;
    },
  };
  
  return new Proxy({}, handler);
}

// Lazy load PrismaClient
function getPrismaClient(): PrismaClientType {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL not set. Using mock Prisma client.');
      return createMockPrismaClient();
    }

    // Dynamic import to avoid build errors when Prisma hasn't been generated
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client');
    
    // For Prisma 7, we might need to use the adapter
    // But first try without it for compatibility
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaPg } = require('@prisma/adapter-pg');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Pool } = require('pg');
      
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' 
          ? ['error', 'warn'] 
          : ['error'],
      });
    } catch {
      // Fallback to standard Prisma client (for Prisma < 7)
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['error', 'warn'] 
          : ['error'],
      });
    }
  } catch (error) {
    // Return a mock client for development without database
    console.warn('⚠️ Prisma client not available. Using mock client.', error);
    return createMockPrismaClient();
  }
}

// Create a singleton instance
const prisma: PrismaClientType = global.prisma || getPrismaClient();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
export default prisma;
