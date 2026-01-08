const bcrypt = require('bcryptjs');

async function createAdmin() {
  // Use the existing db module
  const { prisma } = await import('./lib/db.ts');
  
  try {
    const hash = await bcrypt.hash('admin123', 12);
    console.log('Hash created');
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@weccelerate.co.il' },
      update: { password: hash, isActive: true },
      create: {
        email: 'admin@weccelerate.co.il',
        name: 'Admin',
        password: hash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    
    console.log('Admin created:', user.email);
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();