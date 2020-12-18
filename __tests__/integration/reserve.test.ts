import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';
import { removeDateTimezoneOffset, splitSingleDate } from '~/app/utils/date';

import App from '~/App';
import prisma from '~/prisma';

import { createUser, createRoom, createSchedule, generateDate, createReserve, createPeriod } from '../factory';
import { cleanDatabase } from '../utils';

describe('Reserve Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the one reserve linked with user', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({ leader: user1, users: [user1, user2, user3] });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      leader: user1,
      users: [user1, user2, user3],
      schedule: schedule1,
      room,
    });

    const reserve2 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      schedule: schedule2,
      room,
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      leader: user1,
      users: [user1, user2, user3],
      schedule: schedule1,
      room,
    });

    const reserve2 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      schedule: schedule2,
      room,
    });

    await createReserve({
      leader: user1,
      users: [user2, user3, user4],
      room,
      schedule: schedule3,
    });

    const leaderToken = encodeToken(user1);
    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].id).toBe(reserve1.id);
    expect(response.body[1].id).toBe(reserve2.id);
  });

  it('should have correct fields on reserve index', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = await createReserve({
      name: 'Trabalho de Portugues',
      date: tomorrowDate,
      period,
      room,
      schedule,
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .get('/reserves')
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const reserveCreated = response.body[0];

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const tempDate = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes);
    const dateISO = removeDateTimezoneOffset(tempDate).toISOString();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(reserveCreated.id).toBe(reserve.id);

    expect(reserveCreated.name).toBe(reserve.name);
    expect(reserveCreated.date).toBe(dateISO);
    expect(reserveCreated.adminId).toBe(user1.id);

    expect(reserveCreated.room.id).toBe(room.id);
    expect(reserveCreated.room.initials).toBe(room.initials);

    expect(reserveCreated.schedule.id).toBe(schedule.id);
    expect(reserveCreated.schedule.initialHour).toBe(schedule.initialHour);
    expect(reserveCreated.schedule.endHour).toBe(schedule.endHour);
    expect(reserveCreated.schedule.periodId).toBe(schedule.periodId);

    expect(reserveCreated.users[0]).toHaveProperty('id');
    expect(reserveCreated.users[0]).toHaveProperty('enrollment');
    expect(reserveCreated.users[0]).toHaveProperty('email');
    expect(reserveCreated.users[0]).toHaveProperty('name');
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
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.room.id).toBe(reserve.roomId);
    expect(response.body.schedule.id).toBe(reserve.scheduleId);
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
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id + 1, // ID that not exists
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
    const afterTomorrowDate = generateDate({ sumDay: 2 });

    const tomorrowReserve = {
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };
    const afterTomorrowReserve = {
      name: 'Trabalho de portugues2',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...afterTomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const tomorrowResponse = await request(App)
      .post('/reserves')
      .send(tomorrowReserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const afterTomorrowResponse = await request(App)
      .post('/reserves')
      .send(afterTomorrowReserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      name: 'Trabalho de portugues',
      roomId: room.id + 1,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      classmatesEnrollments: [user1.enrollment, user2.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      classmatesEnrollments: [user.enrollment, user.enrollment, user.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      classmatesEnrollments: [user1.enrollment, user2.enrollment, '20181104010044'], // never will exists the next id user of the last user created
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response1 = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const response2 = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
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
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve if the logged user is not on classmatesEnrollments', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user2.enrollment, user3.enrollment, user4.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on reserve store', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom();
    const period = await createPeriod();
    const schedule = await createSchedule({ periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const tempDate = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes);
    const dateISO = removeDateTimezoneOffset(tempDate).toISOString();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');

    expect(response.body.name).toBe('Trabalho de portugues');
    expect(response.body.date).toBe(dateISO);
    expect(response.body.adminId).toBe(user1.id);

    expect(response.body.room.id).toBe(room.id);
    expect(response.body.room.initials).toBe(room.initials);

    expect(response.body.schedule.id).toBe(schedule.id);
    expect(response.body.schedule.initialHour).toBe(schedule.initialHour);
    expect(response.body.schedule.endHour).toBe(schedule.endHour);
    expect(response.body.schedule.periodId).toBe(schedule.periodId);

    expect(response.body.users[0]).toHaveProperty('id');
    expect(response.body.users[0]).toHaveProperty('enrollment');
    expect(response.body.users[0]).toHaveProperty('email');
    expect(response.body.users[0]).toHaveProperty('name');
  });
});

describe('Reserve Delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should have deleted the userReserve relations', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const usersOfReserve = await prisma.userReserve.findMany({
      where: {
        Reserve: { id: reserve.id },
      },
    });

    expect(usersOfReserve.length).toBe(0);
  });

  it('should not be able to delete a reserve with id that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });
    const nonReserveId = reserve.id + 1;

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${nonReserveId}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a reserve if you are one that reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const nonMemberToken = encodeToken(user4);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${nonMemberToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a reserve if you are not the leader', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a reserve with invalid id', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/invalidId`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should be able to delete a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const reserveDeleted = response.body;

    expect(reserveDeleted.id).toBe(reserve.id);
  });
});
