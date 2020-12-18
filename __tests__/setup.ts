import prisma from '~/prisma';

import { cleanDatabase } from './utils';

afterAll(async () => {
  await cleanDatabase();
  await prisma.disconnect();
});
