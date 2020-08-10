import request from 'supertest';

import App from '~/App';
import prisma from '~/prisma';

import { generateRoom } from './factory';

describe('Room Store', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should be able to create a room', async () => {
    const room = generateRoom();

    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe(room.initials);
  });

  it('should not be able to create any room with the same initial', async () => {
    const room = generateRoom();

    await request(App).post('/rooms').send(room);
    const response = await request(App).post('/rooms').send(room);

    expect(response.status).toBe(400);
  });
});

describe('Room Index', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
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
    await prisma.room.deleteMany({});
  });

  it('should not be able to update a room with incorrect id format', async () => {
    const response = await request(App).put(`/rooms/incorrectId`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a room with id that not exists', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;
    const nextRoomId = Number(id) + 1;

    const response = await request(App).put(`/rooms/${nextRoomId}`).send({
      available: false,
    });

    expect(response.status).toBe(400);
  });

  it('should be able to update the `available` of a room', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      available: false,
    });

    expect(response.status).toBe(200);
    expect(response.body.available).toBe(false);
  });

  it('should be able to update the `initials` of a room to another', async () => {
    const room = generateRoom({ initials: 'F1-1' });

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      initials: 'F1-2',
    });

    expect(response.status).toBe(200);
    expect(response.body.initials).toBe('F1-2');
  });

  it('should not be able to update the `initials` of a room to another that already exists', async () => {
    const room1 = generateRoom({ initials: 'F1-1' });
    const room2 = generateRoom({ initials: 'F1-2' });

    await request(App).post('/rooms').send(room1);
    const storeResponse = await request(App).post('/rooms').send(room2);

    const { id } = storeResponse.body;

    const response = await request(App).put(`/rooms/${id}`).send({
      initials: 'F1-1',
    });

    expect(response.status).toBe(400);
  });
});

describe('Room Delete', () => {
  beforeEach(async () => {
    await prisma.room.deleteMany({});
  });

  it('should not be able to delete a room with incorrect id format', async () => {
    const response = await request(App).delete(`/rooms/incorrectId`);

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a room with id that not exists', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;
    const nextRoomId = Number(id) + 1;

    const response = await request(App).delete(`/rooms/${nextRoomId}`);

    expect(response.status).toBe(400);
  });

  it('should be able to delete a room', async () => {
    const room = generateRoom();

    const storeResponse = await request(App).post('/rooms').send(room);

    const { id } = storeResponse.body;

    const response = await request(App).delete(`/rooms/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
  });
});
