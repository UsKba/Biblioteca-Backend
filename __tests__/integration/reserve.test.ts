import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser, createRoom, createSchedule, generateDate } from '../factory';
import { cleanDatabase } from '../utils';

describe('Reserve Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const schedule = await createSchedule();

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
    expect(response.body.roomId).toBe(reserve.roomId);
    expect(response.body.scheduleId).toBe(reserve.scheduleId);
  });

  it('should not be able to create a reserve if is the before day', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

    const tomorrowDate = generateDate({ sumDay: 1 });
    const afterTomorrowDate = generateDate({ sumDay: 4 });

    const reserve1 = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...tomorrowDate,
    };

    const reserve2 = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...afterTomorrowDate,
    };

    const token = encodeToken(user1); // Lider do grupo

    const response1 = await request(App)
      .post('/reserves')
      .send(reserve1)
      .set({
        authorization: `Bearer ${token}`,
      });

    const response2 = await request(App)
      .post('/reserves')
      .send(reserve2)
      .set({
        authorization: `Bearer ${token}`,
      });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should not be able to create a reserve if the room not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
    const schedule = await createSchedule();

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
