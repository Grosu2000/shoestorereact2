import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'sasha.grosu4@gmail.com';
    const password = 'Marvit75';
    const name = 'Admin';

    // Перевіряємо, чи вже існує
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin вже існує. Оновлюємо роль...');
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log('✅ Роль оновлено до ADMIN');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin успішно створено');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Пароль:', password);
    console.log('👑 Роль: ADMIN');
  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();