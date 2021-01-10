import userConfig from '~/config/user';

import prisma from '~/prisma';

import { cleanDatabase } from './utils/database';

async function createTags() {
  const tags = [
    {
      name: 'Sala com defeito',
    },
    {
      name: 'Problema no site',
    },
    {
      name: 'Dúvida',
    },
    {
      name: 'Outro',
    },
  ];

  for (const tagData of tags) {
    await prisma.tag.create({
      data: tagData,
    });
  }
}

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

beforeAll(async () => {
  await cleanDatabase();

  await createTags();
  await createRoles();
  await createColors();
});

afterAll(async () => {
  await cleanDatabase();

  await prisma.tag.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.color.deleteMany({});

  await prisma.disconnect();
});
