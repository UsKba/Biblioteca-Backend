import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser, createFriend, createFriendRequest } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('friend index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able index one friend when you send the friendRequest', async () => {
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

  it('should be able index one friend when you receive the friendRequest', async () => {
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

  it('should not be able index one friend when him not accepted the friendRequest', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriendRequest({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should not be able index one friend when you not accepted the friendRequest', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriendRequest({ user1: user2, user2: user1 });

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
    expect(friendCreated).toHaveProperty('color');
  });
});

describe('friend delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete a friend', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    const friend = await createFriend({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .delete(`/friends/${friend.id}`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(friend.id);
    expect(response.body.userId1).toBe(friend.userId1);
    expect(response.body.userId2).toBe(friend.userId2);
  });

  it('should not be able to delete a friend that not exists', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    const friend = await createFriend({ user1, user2 });
    const nonFriendId = friend.id + 1;

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .delete(`/friends/${nonFriendId}`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Amigo não encontrado');
  });

  it('should not be able to delete a friend with invalid id', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .delete(`/friends/invalidId`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('O id precisa ser um número');
  });
});
