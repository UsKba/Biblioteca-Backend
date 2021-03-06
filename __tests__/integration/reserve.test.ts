import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';
import { removeDateTimezoneOffset, splitSingleDate } from '~/app/utils/date';

import reserveConfig from '~/config/reserve';
import roomConfig from '~/config/room';
import userConfig from '~/config/user';

import App from '~/App';
import prisma from '~/prisma';

import { createUser, createRoom, createSchedule, createReserve, createPeriod } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDate, generateDateList } from '../utils/date';

describe('Reserve Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the one reserve linked with user', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });
    const reserve = await createReserve({ leader: user1, users: [user1, user2, user3], room, schedule });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });

    const schedule1 = await createSchedule({
      adminUser: admin,
      periodId: period.id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const schedule2 = await createSchedule({
      adminUser: admin,
      periodId: period.id,
      initialHour: '08:00',
      endHour: '09:00',
    });

    const reserve1 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule: schedule1,
    });

    const reserve2 = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule: schedule2,
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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const room = await createRoom({ adminUser: admin });

    const morningPeriod = await createPeriod({ adminUser: admin, name: 'Morning' });
    const afternoonPeriod = await createPeriod({ adminUser: admin, name: 'Afternoon' });
    const nightPeriod = await createPeriod({ adminUser: admin, name: 'Night' });

    const schedule1 = await createSchedule({
      adminUser: admin,
      periodId: morningPeriod.id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const schedule2 = await createSchedule({
      adminUser: admin,
      periodId: afternoonPeriod.id,
      initialHour: '13:00',
      endHour: '14:00',
    });

    const schedule3 = await createSchedule({
      adminUser: admin,
      periodId: nightPeriod.id,
      initialHour: '18:00',
      endHour: '19:00',
    });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = await createReserve({
      name: 'Trabalho de Portugues',
      date: tomorrowDate,
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

    const reserveIndexed = response.body[0];
    const reserveAdmin = reserveIndexed.users[0];
    const reserveMember1 = reserveIndexed.users[1];
    const reserveMember2 = reserveIndexed.users[2];

    const [hours, minutes] = splitSingleDate(schedule.initialHour);
    const tempDate = new Date(tomorrowDate.year, tomorrowDate.month, tomorrowDate.day, hours, minutes);
    const dateISO = removeDateTimezoneOffset(tempDate).toISOString();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(reserveIndexed.id).toBe(reserve.id);

    expect(reserveIndexed.name).toBe(reserve.name);
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
    expect(reserveMember1.enrollment).toBe(user2.enrollment);
    expect(reserveMember1.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember1.role).toBe(userConfig.role.student.slug);
    expect(reserveMember1).toHaveProperty('color');

    expect(reserveMember2.id).toBe(user3.id);
    expect(reserveMember2.name).toBe(user3.name);
    expect(reserveMember2.email).toBe(user3.email);
    expect(reserveMember2.enrollment).toBe(user3.enrollment);
    expect(reserveMember2.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember2.role).toBe(userConfig.role.student.slug);
    expect(reserveMember2).toHaveProperty('color');

    expect(reserveAdmin.color !== reserveMember1.color).toBeTruthy();
    expect(reserveAdmin.color !== reserveMember2.color).toBeTruthy();
    expect(reserveMember1.color !== reserveMember2.color).toBeTruthy();
  });
});

describe('Reserve Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a reserve', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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

  it('should be able to create a reserve without the logged user be on classmates if its the admin', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      name: 'Trabalho de portugues',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should be able to create various reserves on the same room on diferents days', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const [tomorrowDate, afterTomorrowDate] = generateDateList([{ sumDay: 1 }, { sumDay: 2 }]);

    const tomorrowReserve = {
      name: 'Group of English',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const afterTomorrowReserve = {
      name: 'Group of English2',
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...afterTomorrowDate,
    };

    const leaderToken = encodeToken(user1);

    const tomorrowReserveResponse = await request(App)
      .post('/reserves')
      .send(tomorrowReserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const afterTomorrowReserveResponse = await request(App)
      .post('/reserves')
      .send(afterTomorrowReserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(tomorrowReserveResponse.status).toBe(200);
    expect(afterTomorrowReserveResponse.status).toBe(200);
  });

  it('should not be able to create a reserve on a schedule that does not exists', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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

  it('should not be able to create a reserve if the room not exists', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });
    const user = await createUser({ enrollment: '20181104010011' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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

  it('should not be able to create a reserve on a room that is indisponible', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const tomorrowDate = generateDate({ sumDay: 1 });

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesEnrollments: [user1.enrollment, user2.enrollment, user3.enrollment],
      ...tomorrowDate,
    };

    const adminToken = encodeToken(admin);
    const leaderToken = encodeToken(user1);

    await request(App)
      .put(`/rooms/${room.id}`)
      .send({ status: roomConfig.indisponible })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    const response = await request(App)
      .post('/reserves')
      .send(reserve)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a reserve if the logged user is not on classmatesEnrollments', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

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

    const reserveAdmin = response.body.users[0];
    const reserveMember1 = response.body.users[1];
    const reserveMember2 = response.body.users[2];

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
    expect(reserveMember1.enrollment).toBe(user2.enrollment);
    expect(reserveMember1.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember1.role).toBe(userConfig.role.student.slug);
    expect(reserveMember1).toHaveProperty('color');

    expect(reserveMember2.id).toBe(user3.id);
    expect(reserveMember2.name).toBe(user3.name);
    expect(reserveMember2.email).toBe(user3.email);
    expect(reserveMember2.enrollment).toBe(user3.enrollment);
    expect(reserveMember2.status).toBe(reserveConfig.userReserve.statusPending);
    expect(reserveMember2.role).toBe(userConfig.role.student.slug);
    expect(reserveMember2).toHaveProperty('color');

    expect(reserveAdmin.color !== reserveMember1.color).toBeTruthy();
    expect(reserveAdmin.color !== reserveMember2.color).toBeTruthy();
    expect(reserveMember1.color !== reserveMember2.color).toBeTruthy();
  });
});

describe('Reserve Delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete a reserve', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const leaderToken = encodeToken(user1);

    await request(App)
      .delete(`/reserves/${reserve.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const usersOfReserve = await prisma.userReserve.findMany({
      where: {
        reserve: { id: reserve.id },
      },
    });

    expect(usersOfReserve.length).toBe(0);
  });

  it('should not be able to delete a reserve with id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
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
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/invalidId`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on resert delete', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
    });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
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

describe('Reserve Index (old reserves - that already past)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index the one reserve', async () => {
    const admin = await createUser({ isAdmin: true });

    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const oldReserveDate = generateDate({ sumDay: -1 });

    await createReserve({
      schedule,
      room,
      leader: user1,
      users: [user1, user2, user3],
      date: oldReserveDate,
    });

    const reserve = await createReserve({
      schedule,
      room,
      leader: user1,
      users: [user1, user2, user3],
    });

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
});
