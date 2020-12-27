import { PrismaClient } from '@prisma/client';

import colors from '~/config/colors';

async function run() {
  const prisma = new PrismaClient();

  const users = [
    {
      name: 'Idaslon Garcia',
      enrollment: '20181104010048',
      email: 'idaslon.g@academico.ifrn.edu.br',
      color: colors.purple,
    },
    {
      name: 'Fellipe Souza',
      enrollment: '20181104010027',
      email: 'z.santos@academico.ifrn.edu.br',
      color: colors.red,
    },
    {
      name: 'NATHAN MARQUES',
      enrollment: '20181104010009',
      email: 'nathan.araujo@academico.ifrn.edu.br',
      color: colors.green,
    },
    {
      name: 'Alceu Nascimento',
      enrollment: '20181104010039',
      email: 'alceu.guilherme@academico.ifrn.edu.br',
      color: colors.blue,
    },
  ];

  const periods = [
    {
      name: 'Manhã',
      initialHour: '07:00',
      endHour: '12:00',
    },
    {
      name: 'Tarde',
      initialHour: '13:00',
      endHour: '18:00',
    },
    {
      name: 'Noite',
      initialHour: '19:00',
      endHour: '22:00',
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

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

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

  for (const room of rooms) {
    await prisma.room.create({
      data: room,
    });
  }
  prisma.disconnect();
}

run();
