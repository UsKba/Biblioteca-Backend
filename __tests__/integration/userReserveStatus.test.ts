import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import reserveConfig from '~/config/reserve';

import App from '~/App';
import prisma from '~/prisma';

import { createPeriod, createReserve, createRoom, createSchedule, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDate } from '../utils/date';

describe('userReserveStatus accept', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to accept partipate of a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(200);

    expect(response.body.userId).toBe(user2.id);
    expect(response.body.reserveId).toBe(reserve.id);
    expect(response.body.status).toBe(reserveConfig.userReserve.statusAccepted);
  });

  it('should not be able to accept partipate of a reserve that is already finished', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const oldReserveDate = generateDate({ sumDay: -1 });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
      date: oldReserveDate,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Você está atrasado para fazer isso');
  });

  it('should not be able to accept partipate of a reserve that you arealdy accepted', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response1 = await request(App)
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    const response2 = await request(App)
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(400);

    expect(response2.body.error).toBe('O usuário já está participando participando da reserva');
  });

  it('should not be able to accept partipate of a reserve that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const nonReserveId = reserve.id + 1;

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${nonReserveId}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Reserva não encontrada');
  });

  it('should not be able to accept partipate of a reserve that you were not invited', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const nonMemberToken = encodeToken(user4);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${nonMemberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário não pertence a reserva');
  });

  it('should not be able to accept partipate of a reserve with invalid `reserveId`', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/invalidReserveId/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('O id da reserva precisa ser um número');
  });
});

describe('userReserveStatus refuse', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to refuse partipate of a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(200);

    expect(response.body.userId).toBe(user2.id);
    expect(response.body.reserveId).toBe(reserve.id);
    expect(response.body.status).toBe(reserveConfig.userReserve.statusRefused);
  });

  it('should not be able to refuse partipate of a reserve that is already finished', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const oldReserveDate = generateDate({ sumDay: -1 });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
      date: oldReserveDate,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Você está atrasado para fazer isso');
  });

  it('should not be able to refuse partipate of a reserve that you arealdy refused', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response1 = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    const response2 = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(400);

    expect(response2.body.error).toBe('O usuário já não faz parte dessa reserva');
  });

  it('should not be able to refuse partipate of a reserve that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const nonReserveId = reserve.id + 1;

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${nonReserveId}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Reserva não encontrada');
  });

  it('should not be able to refuse partipate of a reserve that were not invited', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const nonMemberToken = encodeToken(user4);

    const response = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${nonMemberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário não pertence a reserva');
  });

  it('should not be able to refuse partipate of a reserve with invalid `reserveId`', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/invalidReserveId/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('O id da reserva precisa ser um número');
  });
});

describe('userReserveStatus refuse, reserve index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should not index the reserves that you refused', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const refuseResponse = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    const indexReservesResponse = await request(App)
      .get(`/reserves`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(refuseResponse.status).toBe(200);
    expect(indexReservesResponse.status).toBe(200);

    expect(indexReservesResponse.body.length).toBe(0);
  });

  it('should not be indexed the user who refused the reserve when other member index this reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
      room,
      schedule,
    });

    const member2Token = encodeToken(user2);
    const member3Token = encodeToken(user3);

    const refuseResponse = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${member2Token}`,
      });

    const indexReservesResponse = await request(App)
      .get(`/reserves`)
      .set({
        authorization: `Bearer ${member3Token}`,
      });

    expect(refuseResponse.status).toBe(200);
    expect(indexReservesResponse.status).toBe(200);

    expect(indexReservesResponse.body[0].users.length).toBe(3);

    expect(indexReservesResponse.body[0].users[0].id).toBe(user1.id);
    expect(indexReservesResponse.body[0].users[1].id).toBe(user3.id);
    expect(indexReservesResponse.body[0].users[2].id).toBe(user4.id);
  });

  it('should delete reserve if the count of users that not refused is less than the minimum required', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const admin = await createUser({ isAdmin: true });

    const room = await createRoom({ adminUser: admin });
    const period = await createPeriod({ adminUser: admin });
    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
      room,
      schedule,
    });

    const memberToken = encodeToken(user2);

    const refuseResponse = await request(App)
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    const reseves = await prisma.reserve.findMany({
      where: {
        userReserve: { some: { userId: user2.id } },
      },
    });

    expect(refuseResponse.status).toBe(200);
    expect(reseves.length).toBe(0);
  });
});
