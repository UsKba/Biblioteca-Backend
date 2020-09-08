import request from 'supertest';

import App from '~/App';
import prisma from '~/prisma';

import { generateUser, createUser } from '../factory';

describe('User store', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to register an user', async () => {
    const user = generateUser();

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with invalid enrollment', async () => {
    const user = generateUser({
      enrollment: 'invalidEnrollment',
    });

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with duplicated enrollement', async () => {
    const user1 = await createUser();
    const user2 = generateUser({ enrollment: user1.enrollment });

    const response = await request(App).post('/users').send(user2);

    expect(response.status).toBe(400);
  });

  it('should not be able to register an user with the same email', async () => {
    const user1 = await createUser({ email: 'UserEmail@gmail.com' });
    const user2 = generateUser({ email: user1.email });

    const response = await request(App).post('/users').send(user2);

    expect(response.status).toBe(400);
  });
});

describe('User index', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able list 1 user', async () => {
    const user = await createUser();

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].id).toBe(user.id);
  });

  it('should be able list 2 users', async () => {
    const user1 = await createUser({ enrollment: '20181104010048', email: 'userEmail1@gmail.com' });
    const user2 = await createUser({ enrollment: '20181104010049', email: 'userEmail2@gmail.com' });

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].id).toBe(user1.id);
    expect(response.body[1].id).toBe(user2.id);
  });
});

describe('User Update', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to update the name of one user', async () => {
    const { id } = await createUser({ name: 'Kalon' });

    const response = await request(App).put(`/users/${id}`).send({
      name: 'LonKa',
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
    expect(response.body.name).toBe('LonKa');
  });

  it('should not be able to update a user with invalid id', async () => {
    const response = await request(App).put('/users/invalidId').send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to update a user with id that not exists', async () => {
    const { id } = await createUser();

    const response = await request(App)
      .put(`/users/${id + 1}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to update a email to one that already exists', async () => {
    const { id, email } = await createUser({ email: 'kalon@gmail.com' });
    const userToUpdate = { email };

    const response = await request(App).put(`/users/${id}`).send(userToUpdate);

    expect(response.status).toBe(400);
  });

  it('should not be able to update the enrollment', async () => {
    const { id } = await createUser({ enrollment: '20181104010048' });

    const response = await request(App).put(`/users/${id}`).send({
      enrollment: '20181104010049',
    });

    expect(response.status).toBe(400);
  });
});

describe('User show', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able show one user', async () => {
    const { id } = await createUser({ enrollment: '20181104010048' });

    const response = await request(App).get(`/users/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.enrollment).toBe('20181104010048');
  });
});
