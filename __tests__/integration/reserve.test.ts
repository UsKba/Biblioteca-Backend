import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser, createRoom, createSchedule, generateDate, createReserve, createPeriod } from '../factory';
import { cleanDatabase } from '../utils';

describe('Reserve Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the one reserve linked with user', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const reserve = await createReserve({ users: [user1, user2, user3] });

    const token = encodeToken(user1);

    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(reserve.id);
  });

  it('should be able index the two reserves linked with user', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();

    const schedule1 = await createSchedule({ periodId: period.id, initialHour: '07:00', endHour: '08:00' });
    const schedule2 = await createSchedule({ periodId: period.id, initialHour: '08:00', endHour: '09:00' });

    const reserve1 = await createReserve({
      users: [user1, user2, user3],
      schedule: schedule1,
      room,
    });

    const reserve2 = await createReserve({
      users: [user1, user2, user3],
      schedule: schedule2,
      room,
    });

    const token = encodeToken(user1);

    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].id).toBe(reserve1.id);
    expect(response.body[1].id).toBe(reserve2.id);
  });

  it('should be able index the two reserves linked with user even if are more reserves created of anothers users', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const room = await createRoom();

    const morningPeriod = await createPeriod({ initialHour: '07:00', endHour: '12:00' });
    const afternoonPeriod = await createPeriod({ initialHour: '13:00', endHour: '18:00' });
    const nightPeriod = await createPeriod({ initialHour: '19:00', endHour: '22:00' });

    const schedule1 = await createSchedule({ periodId: morningPeriod.id, initialHour: '07:00', endHour: '08:00' });
    const schedule2 = await createSchedule({ periodId: afternoonPeriod.id, initialHour: '13:00', endHour: '14:00' });
    const schedule3 = await createSchedule({ periodId: nightPeriod.id, initialHour: '18:00', endHour: '19:00' });

    const reserve1 = await createReserve({
      users: [user1, user2, user3],
      schedule: schedule1,
      room,
    });

    const reserve2 = await createReserve({
      users: [user1, user2, user3],
      schedule: schedule2,
      room,
    });

    await createReserve({ users: [user2, user3, user4], room, schedule: schedule3 });

    const token = encodeToken(user1);
    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].id).toBe(reserve1.id);
    expect(response.body[1].id).toBe(reserve2.id);
  });
});

describe('Reserve Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.room.id).toBe(reserve.roomId);
    expect(response.body.schedule.id).toBe(reserve.scheduleId);
  });

  it('should not be able to create a reserve on a day before of today', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const yesterdayDate = generateDate({ sumDay: -1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...yesterdayDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve on a schedule that does not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id + 1, // ID that not exists
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should be able to create various reserves on the same room on diferents days', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });
    const afterTomorrowDate = generateDate({ sumDay: 4 });

    const tomorrowReserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const afterTomorrowReserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...afterTomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const tomorrowResponse = await request(App)
      .post('/reserves')
      .send(tomorrowReserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    const afterTomorrowResponse = await request(App)
      .post('/reserves')
      .send(afterTomorrowReserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(tomorrowResponse.status).toBe(200);
    expect(afterTomorrowResponse.status).toBe(200);
  });

  it('should not be able to create a reserve if the room not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id + 1,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve if does not have 3 users', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve with the classmateIDs repeated', async () => {
    const user = await createUser({ enrollment: '20181104010022' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user.id, user.id, user.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve if the user does not exists ', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user2.id + 1], // never will exists the next id user of the last user created
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve on the same date, schedule, room', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010039' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response1 = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    const response2 = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(400);
  });

  it('should not be able to create a reserve on weekend', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const now = new Date();
    const weekendMonthDay = now.getUTCDate() + (6 - now.getDay());

    const reserve = {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: weekendMonthDay,

      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
    };

    const token = encodeToken(user1); // Lider do grupo

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
