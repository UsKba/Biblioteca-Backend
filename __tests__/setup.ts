import prisma from '~/prisma';

import { cleanDatabase } from './utils/database';

afterAll(async () => {
  await cleanDatabase();
  await prisma.disconnect();
});
