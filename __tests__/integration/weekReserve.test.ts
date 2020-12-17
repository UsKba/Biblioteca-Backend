import request from 'supertest';

import { splitSingleDate } from '~/app/utils/date';

import App from '~/App';

import { createUser, createReserve, generateDate, createRoom, createSchedule, createPeriod } from '../factory';
import { cleanDatabase } from '../utils';

describe('weekReser index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the all reserves on an specific date', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });
    const afterTomorrowDate = generateDate({ sumDay: 2 });

    const reserve1 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      date: tomorrowDate,
      room,
      schedule,
    });

    const reserve2 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      date: afterTomorrowDate,
      room,
      schedule,
    });

    const reserveDate1 = new Date(reserve1.date);
    const reserveDate2 = new Date(reserve2.date);

    const formattedStartDate = `${reserveDate1.getUTCDate()}/${reserveDate1.getUTCMonth()}/${reserveDate1.getUTCFullYear()}`;
    const formattedEndDate = `${reserveDate2.getUTCDate()}/${reserveDate2.getUTCMonth()}/${reserveDate2.getUTCFullYear()}`;

    const response = await request(App).get('/reserves/week').query({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    expect(response.status).toBe(200);
  });

  it('should be able index the all reserves on an specific date', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });
    const afterTomorrowDate = generateDate({ sumDay: 2 });

    const reserve1 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      date: tomorrowDate,
      room,
      schedule,
    });

    const reserve2 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      date: afterTomorrowDate,
      room,
      schedule,
    });

    const reserveDate1 = new Date(reserve1.date);
    const reserveDate2 = new Date(reserve2.date);

    const formattedStartDate = `${reserveDate1.getUTCDate()}/${reserveDate1.getUTCMonth()}/${reserveDate1.getUTCFullYear()}`;
    const formattedEndDate = `${reserveDate2.getUTCDate()}/${reserveDate2.getUTCMonth()}/${reserveDate2.getUTCFullYear()}`;

    const response = await request(App).get('/reserves/week').query({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    const reserveIndexed = response.body[0];

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const dateISO = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes).toISOString();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(reserveIndexed.id).toBe(reserve1.id);

    expect(reserveIndexed.name).toBe(reserve1.name);
    expect(reserveIndexed.date).toBe(dateISO);
    expect(reserveIndexed.adminId).toBe(user1.id);

    expect(reserveIndexed.room.id).toBe(room.id);
    expect(reserveIndexed.room.initials).toBe(room.initials);

    expect(reserveIndexed.schedule.id).toBe(schedule.id);
    expect(reserveIndexed.schedule.initialHour).toBe(schedule.initialHour);
    expect(reserveIndexed.schedule.endHour).toBe(schedule.endHour);
    expect(reserveIndexed.schedule.periodId).toBe(schedule.periodId);

    expect(reserveIndexed.users[0]).toHaveProperty('id');
    expect(reserveIndexed.users[0]).toHaveProperty('enrollment');
    expect(reserveIndexed.users[0]).toHaveProperty('email');
    expect(reserveIndexed.users[0]).toHaveProperty('name');
  });
});
