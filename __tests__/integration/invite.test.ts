import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createInvite, createUser } from '../factory';
import { cleanDatabase } from '../utils';

describe('invite store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to invite a user', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const token = encodeToken(user1);

    const response = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.recipientId).toBe(user2.id);
    expect(response.body.userId).toBe(user1.id);
  });

  it('should be able to invite 2 different users', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });

    const user2 = await createUser({ enrollment: '20181104010033' });
    const user3 = await createUser({ enrollment: '20181004010034' });

    const token = encodeToken(user1);

    const response1 = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${token}` });

    const response2 = await request(App)
      .post('/invites')
      .send({ recipientId: user3.id })
      .set({ authorization: `Bearer ${token}` });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    expect(response1.body.userId).toBe(user1.id);
    expect(response1.body.recipientId).toBe(user2.id);

    expect(response2.body.userId).toBe(user1.id);
    expect(response2.body.recipientId).toBe(user3.id);
  });

  it('should be able to invite a user with invalid recipientId', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });

    const token = encodeToken(user1);

    const response = await request(App)
      .post('/invites')
      .send({ recipientId: 'invalidRecipientId' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to invite a user with recipientId that not exists', async () => {
    const user = await createUser({ enrollment: '20181104010022' });
    const recipientId = user.id + 1;

    const token = encodeToken(user);

    const response = await request(App)
      .post('/invites')
      .send({ recipientId })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to invite the same user two times', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const token = encodeToken(user1);

    const response1 = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${token}` });

    const response2 = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${token}` });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(400);
  });
});

describe('invite index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index one invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    await createInvite({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const response = await request(App)
      .get('/invites')
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index two invites', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createInvite({ user1, user2 });
    await createInvite({ user1: user3, user2 });

    const tokenUser2 = encodeToken(user2);

    const response = await request(App)
      .get('/invites')
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should not be able to index invites where you are not the recipient', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createInvite({ user1, user2 });
    await createInvite({ user1: user3, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/invites')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
});

describe('invite confirmation store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to confirm invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const inviteResponse = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = inviteResponse.body;

    const inviteConfirmationResponse = await request(App)
      .post('/invites/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(inviteResponse.status).toBe(200);
    expect(inviteConfirmationResponse.status).toBe(200);
  });

  it('should not be able to invite a user who already is your friend', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const inviteResponse = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = inviteResponse.body;

    const inviteConfirmationResponse = await request(App)
      .post('/invites/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    const errorInviteResponse = await request(App)
      .post('/invites')
      .send({ recipientId: user2.id })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(inviteResponse.status).toBe(200);
    expect(inviteConfirmationResponse.status).toBe(200);
    expect(errorInviteResponse.status).toBe(400);
  });
});
