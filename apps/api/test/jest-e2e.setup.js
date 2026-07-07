const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Executado uma unica vez antes de toda a suite e2e. Usa um arquivo
 * SQLite dedicado (prisma/test.db), recriado do zero a cada execucao,
 * para nao interferir com o banco de desenvolvimento (prisma/dev.db).
 */
module.exports = async () => {
  const apiRoot = path.join(__dirname, '..');
  const testDbPath = path.join(apiRoot, 'prisma', 'test.db');

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  process.env.DATABASE_URL = 'file:./test.db';
  process.env.AI_PROVIDER = 'mock';
  process.env.NODE_ENV = 'test';

  execSync('npx prisma migrate deploy', {
    cwd: apiRoot,
    env: process.env,
    stdio: 'inherit',
  });
};
