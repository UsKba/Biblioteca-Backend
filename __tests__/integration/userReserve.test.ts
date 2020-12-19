import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';
import prisma from '~/prisma';

import { createReserve, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('UserReserve delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete one user from reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user4.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should be able to auto delete from reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user2.id}`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should have delete the correct relation between user and reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    await request(App)
      .delete(`/reserves/${reserve.id}/users/${user4.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const usersOfReserve = await prisma.userReserve.findMany({
      where: {
        reserveId: reserve.id,
      },
    });

    for (const userReserve of usersOfReserve) {
      expect(userReserve.userId !== user4.id).toBeTruthy();
    }

    expect(usersOfReserve.length).toBe(3);
  });

  it('should not be able to delete one user from reserve with invalid `reserveId` or `userId`', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/invalidId/users/invalidId`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete one user from a reserve that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });
    const nonReserveId = reserve.id + 1;

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${nonReserveId}/users/${user4.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete one user from a reserve with `userId` that is not on that reserve', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });
    const user5 = await createUser({ enrollment: '20181104010055' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user5.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should be able to change the leader of reserve if userToDelete was the leader', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user1.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const reserveUpdated = await prisma.reserve.findOne({
      where: { id: reserve.id },
    });

    expect(reserveUpdated?.adminId).toBe(user2.id);
    expect(response.status).toBe(200);
  });

  it('should have correct fields on userReserve delete', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3, user4],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user4.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.reserveId).toBe(reserve.id);
    expect(response.body.userId).toBe(user4.id);
  });
});

describe('UserReserve reserve delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete the reserve when leader is about to auto-delete and if has not less than the min users required', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user1.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const deletedReserve = await prisma.reserve.findOne({
      where: { id: reserve.id },
    });

    expect(deletedReserve).toBe(null);
    expect(response.status).toBe(200);
    expect(response.body.reserveId).toBe(reserve.id);
  });

  it('should be able to delete the reserve when leader is about to delete a member and if has not less than the min users required', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const leaderToken = encodeToken(user1);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user2.id}`)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    const deletedReserve = await prisma.reserve.findOne({
      where: { id: reserve.id },
    });

    expect(deletedReserve).toBe(null);
    expect(response.status).toBe(200);
    expect(response.body.reserveId).toBe(reserve.id);
  });

  it('should be able to delete the reserve when member is about to auto-delete and if has not less than the min users required', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const reserve = await createReserve({
      leader: user1,
      users: [user1, user2, user3],
    });

    const memberToken = encodeToken(user2);

    const response = await request(App)
      .delete(`/reserves/${reserve.id}/users/${user2.id}`)
      .set({
        authorization: `Bearer ${memberToken}`,
      });

    const deletedReserve = await prisma.reserve.findOne({
      where: { id: reserve.id },
    });

    expect(deletedReserve).toBe(null);
    expect(response.status).toBe(200);
    expect(response.body.reserveId).toBe(reserve.id);
  });
});
