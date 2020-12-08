import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import friendConfig from '~/config/friend';

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
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.receiverId).toBe(user2.id);
    expect(response.body.senderId).toBe(user1.id);
  });

  it('should be able to invite 2 different users', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181004010033' });

    const token = encodeToken(user1);

    const response1 = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${token}` });

    const response2 = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user3.enrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    expect(response1.body.senderId).toBe(user1.id);
    expect(response1.body.receiverId).toBe(user2.id);

    expect(response2.body.senderId).toBe(user1.id);
    expect(response2.body.receiverId).toBe(user3.id);
  });

  it('should be able to invite a user with invalid receiverId', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });

    const token = encodeToken(user1);

    const response = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: 'invalidReceiverEnrollment' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to invite a user with receiverId that not exists', async () => {
    const user = await createUser({ enrollment: '20181104010022' });
    const receiverEnrollment = '20181104010023';

    const token = encodeToken(user);

    const response = await request(App)
      .post('/invites')
      .send({ receiverEnrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to invite again a user that already denied ', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);

    const responseInvite = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const tokenUser2 = encodeToken(user2);

    await request(App)
      .delete(`/invites/${responseInvite.body.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    const responseReInvite = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(responseReInvite.status).toBe(200);
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

  it('should not be able to index invites where you are not the receiver', async () => {
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

describe('invite delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete one invite when you are the sender', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const invite = await createInvite({ user1, user2 });
    const tokenUser1 = encodeToken(user1);

    const deleteResponse = await request(App)
      .delete(`/invites/${invite.id}`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.status).toBe(friendConfig.statusDenied);
    expect(deleteResponse.body.id).toBe(invite.id);
  });

  it('should be able to delete one invite when you are the receiver', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const invite = await createInvite({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const deleteResponse = await request(App)
      .delete(`/invites/${invite.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.status).toBe(friendConfig.statusDenied);
    expect(deleteResponse.body.id).toBe(invite.id);
  });

  it('should not be able to delete invite when you are not the sender or the receiver', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const invite = await createInvite({ user1, user2 });

    const tokenUser3 = encodeToken(user3);

    const deleteResponse = await request(App)
      .delete(`/invites/${invite.id}`)
      .set({ authorization: `Bearer ${tokenUser3}` });

    expect(deleteResponse.status).toBe(400);
  });
});

describe('invite pending index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index one pending invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    await createInvite({ user1, user2 });
    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/invites/pending')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index two pending invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    await createInvite({ user1, user2 });
    await createInvite({ user1, user2: user3 });
    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/invites/pending')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should not be able to index one pending invite when you do not have', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });

    const tokenUser = encodeToken(user1);

    const response = await request(App)
      .get('/invites/pending')
      .set({ authorization: `Bearer ${tokenUser}` });

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
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const inviteUpdated = inviteResponse.body;

    const inviteConfirmationResponse = await request(App)
      .post('/invites/confirmation')
      .send({ id: inviteUpdated.id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(inviteResponse.status).toBe(200);
    expect(inviteConfirmationResponse.status).toBe(200);
  });

  it('should delete invite when it is confirmed', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const inviteResponse = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = inviteResponse.body;

    const inviteConfirmationResponse = await request(App)
      .post('/invites/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    const indexResponse = await request(App)
      .get('/invites/pending')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(inviteResponse.status).toBe(200);
    expect(inviteConfirmationResponse.status).toBe(200);

    expect(indexResponse.status).toBe(200);
    expect(indexResponse.body.length).toBe(0);
  });

  it('should not be able to invite a user who already is your friend', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const inviteResponse = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = inviteResponse.body;

    const inviteConfirmationResponse = await request(App)
      .post('/invites/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    const errorInviteResponse = await request(App)
      .post('/invites')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(inviteResponse.status).toBe(200);
    expect(inviteConfirmationResponse.status).toBe(200);
    expect(errorInviteResponse.status).toBe(400);
  });
});
