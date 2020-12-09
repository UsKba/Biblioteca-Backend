import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser, createFriend, createInvite } from '../factory';
import { cleanDatabase } from '../utils';

describe('friend index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index one friend when you send the invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriend({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able index one friend when you receive the invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriend({ user1, user2 });

    const tokenUser2 = encodeToken(user2);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able index two friends', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createFriend({ user1, user2 });
    await createFriend({ user1, user2: user3 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should not be able index friends that you do not have relation', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createFriend({ user1, user2 });

    const tokenUser3 = encodeToken(user3);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser3}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should not be able index one friend when him not accepted the invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createInvite({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should not be able index one friend when you not accepted the invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createInvite({ user1: user2, user2: user1 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should have correct fields on friends indexing', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriend({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    const friendCreated = response.body[0];

    expect(friendCreated.id).toBe(user2.id);
    expect(friendCreated.name).toBe(user2.name);
    expect(friendCreated.email).toBe(user2.email);
    expect(friendCreated.enrollment).toBe(user2.enrollment);
  });
});
