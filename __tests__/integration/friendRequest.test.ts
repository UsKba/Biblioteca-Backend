import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import friendConfig from '~/config/friend';

import App from '~/App';

import { createFriendRequest, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('friendRequest store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to make a friendRequest with a user', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const token = encodeToken(user1);

    const response = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.receiver.id).toBe(user2.id);
    expect(response.body.sender.id).toBe(user1.id);
  });

  it('should be able to make a friendRequest with 2 different users', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181004010033' });

    const token = encodeToken(user1);

    const response1 = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${token}` });

    const response2 = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user3.enrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    expect(response1.body.sender.id).toBe(user1.id);
    expect(response1.body.receiver.id).toBe(user2.id);

    expect(response2.body.sender.id).toBe(user1.id);
    expect(response2.body.receiver.id).toBe(user3.id);
  });

  it('should be able to make a friendRequest with a user with invalid receiverId', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });

    const token = encodeToken(user1);

    const response = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: 'invalidReceiverEnrollment' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to make a friendRequest with a user with receiverId that not exists', async () => {
    const user = await createUser({ enrollment: '20181104010022' });
    const receiverEnrollment = '20181104010023';

    const token = encodeToken(user);

    const response = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to make a friendRequest with again a user that already denied', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);

    const responseFriendRequest = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const tokenUser2 = encodeToken(user2);

    await request(App)
      .delete(`/friends/request/${responseFriendRequest.body.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    const responseReFriendRequest = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(responseReFriendRequest.status).toBe(200);
  });

  it('should not be able to make a friendRequest with yourself', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });

    const tokenUser1 = encodeToken(user1);

    const responseFriendRequest = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user1.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(responseFriendRequest.status).toBe(400);
  });

  it('should have correct fields on friendRequest store ', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const friendRequestCreated = response.body;

    expect(friendRequestCreated).toHaveProperty('id');
    expect(friendRequestCreated).toHaveProperty('status');

    expect(friendRequestCreated.sender.id).toBe(user1.id);
    expect(friendRequestCreated.sender.name).toBe(user1.name);
    expect(friendRequestCreated.sender.email).toBe(user1.email);
    expect(friendRequestCreated.sender.enrollment).toBe(user1.enrollment);

    expect(friendRequestCreated.receiver.id).toBe(user2.id);
    expect(friendRequestCreated.receiver.name).toBe(user2.name);
    expect(friendRequestCreated.receiver.email).toBe(user2.email);
    expect(friendRequestCreated.receiver.enrollment).toBe(user2.enrollment);
  });
});

describe('friendRequest index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index one friendRequest sent', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    await createFriendRequest({ user1, user2 });
    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.sent.length).toBe(1);
    expect(response.body.received.length).toBe(0);
  });

  it('should be able to index one friendRequest received', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    await createFriendRequest({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const response = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(response.status).toBe(200);
    expect(response.body.sent.length).toBe(0);
    expect(response.body.received.length).toBe(1);
  });

  it('should not be able to index friendRequests where you are not the receiver or the sender', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });
    const user4 = await createUser({ enrollment: '20181104010044' });

    await createFriendRequest({ user1: user2, user2: user3 });
    await createFriendRequest({ user1: user3, user2: user4 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(response.status).toBe(200);
    expect(response.body.sent.length).toBe(0);
    expect(response.body.received.length).toBe(0);
  });

  it('should have correct fields on friendRequest sent', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriendRequest({ user1, user2 });

    const tokenUser1 = encodeToken(user1);

    const response = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser1}` });

    const friendRequestCreated = response.body.sent[0];

    expect(friendRequestCreated).toHaveProperty('id');
    expect(friendRequestCreated).toHaveProperty('status');

    expect(friendRequestCreated.sender.id).toBe(user1.id);
    expect(friendRequestCreated.sender.name).toBe(user1.name);
    expect(friendRequestCreated.sender.email).toBe(user1.email);
    expect(friendRequestCreated.sender.enrollment).toBe(user1.enrollment);

    expect(friendRequestCreated.receiver.id).toBe(user2.id);
    expect(friendRequestCreated.receiver.name).toBe(user2.name);
    expect(friendRequestCreated.receiver.email).toBe(user2.email);
    expect(friendRequestCreated.receiver.enrollment).toBe(user2.enrollment);
  });

  it('should have correct fields on friendRequest received', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });

    await createFriendRequest({ user1, user2 });

    const tokenUser2 = encodeToken(user2);

    const response = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser2}` });

    const friendRequestCreated = response.body.received[0];

    expect(friendRequestCreated).toHaveProperty('id');
    expect(friendRequestCreated).toHaveProperty('status');

    expect(friendRequestCreated.sender.id).toBe(user1.id);
    expect(friendRequestCreated.sender.name).toBe(user1.name);
    expect(friendRequestCreated.sender.email).toBe(user1.email);
    expect(friendRequestCreated.sender.enrollment).toBe(user1.enrollment);

    expect(friendRequestCreated.receiver.id).toBe(user2.id);
    expect(friendRequestCreated.receiver.name).toBe(user2.name);
    expect(friendRequestCreated.receiver.email).toBe(user2.email);
    expect(friendRequestCreated.receiver.enrollment).toBe(user2.enrollment);
  });
});

