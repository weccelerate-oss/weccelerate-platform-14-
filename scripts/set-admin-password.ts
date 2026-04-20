/**
 * Securely set admin user password
 * Usage: npx tsx scripts/set-admin-password.ts admin@email.com newpassword
 * The password will be hashed with bcrypt before storing
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists (takes priority over .env)
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function setAdminPassword() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];

  if (!email || !plainPassword) {
    console.error('❌ Usage: npx tsx scripts/set-admin-password.ts <email> <password>');
    process.exit(1);
  }

  if (plainPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Update existing user's password and make them admin
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log(`✅ Updated existing user: ${email}`);
      console.log(`🔒 Password set and role updated to ADMIN`);
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          language: 'he',
          timezone: 'Asia/Jerusalem',
        },
      });
      console.log(`✅ Created new ADMIN user: ${email}`);
      console.log(`🆔 User ID: ${newUser.id}`);
      console.log('🔒 Password has been securely hashed with bcrypt');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

setAdminPassword();
