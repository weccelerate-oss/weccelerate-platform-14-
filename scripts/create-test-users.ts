/**
 * Create Test Users Script
 * 
 * Creates test users for development and testing.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-test-users.ts
 * 
 * Or add to package.json:
 * "db:test-users": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/create-test-users.ts"
 * 
 * @module scripts/create-test-users
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TestUser {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  company?: string;
  isActive: boolean;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@weccelerate.co.il',
    name: 'מנהל מערכת',
    password: 'Admin123!',
    role: 'ADMIN',
    company: 'WeCcelerate',
    isActive: true,
  },
  {
    email: 'entrepreneur@test.com',
    name: 'יזם לדוגמה',
    password: 'Test123!',
    role: 'ENTREPRENEUR',
    company: 'Startup Demo',
    isActive: true,
  },
  {
    email: 'mentor@weccelerate.co.il',
    name: 'מנטור ראשי',
    password: 'Mentor123!',
    role: 'MENTOR',
    company: 'WeCcelerate',
    isActive: true,
  },
  {
    email: 'inactive@test.com',
    name: 'משתמש לא פעיל',
    password: 'Test123!',
    role: 'ENTREPRENEUR',
    isActive: false,
  },
];

async function createTestUsers() {
  console.log('🔑 Creating test users...\n');

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⏭️  User already exists: ${userData.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          company: userData.company,
          isActive: userData.isActive,
        },
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error);
    }
  }

  console.log('\n📋 Test User Credentials:');
  console.log('═══════════════════════════════════════════════════');
  for (const user of TEST_USERS) {
    if (user.isActive) {
      console.log(`${user.role.padEnd(12)} | ${user.email.padEnd(30)} | ${user.password}`);
    }
  }
  console.log('═══════════════════════════════════════════════════\n');

  console.log('⚠️  Remember to change passwords in production!\n');
}

async function main() {
  try {
    await createTestUsers();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
