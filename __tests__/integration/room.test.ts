import request from 'supertest';

import App from '~/App';

import { generateRoom, createRoom } from '../factory';
import { cleanDatabase } from '../utils';

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

  it('should not be able to create any room with the same initial', async () => {
    const room = await createRoom();

    const response = await request(App).post('/rooms').send({
      initials: room.initials,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to store the room if the available is wrong ', async () => {
    const room = generateRoom({ available: 'a' });
    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(400);
  });
});

describe('Room Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index the 1 room', async () => {
    const room = generateRoom();

    await request(App).post('/rooms').send(room);

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to index the 2 rooms', async () => {
    const room1 = generateRoom({ initials: 'F1-1' });
    const room2 = generateRoom({ initials: 'F1-2' });

    await request(App).post('/rooms').send(room1);
    await request(App).post('/rooms').send(room2);

    const response = await request(App).get('/rooms');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('Room Update', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should not be able to update a room with incorrect id format', async () => {
    const response = await request(App).put(`/rooms/incorrectId`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with id that not exists', async () => {
    const room = await createRoom();
    const nextRoomId = room.id + 1;

    const response = await request(App).put(`/rooms/${nextRoomId}`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should be able to update the `available` of a room', async () => {
    const room = await createRoom();

    const response = await request(App).put(`/rooms/${room.id}`).send({
      available: false,
    });

    expect(response.status).toBe(200);
    expect(response.body.available).toBe(false);
  });

  it('should be able to update the `initials` of a room to another', async () => {
    const room = await createRoom({ initials: 'F1-1' });

    const response = await request(App).put(`/rooms/${room.id}`).send({
      initials: 'F1-2',
    });

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe('F1-2');
  });

  it('should not be able to update the `initials` of a room to another that already exists', async () => {
    await createRoom({ initials: 'F1-1' });
    const room2 = await createRoom({ initials: 'F1-2' });

    const response = await request(App).put(`/rooms/${room2.id}`).send({
      initials: 'F1-1',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update the room if the available is incorrect ', async () => {
    const room = await createRoom();

    const response = await request(App).put(`/rooms/${room.id}`).send({
      available: 'a',
    });

    expect(response.status).toBe(400);
  });
});

describe('Room Delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
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

  it('should be able to delete a room', async () => {
    const room = await createRoom();

    const response = await request(App).delete(`/rooms/${room.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(room.id);
  });
});
