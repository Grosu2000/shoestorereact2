const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@shoestore.com';
    const password = 'admin123';
    const name = 'Admin User';

    // Перевірка чи адмін вже існує
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      });
      console.log('✅ Updated existing user to ADMIN');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created');
    }

    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👑 Role: ADMIN');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();