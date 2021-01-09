import { Color, PrismaClient } from '@prisma/client';

import { getRandomItem } from '../src/app/utils/array';

const prisma = new PrismaClient();

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

async function createUsers(colors: Color[]) {
  const users = [
    {
      name: 'Idaslon Garcia',
      enrollment: '20181104010048',
      email: 'idaslon.g@academico.ifrn.edu.br',
    },
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
    {
      name: 'Alceu Nascimento',
      enrollment: '20181104010039',
      email: 'alceu.guilherme@academico.ifrn.edu.br',
    },
  ];

  for (const userData of users) {
    const randomColor = getRandomItem(colors);

    await prisma.user.create({
      data: {
        ...userData,
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
      data: room,
    });
  }
}

async function run() {
  const colors = await createColors();
  await createUsers(colors);

  await createPeriodsAndSchedules();
  await createRooms();

  await prisma.disconnect();
}

run();
