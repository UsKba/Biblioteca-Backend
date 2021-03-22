import { Color, PrismaClient, Role } from '@prisma/client';

import computerConfig from '~/config/computer';

import { getRandomItem } from '../src/app/utils/array';
import roomConfig from '../src/config/room';
import userConfig from '../src/config/user';

const prisma = new PrismaClient();

// Look __tests__/setup.ts
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

// Look __tests__/setup.ts
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

// async function createTags() {
//   const tags = [
//     {
//       name: 'Sala com defeito',
//     },
//     {
//       name: 'Problema no site',
//     },
//     {
//       name: 'Dúvida',
//     },
//     {
//       name: 'Outro',
//     },
//   ];

//   for (const tagData of tags) {
//     await prisma.tag.create({
//       data: tagData,
//     });
//   }
// }

async function createUsers(roles: Role[], colors: Color[]) {
  const adminUsers = [
    {
      name: 'Fellipe Souza',
      enrollment: '20181104010027',
      email: 'z.santos@academico.ifrn.edu.br',
    },
    {
      name: 'NATHAN MARQUES',
      enrollment: '20181104010009',
      email: 'nathan.araujo@academico.ifrn.edu.br',
    },
  ];

  const studentUsers = [
    {
      name: 'Idaslon Garcia',
      enrollment: '20181104010048',
      email: 'idaslon.g@academico.ifrn.edu.br',
    },
    {
      name: 'Carlos Couto',
      enrollment: '20181104010087',
      email: 'castro.carlos@academico.ifrn.edu.br',
    },

    {
      name: 'Alceu Nascimento',
      enrollment: '20181104010039',
      email: 'alceu.guilherme@academico.ifrn.edu.br',
    },
  ];

  const adminRole = roles.find((role) => role.slug === userConfig.role.admin.slug) as Role;
  const studentRole = roles.find((role) => role.slug === userConfig.role.student.slug) as Role;

  for (const userData of adminUsers) {
    const randomColor = getRandomItem(colors);

    await prisma.user.create({
      data: {
        ...userData,
        role: { connect: { id: adminRole.id } },
        color: { connect: { id: randomColor.id } },
      },
    });
  }

  for (const userData of studentUsers) {
    const randomColor = getRandomItem(colors);

    await prisma.user.create({
      data: {
        ...userData,
        role: { connect: { id: studentRole.id } },
        color: { connect: { id: randomColor.id } },
      },
    });
  }
}

async function createPeriodsAndSchedules() {
  const periods = [
    {
      name: 'Manhã',
    },
    {
      name: 'Tarde',
    },
    {
      name: 'Noite',
    },
  ];

  const schedules = [
    [
      {
        initialHour: '07:15',
        endHour: '08:00',
      },
      {
        initialHour: '08:00',
        endHour: '09:00',
      },
      {
        initialHour: '09:00',
        endHour: '10:00',
      },
      {
        initialHour: '10:00',
        endHour: '11:00',
      },
      {
        initialHour: '11:00',
        endHour: '12:00',
      },
    ],
    [
      {
        initialHour: '13:00',
        endHour: '14:00',
      },
      {
        initialHour: '14:00',
        endHour: '15:00',
      },
      {
        initialHour: '15:00',
        endHour: '16:00',
      },
      {
        initialHour: '16:00',
        endHour: '17:00',
      },
      {
        initialHour: '17:00',
        endHour: '18:00',
      },
    ],
    [
      {
        initialHour: '19:00',
        endHour: '20:00',
      },
      {
        initialHour: '20:00',
        endHour: '21:00',
      },
      {
        initialHour: '21:00',
        endHour: '22:00',
      },
    ],
  ];

  for (let i = 0; i < periods.length; i += 1) {
    const periodData = periods[i];

    const period = await prisma.period.create({
      data: periodData,
    });

    const targetSchedulesLength = schedules[i]?.length || 0;

    for (let j = 0; j < targetSchedulesLength; j += 1) {
      const { initialHour, endHour } = schedules[i][j];

      await prisma.schedule.create({
        data: {
          initialHour,
          endHour,
          period: { connect: { id: period.id } },
        },
      });
    }
  }
}

async function createRooms() {
  const rooms = [
    {
      initials: 'F1-3',
    },
    {
      initials: 'F1-4',
    },
    {
      initials: 'F1-5',
    },
    {
      initials: 'F1-6',
    },
  ];

  for (const room of rooms) {
    await prisma.room.create({
      data: {
        ...room,
        status: roomConfig.disponible,
      },
    });
  }
}

async function createComputerLocalsAndComputers() {
  const laboratoryLocal = await prisma.computerLocal.create({
    data: { name: 'Laboratório' },
  });

  const libraryLocal = await prisma.computerLocal.create({
    data: { name: 'Biblioteca' },
  });

  const laboratoryComputers = [
    {
      identification: '01',
      status: computerConfig.disponible,
    },
    {
      identification: '02',
      status: computerConfig.disponible,
    },
    {
      identification: '03',
      status: computerConfig.disponible,
    },
    {
      identification: '04',
      status: computerConfig.disponible,
    },
    {
      identification: '05',
      status: computerConfig.disponible,
    },
    {
      identification: '06',
      status: computerConfig.disponible,
    },
    {
      identification: '07',
      status: computerConfig.disponible,
    },
    {
      identification: '08',
      status: computerConfig.disponible,
    },
  ];

  const libraryComputers = [
    {
      identification: '01',
      status: computerConfig.disponible,
    },
    {
      identification: '02',
      status: computerConfig.disponible,
    },
    {
      identification: '03',
      status: computerConfig.disponible,
    },
    {
      identification: '04',
      status: computerConfig.disponible,
    },
  ];

  for (const laboratoryComputer of laboratoryComputers) {
    await prisma.computer.create({
      data: {
        ...laboratoryComputer,
        local: { connect: { id: laboratoryLocal.id } },
      },
    });
  }

  for (const libraryComputer of libraryComputers) {
    await prisma.computer.create({
      data: {
        ...libraryComputer,
        local: { connect: { id: libraryLocal.id } },
      },
    });
  }
}

async function run() {
  // await createTags();

  const roles = await createRoles();
  const colors = await createColors();

  await createUsers(roles, colors);

  await createPeriodsAndSchedules();
  await createRooms();

  await createComputerLocalsAndComputers();

  await prisma.disconnect();
}

run();
