import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import roomConfig from '~/config/room';

import App from '~/App';

import { generateRoom, createRoom, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('Room Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a room', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = generateRoom();

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/rooms')
      .send(room)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe(room.initials);
  });

  it('should not be able to create other room with the `initials` that already exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const data = {
      initials: room.initials,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/rooms')
      .send(data)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room store', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = generateRoom();

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/rooms')
      .send(room)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.body.initials).toBe(room.initials);
    expect(response.body.status).toBe(roomConfig.disponible);
  });
});

describe('Room Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index the 1 room', async () => {
    const admin = await createUser({ isAdmin: true });
    await createRoom({ adminUser: admin });

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index the 2 rooms', async () => {
    const admin = await createUser({ isAdmin: true });

    await createRoom({ initials: 'F1-1', adminUser: admin });
    await createRoom({ initials: 'F1-2', adminUser: admin });

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should have correct fields on room index', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .get('/rooms')
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    const roomCreated = response.body[0];

    expect(roomCreated.id).toBe(room.id);
    expect(roomCreated.initials).toBe(room.initials);
  });
});

describe('Room Update', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to update a room', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${room.id}`)
      .send({ status: roomConfig.indisponible })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(roomConfig.indisponible);
  });

  it('should not be able to update the `status` of a room to other that is not accepted', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin, initials: 'F1-1' });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${room.id}`)
      .send({ status: -1 })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update the `initials` of a room to another that already exists', async () => {
    const admin = await createUser({ isAdmin: true });

    await createRoom({ adminUser: admin, initials: 'F1-1' });
    const room2 = await createRoom({ adminUser: admin, initials: 'F1-2' });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${room2.id}`)
      .send({ initials: 'F1-1' })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with incorrect id format', async () => {
    const admin = await createUser({ isAdmin: true });
    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/incorrectId`)
      .send({ initials: 'F1-2' })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with invalid `status` format', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin, initials: 'F1-1' });
    const nextRoomId = room.id + 1;

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${nextRoomId}`)
      .send({ status: 'invalidStatus' })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin, initials: 'F1-1' });
    const nextRoomId = room.id + 1;

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${nextRoomId}`)
      .send({ initials: 'F1-2' })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room update', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin, initials: 'F1-1' });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/rooms/${room.id}`)
      .send({ initials: 'F1-2' })
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.body.id).toBe(room.id);
    expect(response.body.initials).toBe('F1-2');
  });
});

describe('Room Delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete a room', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .delete(`/rooms/${room.id}`)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(room.id);
  });

  it('should not be able to delete a room with incorrect id format', async () => {
    const admin = await createUser({ isAdmin: true });
    const adminToken = encodeToken(admin);

    const response = await request(App)
      .delete(`/rooms/incorrectId`)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a room with id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const adminToken = encodeToken(admin);
    const nextRoomId = room.id + 1;

    const response = await request(App)
      .delete(`/rooms/${nextRoomId}`)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room delete', async () => {
    const admin = await createUser({ isAdmin: true });
    const room = await createRoom({ adminUser: admin });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .delete(`/rooms/${room.id}`)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.body.id).toBe(room.id);
  });
});
