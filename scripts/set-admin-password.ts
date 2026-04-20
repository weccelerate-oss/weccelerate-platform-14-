/**
 * Securely set admin user password
 * Usage: npx tsx scripts/set-admin-password.ts admin@email.com newpassword
 * The password will be hashed with bcrypt before storing
 */

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
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      console.error(`⚠️  User is ${user.role}, not ADMIN`);
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password updated for ${email}`);
    console.log('🔒 Password has been securely hashed with bcrypt');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

setAdminPassword();