describe('friendRequest delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete one friendRequest when you are the sender', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });
    const tokenUser1 = encodeToken(user1);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.status).toBe(friendConfig.statusDenied);
    expect(deleteResponse.body.id).toBe(friendRequest.id);
  });

  it('should be able to delete one friendRequest when you are the receiver', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.status).toBe(friendConfig.statusDenied);
    expect(deleteResponse.body.id).toBe(friendRequest.id);
  });

  it('should not be able to delete friendRequest when you are not the sender or the receiver', async () => {
    const user1 = await createUser({ enrollment: '20181104010011' });
    const user2 = await createUser({ enrollment: '20181104010022' });
    const user3 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });

    const tokenUser3 = encodeToken(user3);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser3}` });

    expect(deleteResponse.status).toBe(400);
  });

  it('should have correct fields on friendRequest delete', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    const friendRequestDeleted = deleteResponse.body;

    expect(friendRequestDeleted.id).toBe(friendRequest.id);
  });
});

describe('friendRequest index after delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should not list the user when you cancel the friend request that you sent', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });
    const tokenUser1 = encodeToken(user1);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser1}` });

    const indexResponse = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(deleteResponse.status).toBe(200);
    expect(indexResponse.body.sent.length).toBe(0);
  });

  it('should not list the user that already denied the friend request', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    const indexResponse = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(deleteResponse.status).toBe(200);
    expect(indexResponse.body.sent.length).toBe(0);
  });

  it('should not list the user when you deny the friend request', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const friendRequest = await createFriendRequest({ user1, user2 });
    const tokenUser2 = encodeToken(user2);

    const deleteResponse = await request(App)
      .delete(`/friends/request/${friendRequest.id}`)
      .set({ authorization: `Bearer ${tokenUser2}` });

    const indexResponse = await request(App)
      .get('/friends/request')
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(deleteResponse.status).toBe(200);
    expect(indexResponse.body.received.length).toBe(0);
  });
});

describe('friendRequest confirmation', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to confirm friendRequest', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const friendRequestResponse = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const friendRequestUpdated = friendRequestResponse.body;

    const friendRequestConfirmationResponse = await request(App)
      .post('/friends/request/confirmation')
      .send({ id: friendRequestUpdated.id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(friendRequestResponse.status).toBe(200);
    expect(friendRequestConfirmationResponse.status).toBe(200);
  });

  it('should delete friendRequest when it is confirmed', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const friendRequestResponse = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = friendRequestResponse.body;

    const friendRequestConfirmationResponse = await request(App)
      .post('/friends/request/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    const indexResponse = await request(App)
      .get('/friends/request')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(friendRequestResponse.status).toBe(200);
    expect(friendRequestConfirmationResponse.status).toBe(200);

    expect(indexResponse.status).toBe(200);
    expect(indexResponse.body.sent.length).toBe(0);
    expect(indexResponse.body.received.length).toBe(0);
  });

  it('should not be able to friendRequest a user who already is your friend', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const friendRequestResponse = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const { id } = friendRequestResponse.body;

    const friendRequestConfirmationResponse = await request(App)
      .post('/friends/request/confirmation')
      .send({ id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    const errorFriendRequestResponse = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    expect(friendRequestResponse.status).toBe(200);
    expect(friendRequestConfirmationResponse.status).toBe(200);
    expect(errorFriendRequestResponse.status).toBe(400);
  });

  it('should have correct fields on friendRequest confirmation', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const tokenUser1 = encodeToken(user1);
    const tokenUser2 = encodeToken(user2);

    const friendRequestResponse = await request(App)
      .post('/friends/request')
      .send({ receiverEnrollment: user2.enrollment })
      .set({ authorization: `Bearer ${tokenUser1}` });

    const friendRequest = friendRequestResponse.body;

    const friendRequestConfirmationResponse = await request(App)
      .post('/friends/request/confirmation')
      .send({ id: friendRequest.id })
      .set({ authorization: `Bearer ${tokenUser2}` });

    expect(friendRequestConfirmationResponse.body).toHaveProperty('id');
    expect(friendRequestConfirmationResponse.body.userId1).toBe(friendRequest.sender.id);
    expect(friendRequestConfirmationResponse.body.userId2).toBe(friendRequest.receiver.id);
  });
});
