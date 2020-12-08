import request from 'supertest';

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
});
