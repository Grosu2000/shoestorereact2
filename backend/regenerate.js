const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Regenerating Prisma Client...');
try {
  execSync('npx prisma generate', { 
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });
  console.log('✅ Prisma Client regenerated successfully!');
} catch (error) {
  console.error('❌ Error regenerating Prisma Client:', error.message);
  process.exit(1);
}
