import { PrismaClient } from '@prisma/client';

async function run() {
  const prisma = new PrismaClient();

  // console.log('Starting to create data');

  const users = [
    {
      enrollment: '20181104010010',
      name: 'Lonlon',
      email: 'lonlon@gmail.com',
    },
    {
      enrollment: '20181104010011',
      name: 'Zanzan',
      email: 'zanzan@gmail.com',
    },
    {
      enrollment: '20181104010012',
      name: 'Nana',
      email: 'nana@gmail.com',
    },
    {
      enrollment: '20181104010013',
      name: 'Kadu',
      email: 'kadu@gmail.com',
    },
    {
      enrollment: '20181104010014',
      name: 'Alce',
      email: 'alce@gmail.com',
    },
    {
      enrollment: '20181104010015',
      name: 'Cisco',
      email: 'cisco@gmail.com',
    },
    {
      enrollment: '20181104010016',
      name: 'Bubu',
      email: 'bubu@gmail.com',
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
    {
      periodId: 1,
      initialHour: '07:15',
      endHour: '08:00',
    },
    {
      periodId: 1,
      initialHour: '08:00',
      endHour: '09:00',
    },
    {
      periodId: 1,
      initialHour: '09:00',
      endHour: '10:00',
    },
    {
      periodId: 1,
      initialHour: '10:00',
      endHour: '11:00',
    },
    {
      periodId: 1,
      initialHour: '11:00',
      endHour: '12:00',
    },
    {
      periodId: 2,
      initialHour: '13:00',
      endHour: '14:00',
    },
    {
      periodId: 2,
      initialHour: '13:00',
      endHour: '14:00',
    },
    {
      periodId: 2,
      initialHour: '14:00',
      endHour: '15:00',
    },
    {
      periodId: 2,
      initialHour: '15:00',
      endHour: '16:00',
    },
    {
      periodId: 2,
      initialHour: '16:00',
      endHour: '17:00',
    },
    {
      periodId: 2,
      initialHour: '17:00',
      endHour: '18:00',
    },
    {
      periodId: 3,
      initialHour: '19:00',
      endHour: '20:00',
    },
    {
      periodId: 3,
      initialHour: '20:00',
      endHour: '21:00',
    },
    {
      periodId: 3,
      initialHour: '21:00',
      endHour: '22:00',
    },
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
    await prisma.users.create({
      data: user,
    });
  }

  for (const period of periods) {
    await prisma.periods.create({
      data: period,
    });
  }

  for (const schedule of schedules) {
    const { initialHour, endHour, periodId } = schedule;

    await prisma.schedules.create({
      data: {
        initialHour,
        endHour,
        period: { connect: { id: periodId } },
      },
    });
  }

  for (const room of rooms) {
    await prisma.rooms.create({
      data: room,
    });
  }

  prisma.disconnect();
  // console.log('Data created!');
}

run();
