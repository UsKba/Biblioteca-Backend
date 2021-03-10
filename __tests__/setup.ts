import userConfig from '~/config/user';

import prisma from '~/prisma';

import { cleanDatabase } from './utils/database';

async function createRoles() {
  const rolesDatabase = [];

  const roles = [
    {
      slug: userConfig.role.admin.slug,
    },
    {
      slug: userConfig.role.student.slug,
    },
  ];

  for (const roleData of roles) {
    const roleCreated = await prisma.role.create({
      data: roleData,
    });

    rolesDatabase.push(roleCreated);
  }

  return rolesDatabase;
}

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

async function createComputerLocals() {
  const computerLocalsDatabase = [];

  const locals = [
    {
      name: 'Laboratório',
    },
    {
      name: 'Biblioteca',
    },
  ];

  for (const localData of locals) {
    const computerLocalCreated = await prisma.computerLocal.create({
      data: localData,
    });

    computerLocalsDatabase.push(computerLocalCreated);
  }

  return computerLocalsDatabase;
}

async function cleanAllDatabase() {
  await cleanDatabase();

  await prisma.role.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.computerLocal.deleteMany({});
}

beforeAll(async () => {
  await cleanAllDatabase();

  await createRoles();
  await createColors();
  await createComputerLocals();
});

afterAll(async () => {
  await cleanAllDatabase();
  await prisma.disconnect();
});
