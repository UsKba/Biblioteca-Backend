import prisma from '~/prisma';

import { cleanDatabase } from './utils/database';

async function createColors() {
  const colorsDatabase = [];

  const colors = [
    {
      color: '#FF1F00',
    },
    {
      color: '#3D6DCC',
    },
    {
      color: '#2B9348',
    },
    {
      color: '#8357E5',
    },
  ];

  for (const colorData of colors) {
    const colorCreated = await prisma.color.create({
      data: colorData,
    });

    colorsDatabase.push(colorCreated);
  }

  return colorsDatabase;
}

beforeAll(async () => {
  await cleanDatabase();
  await createColors();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.color.deleteMany({});

  await prisma.disconnect();
});
