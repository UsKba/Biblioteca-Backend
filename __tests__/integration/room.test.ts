import request from 'supertest';

import roomConfig from '~/config/room';

import App from '~/App';

import { generateRoom, createRoom } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('Room Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a room', async () => {
    const room = generateRoom();

    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe(room.initials);
  });

  it('should not be able to create other room with the `initials` that already exists', async () => {
    const room = await createRoom();

    const response = await request(App).post('/rooms').send({
      initials: room.initials,
    });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room store', async () => {
    const room = generateRoom();

    const response = await request(App).post('/rooms').send(room);

    expect(response.body.initials).toBe(room.initials);
    expect(response.body.status).toBe(roomConfig.disponible);
  });
});

describe('Room Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index the 1 room', async () => {
    await createRoom();

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index the 2 rooms', async () => {
    await createRoom({ initials: 'F1-1' });
    await createRoom({ initials: 'F1-2' });

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should have correct fields on room index', async () => {
    const room = await createRoom();

    const response = await request(App).get('/rooms');
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
    const room = await createRoom();

    const response = await request(App).put(`/rooms/${room.id}`).send({
      status: roomConfig.indisponible,
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(roomConfig.indisponible);
  });

  it('should not be able to update the `status` of a room to other that is not accepted', async () => {
    const room = await createRoom({ initials: 'F1-1' });

    const response = await request(App).put(`/rooms/${room.id}`).send({
      status: -1,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update the `initials` of a room to another that already exists', async () => {
    await createRoom({ initials: 'F1-1' });

    const room2 = await createRoom({ initials: 'F1-2' });

    const response = await request(App).put(`/rooms/${room2.id}`).send({
      initials: 'F1-1',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with incorrect id format', async () => {
    const response = await request(App).put(`/rooms/incorrectId`).send({
      initials: 'F1-2',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with invalid `status` format', async () => {
    const room = await createRoom({ initials: 'F1-1' });
    const nextRoomId = room.id + 1;

    const response = await request(App).put(`/rooms/${nextRoomId}`).send({
      status: 'invalidStatus',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with id that not exists', async () => {
    const room = await createRoom({ initials: 'F1-1' });
    const nextRoomId = room.id + 1;

    const response = await request(App).put(`/rooms/${nextRoomId}`).send({
      initials: 'F1-2',
    });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room update', async () => {
    const room = await createRoom({ initials: 'F1-1' });

    const response = await request(App).put(`/rooms/${room.id}`).send({
      initials: 'F1-2',
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
    const room = await createRoom();

    const response = await request(App).delete(`/rooms/${room.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(room.id);
  });

  it('should not be able to delete a room with incorrect id format', async () => {
    const response = await request(App).delete(`/rooms/incorrectId`);

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a room with id that not exists', async () => {
    const room = await createRoom();
    const nextRoomId = room.id + 1;

    const response = await request(App).delete(`/rooms/${nextRoomId}`);

    expect(response.status).toBe(400);
  });

  it('should have correct fields on room delete', async () => {
    const room = await createRoom();

    const response = await request(App).delete(`/rooms/${room.id}`);

    expect(response.body.id).toBe(room.id);
  });
});
