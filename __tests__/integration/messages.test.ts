import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import userConfig from '~/config/user';

import App from '~/App';

import { createTag, createUser, generateMessage } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('messages store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able create a message', async () => {
    const userSender = await createUser();
    const userReceiver = await createUser({ isAdmin: true });

    const message = generateMessage({
      senderId: userSender.id,
      receiverId: userReceiver.id,
    });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able create a message with sender that not exists', async () => {
    const userSender = await createUser();
    const userReceiver = await createUser({ isAdmin: true });

    const newLocal = userSender.id + 2;
    const nonUserSenderId = newLocal; // userReceiver is the next

    const message = generateMessage({
      senderId: nonUserSenderId,
      receiverId: userReceiver.id,
    });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able create a message with receiver that not exists', async () => {
    const userSender = await createUser();
    const userReceiver = await createUser({ isAdmin: true });

    const nonUserReceiverId = userReceiver.id + 1;

    const message = generateMessage({
      senderId: userSender.id,
      receiverId: nonUserReceiverId,
    });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able create a message with sender that is not the logged user', async () => {
    const userSender = await createUser({ enrollment: '20181104010011' });
    const userReceiver = await createUser({ isAdmin: true });

    const otherUser = await createUser({ enrollment: '20181104010022' });

    const message = generateMessage({
      senderId: userSender.id,
      receiverId: userReceiver.id,
    });

    const otherUserToken = encodeToken(otherUser);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${otherUserToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able create a message with receiver that is not an admin', async () => {
    const userSender = await createUser({ enrollment: '20181104010011' });
    const userReceiver = await createUser({ enrollment: '20181104010022' });

    const message = generateMessage({
      senderId: userSender.id,
      receiverId: userReceiver.id,
    });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able create a message with invalid data', async () => {
    const userSender = await createUser();
    await createUser({ isAdmin: true });

    const message = {
      senderId: 'invalidId',
      receiverId: 'invalidId',
      content: 2,
      subject: 1,
      tags: 'invalidArray',
    };

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able create a message without data', async () => {
    const userSender = await createUser();
    const userReceiver = await createUser({ isAdmin: true });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send({})
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(400);
  });

  // not finished
  it('should have correct fields on message store', async () => {
    const userSender = await createUser();
    const userReceiver = await createUser({ isAdmin: true });

    const message = generateMessage({
      senderId: userSender.id,
      receiverId: userReceiver.id,
    });

    const senderToken = encodeToken(userSender);

    const response = await request(App)
      .post('/messages')
      .send(message)
      .set({
        authorization: `Bearer ${senderToken}`,
      });

    expect(response.status).toBe(200);

    expect(response.body.subject).toBe(message.subject);
    expect(response.body.content).toBe(message.content);
    // expect(response.body.tags.length).toBe(message.tags.length); // not finished

    expect(response.body.sender.id).toBe(userSender.id);
    expect(response.body.sender.name).toBe(userSender.name);
    expect(response.body.sender.email).toBe(userSender.email);
    expect(response.body.sender.enrollment).toBe(userSender.enrollment);
    expect(response.body.sender.role).toBe(userConfig.role.student.slug);
    expect(response.body.sender).toHaveProperty('color');

    expect(response.body.receiver.id).toBe(userReceiver.id);
    expect(response.body.receiver.name).toBe(userReceiver.name);
    expect(response.body.receiver.email).toBe(userReceiver.email);
    expect(response.body.receiver.enrollment).toBe(userReceiver.enrollment);
    expect(response.body.receiver.role).toBe(userConfig.role.admin.slug);
    expect(response.body.receiver).toHaveProperty('color');
  });
});
