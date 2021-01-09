import request from 'supertest';

import { removeDateTimezoneOffset, splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';

import App from '~/App';

import { createUser, createReserve, createRoom, createSchedule, createPeriod } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDateList } from '../utils/date';

describe('allReserves index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the all reserves on an specific date', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const [tomorrowDate, afterTomorrowDate] = generateDateList([{ sumDay: 1 }, { sumDay: 2 }]);

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

    const formattedStartDate = `${reserveDate1.getUTCFullYear()}/${reserveDate1.getUTCMonth()}/${reserveDate1.getUTCDate()}`;
    const formattedEndDate = `${reserveDate2.getUTCFullYear()}/${reserveDate2.getUTCMonth()}/${reserveDate2.getUTCDate()}`;

    const response = await request(App).get('/reserves/all').query({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    expect(response.status).toBe(200);
  });

  it('should have correct fields on week reserve index', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const [tomorrowDate, afterTomorrowDate] = generateDateList([{ sumDay: 1 }, { sumDay: 2 }]);

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

    const formattedStartDate = `${reserveDate1.getUTCFullYear()}/${reserveDate1.getUTCMonth()}/${reserveDate1.getUTCDate()}`;
    const formattedEndDate = `${reserveDate2.getUTCFullYear()}/${reserveDate2.getUTCMonth()}/${reserveDate2.getUTCDate()}`;

    const response = await request(App).get('/reserves/all').query({
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });

    const reserveIndexed = response.body[0];
    const reserveAdmin = reserveIndexed.users[0];
    const reserveMember = reserveIndexed.users[1];

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const tempDate = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes);
    const dateISO = removeDateTimezoneOffset(tempDate).toISOString();

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

    expect(reserveAdmin.id).toBe(user1.id);
    expect(reserveAdmin.name).toBe(user1.name);
    expect(reserveAdmin.email).toBe(user1.email);
    expect(reserveAdmin.enrollment).toBe(user1.enrollment);
    expect(reserveAdmin.status).toBe(reserveConfig.userReserve.statusAccepted);
    expect(reserveAdmin).toHaveProperty('color');

    expect(reserveMember.id).toBe(user2.id);
    expect(reserveMember.name).toBe(user2.name);
    expect(reserveMember.email).toBe(user2.email);
    expect(reserveMember.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember).toHaveProperty('color');
  });
});
