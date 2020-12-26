import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import reserveConfig from '~/config/reserve';

import App from '~/App';

import { createReserve, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('userReserveStatus accept', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to accept partipate of a reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
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

  it('should not be able to accept partipate of a reserve that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const nonReserveId = reserve.id + 1;

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${nonReserveId}/accept`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário e/ou Reserva não encotrados');
  });

  it('should not be able to accept partipate of a reserve that you were not invited', async () => {
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
      .post(`/reserves/${reserve.id}/accept`)
      .set({
        authorization: `Bearer ${nonMemberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário e/ou Reserva não encotrados');
  });

  it('should not be able to accept partipate of a reserve with invalid `reserveId`', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
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

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
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

  it('should not be able to refuse partipate of a reserve that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const nonReserveId = reserve.id + 1;

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .post(`/reserves/${nonReserveId}/refuse`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário e/ou Reserva não encotrados');
  });

  it('should not be able to refuse partipate of a reserve that you were not invited', async () => {
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
      .post(`/reserves/${reserve.id}/refuse`)
      .set({
        authorization: `Bearer ${nonMemberToken}`,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Usuário e/ou Reserva não encotrados');
  });

  it('should not be able to refuse partipate of a reserve with invalid `reserveId`', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3],
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
