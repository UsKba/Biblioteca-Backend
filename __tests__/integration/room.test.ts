import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';
import prisma from '~/prisma';

import {
  generateRoom,
  generateSchedule,
  generateUser,
  createRoom,
  createSchedule,
  createUser,
  generateDate,
} from '../factory';

describe('User store', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to register an user', async () => {
    const user = generateUser();

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with invalid enrollment', async () => {
    const user = generateUser({
      enrollment: 'asdsaddeféofj',
    });

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(400);
  });
});

describe('User index', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able list all users', async () => {
    const user1 = generateUser();
    const user2 = generateUser({
      enrollment: '20181104010049',
    });

    await request(App).post('/users').send(user1);
    await request(App).post('/users').send(user2);

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('User Update', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to update all users', async () => {
    const user = generateUser({
      name: 'Kalon',
    });

    const changedUser = {
      ...user,
      name: 'LonKa',
    };

    await request(App).post('/users').send(user);

    const response = await request(App).put('/users').send(changedUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});

describe('User show', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able show one user', async () => {
    const user = generateUser();

    const userResponse = await request(App).post('/users').send(user);

    const { id } = userResponse.body;

    const response = await request(App).get(`/users/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.enrollment).toBe('20181104010048');
  });
});

// ====== RESERVE =======

describe('Room Store', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should be able to create a room', async () => {
    const room = generateRoom();

    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe(room.initials);
  });

  it('should not be able to create any room with the same initial', async () => {
    const room = generateRoom();

    await request(App).post('/rooms').send(room);
    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(400);
  });
});

describe('Room Index', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should be able to index the 1 room', async () => {
    const room = generateRoom();

    await request(App).post('/rooms').send(room);

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index the 2 rooms', async () => {
    const room1 = generateRoom({ initials: 'F1-1' });
    const room2 = generateRoom({ initials: 'F1-2' });

    await request(App).post('/rooms').send(room1);
    await request(App).post('/rooms').send(room2);

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('Room Update', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should not be able to update a room with incorrect id format', async () => {
    const response = await request(App).put(`/rooms/incorrectId`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with id that not exists', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;
    const nextRoomId = Number(id) + 1;

    const response = await request(App).put(`/rooms/${nextRoomId}`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should be able to update the `available` of a room', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      available: false,
    });

    expect(response.status).toBe(200);
    expect(response.body.available).toBe(false);
  });

  it('should be able to update the `initials` of a room to another', async () => {
    const room = generateRoom({ initials: 'F1-1' });

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      initials: 'F1-2',
    });

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe('F1-2');
  });

  it('should not be able to update the `initials` of a room to another that already exists', async () => {
    const room1 = generateRoom({ initials: 'F1-1' });
    const room2 = generateRoom({ initials: 'F1-2' });

    await request(App).post('/rooms').send(room1);
    const storeResponse = await request(App).post('/rooms').send(room2);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      initials: 'F1-1',
    });

    expect(response.status).toBe(400);
  });
});

describe('Room Delete', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should not be able to delete a room with incorrect id format', async () => {
    const response = await request(App).delete(`/rooms/incorrectId`);

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a room with id that not exists', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;
    const nextRoomId = Number(id) + 1;

    const response = await request(App).delete(`/rooms/${nextRoomId}`);

    expect(response.status).toBe(400);
  });

  it('should be able to delete a room', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).delete(`/rooms/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
  });
});

// ====== SCHEDULE =======

describe('Schedule Store', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to create a schedule', async () => {
    const schedule = generateSchedule();

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(200);
    expect(response.body.initialHour).toBe(schedule.initialHour);
    expect(response.body.endHour).toBe(schedule.endHour);
  });

  it('should not be able to create a schedule with `endHour` before `initialHour`', async () => {
    const schedule = generateSchedule({
      initialHour: '07:00',
      endHour: '06:00',
    });

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule inside a interval that already exists', async () => {
    const schedule1 = generateSchedule({
      initialHour: '07:00',
      endHour: '08:00',
    });

    const schedule2 = generateSchedule({
      initialHour: '07:30',
      endHour: '08:30',
    });

    await request(App).post('/schedules').send(schedule1);
    const response = await request(App).post('/schedules').send(schedule2);

    expect(response.status).toBe(400);
  });
});

describe('Schedule Index', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to index one schedule', async () => {
    const schedule = generateSchedule();

    await request(App).post('/schedules').send(schedule);
    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].initialHour).toBe(schedule.initialHour);
    expect(response.body[0].endHour).toBe(schedule.endHour);
  });

  it('should be able to index many schedules', async () => {
    const schedule1 = generateSchedule({ initialHour: '06:00', endHour: '07:00' });
    const schedule2 = generateSchedule({ initialHour: '07:00', endHour: '08:00' });

    await request(App).post('/schedules').send(schedule1);
    await request(App).post('/schedules').send(schedule2);
    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].initialHour).toBe(schedule1.initialHour);
    expect(response.body[0].endHour).toBe(schedule1.endHour);

    expect(response.body[1].initialHour).toBe(schedule2.initialHour);
    expect(response.body[1].endHour).toBe(schedule2.endHour);
  });
});

describe('Schedule Update', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to update a schedule', async () => {
    const schedule = generateSchedule({ initialHour: '07:00', endHour: '08:00' });

    const storeResponse = await request(App).post('/schedules').send(schedule);

    const { id } = storeResponse.body;

    const updateResponse = await request(App).put(`/schedules/${id}`).send({
      initialHour: '07:00',
      endHour: '09:00',
    });

    expect(updateResponse.body.id).toBe(id);
    expect(updateResponse.body.initialHour).toBe('07:00');
    expect(updateResponse.body.endHour).toBe('09:00');
  });

  it('should not be able to update a schedule with an id that not exists', async () => {
    const response = await request(App).put('/schedules/1').send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule with `endHour` before `initialHour`', async () => {
    const schedule = generateSchedule();

    const response = await request(App).post('/schedules').send(schedule);

    const { id } = response.body;

    const updateResponse = await request(App).put(`/schedules/${id}`).send({
      initialHour: '06:00',
      endHour: '05:00',
    });

    expect(updateResponse.status).toBe(400);
  });

  it('should not be able to update a schedule inside a interval that already exists', async () => {
    const schedule1 = generateSchedule({
      initialHour: '07:00',
      endHour: '08:00',
    });

    const schedule2 = generateSchedule({
      initialHour: '08:00',
      endHour: '09:00',
    });

    await request(App).post('/schedules').send(schedule2);
    const response = await request(App).post('/schedules').send(schedule1);

    const { id } = response.body;

    const update = await request(App).put(`/schedules/${id}`).send({
      initialHour: '8:00',
      endHour: '09:00',
    });

    expect(update.status).toBe(400);
  });
});

// ====== RESERVE =======

describe('Reserve Store', () => {
  beforeEach(async () => {
    await prisma.userReserve.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.reserve.deleteMany({});

    await prisma.room.deleteMany({});
    await prisma.schedule.deleteMany({});
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
    const afterTomorrowDate = generateDate({ sumDay: 2 });

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

  it('should not be able to create 2 or more reserves on the same room at the same time ', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181104010098' });

    const room = await createRoom();
    const schedule = await createSchedule();

    const now = new Date();
    const weekendMonthDay = now.getUTCDate() + (6 - now.getDay());

    const weekendDate = new Date(now.getFullYear(), now.getMonth(), weekendMonthDay);

    const reserve = {
      roomId: room.id,
      scheduleId: schedule.id,
      classmatesIDs: [user1.id, user2.id, user3.id],
      ...weekendDate,
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
