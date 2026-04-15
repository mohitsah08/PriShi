import { createRequire } from 'node:module';

import { connectDatabase } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.js';

const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

const demoUsers = [
  {
    name: 'PriShi Admin',
    email: 'admin@prishi.ai',
    password: 'Admin@12345',
    role: 'admin',
    plan: 'pro'
  },
  {
    name: 'PriShi User',
    email: 'user@prishi.ai',
    password: 'User@12345',
    role: 'user',
    plan: 'free'
  }
];

async function upsertUser({ name, email, password, role, plan }) {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        passwordHash,
        role,
        plan
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return user;
}

async function seed() {
  await connectDatabase();

  for (const userConfig of demoUsers) {
    const user = await upsertUser(userConfig);
    logger.info(
      {
        email: user.email,
        role: user.role,
        plan: user.plan
      },
      'Seeded user'
    );
  }

  logger.info('Seed completed successfully');
  process.exit(0);
}

seed().catch((error) => {
  logger.error({ error }, 'Seed failed');
  process.exit(1);
});
