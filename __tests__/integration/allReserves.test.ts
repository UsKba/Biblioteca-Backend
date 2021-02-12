import request from 'supertest';

import { removeDateTimezoneOffset, splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';
import userConfig from '~/config/user';

import App from '~/App';

import { createUser, createReserve, createRoom, createSchedule, createPeriod } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDateList } from '../utils/date';

describe('allReserves index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the all reserves on an specific date', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const reserveMember1 = reserveIndexed.users[1];
    const reserveMember2 = reserveIndexed.users[2];

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const tempDate = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes);
    const dateISO = removeDateTimezoneOffset(tempDate).toISOString();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(reserveIndexed.id).toBe(reserve1.id);
    expect(reserveIndexed.users.length).toBe(3);

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
    expect(reserveAdmin.role).toBe(userConfig.role.student.slug);
    expect(reserveAdmin).toHaveProperty('color');

    expect(reserveMember1.id).toBe(user2.id);
    expect(reserveMember1.name).toBe(user2.name);
    expect(reserveMember1.email).toBe(user2.email);
    expect(reserveMember1.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember1.role).toBe(userConfig.role.student.slug);
    expect(reserveMember1).toHaveProperty('color');

    expect(reserveMember2.id).toBe(user3.id);
    expect(reserveMember2.name).toBe(user3.name);
    expect(reserveMember2.email).toBe(user3.email);
    expect(reserveMember2.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember2.role).toBe(userConfig.role.student.slug);
    expect(reserveMember2).toHaveProperty('color');

    expect(reserveAdmin.color !== reserveMember1.color).toBeTruthy();
    expect(reserveAdmin.color !== reserveMember2.color).toBeTruthy();
    expect(reserveMember1.color !== reserveMember2.color).toBeTruthy();
  });
});
