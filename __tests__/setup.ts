import prisma from '~/prisma';

import { cleanDatabase } from './utils/database';

beforeAll(async () => {
  await cleanDatabase();
  await prisma.userColor.create({
    data: { colors: '' },
  });
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.userColor.deleteMany({});

  await prisma.disconnect();
});
