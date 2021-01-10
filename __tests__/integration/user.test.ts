import request from 'supertest';

import userConfig from '~/config/user';

import App from '~/App';

import { generateUserStudent, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('User store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to register an user', async () => {
    const user = generateUserStudent();

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with invalid enrollment', async () => {
    const user = generateUserStudent({
      enrollment: 'invalidEnrollment',
    });

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with duplicated enrollement', async () => {
    const user1 = await createUser();
    const user2 = generateUserStudent({ enrollment: user1.enrollment });

    const response = await request(App).post('/users').send(user2);

    expect(response.status).toBe(400);
  });

  it('should not be able to register an user with the same email', async () => {
    const user1 = await createUser({ email: 'UserEmail@gmail.com' });
    const user2 = generateUserStudent({ email: user1.email });

    const response = await request(App).post('/users').send(user2);

    expect(response.status).toBe(400);
  });

  it('should not be able to register an user with incorrect enrollment format', async () => {
    const user = generateUserStudent({ enrollment: '123' });

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(400);
  });

  it('should have correct fields on user store', async () => {
    const userData = generateUserStudent();

    const response = await request(App).post('/users').send(userData);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.enrollment).toBe(userData.enrollment);

    expect(response.body.role).toBe(userConfig.role.student.slug);
    expect(response.body).toHaveProperty('color');
  });
});

describe('User index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able list 1 user', async () => {
    const user = await createUser();

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].id).toBe(user.id);
  });

  it('should be able list 2 users', async () => {
    const user1 = await createUser({
      enrollment: '20181104010048',
      email: 'userEmail1@gmail.com',
    });
    const user2 = await createUser({
      enrollment: '20181104010049',
      email: 'userEmail2@gmail.com',
    });

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].id).toBe(user1.id);
    expect(response.body[1].id).toBe(user2.id);
  });

  it('should have correct fields on user index', async () => {
    const user = await createUser();

    const response = await request(App).get('/users');
    const userIndexed = response.body[0];

    expect(userIndexed.id).toBe(user.id);
    expect(userIndexed.name).toBe(user.name);
    expect(userIndexed.email).toBe(user.email);
    expect(userIndexed.enrollment).toBe(user.enrollment);

    expect(userIndexed.role).toBe(userConfig.role.student.slug);
    expect(userIndexed).toHaveProperty('color');
  });
});

describe('User Update', () => {
  beforeEach(async () => {
    await cleanDatabase();
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

  it('should not be able to update a email with an invalid one', async () => {
    const { id } = await createUser();

    const response = await request(App).put(`/users/${id}`).send({
      email: 'invalidEmail',
    });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a email to one that already exists', async () => {
    const { id, email } = await createUser();
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

  it('should have correct fields on user update', async () => {
    const user = await createUser({ name: 'Kalon' });

    const response = await request(App).put(`/users/${user.id}`).send({
      name: 'LonKa',
    });

    expect(response.body.id).toBe(user.id);
    expect(response.body.name).toBe('LonKa');
    expect(response.body.email).toBe(user.email);
    expect(response.body.enrollment).toBe(user.enrollment);

    expect(response.body.role).toBe(userConfig.role.student.slug);
    expect(response.body).toHaveProperty('color');
  });
});

describe('User show', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should have correct fields on user show', async () => {
    const user = await createUser({ enrollment: '20181104010048' });

    const response = await request(App).get(`/users/${user.id}`);

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(user.id);
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
    expect(response.body.enrollment).toBe(user.enrollment);

    expect(response.body.role).toBe(userConfig.role.student.slug);
    expect(response.body).toHaveProperty('color');
  });
});
