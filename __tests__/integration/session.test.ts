import request from 'supertest';

import App from '~/App';

import { cleanDatabase } from '../utils';

describe('Session Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to login', async () => {
    const userData = { name: 'Lonlon', enrollment: '20181104010087', email: 'Lonlon@gmail.com' };

    const response = await request(App).post('/sessions').send(userData);

    expect(response.status).toBe(200);
  });

  it('should be able to create user ', async () => {
    const userData = { name: 'Lonlon', enrollment: '20181104010087', email: 'Lonlon@gmail.com' };

    const createUserResponse = await request(App).post('/sessions').send(userData);
    const indexUsersResponse = await request(App).get('/users');

    expect(indexUsersResponse.status).toBe(200);
    expect(createUserResponse.status).toBe(200);

    expect(indexUsersResponse.body.length).toBe(1);
    expect(indexUsersResponse.body[0].name).toBe(userData.name);
    expect(indexUsersResponse.body[0].enrollment).toBe(userData.enrollment);
    expect(indexUsersResponse.body[0].email).toBe(userData.email);
  });

  it('should be able to login user ', async () => {
    const userData = { name: 'Lonlon', enrollment: '20181104010087', email: 'Lonlon@gmail.com' };

    const createUserResponse = await request(App).post('/sessions').send(userData);
    const loginUserResponse = await request(App).post('/sessions').send(userData);
    const indexUsersResponse = await request(App).get('/users');

    expect(indexUsersResponse.status).toBe(200);
    expect(createUserResponse.status).toBe(200);
    expect(loginUserResponse.status).toBe(200);

    expect(indexUsersResponse.body.length).toBe(1);
    expect(indexUsersResponse.body[0].name).toBe(userData.name);
    expect(indexUsersResponse.body[0].enrollment).toBe(userData.enrollment);
    expect(indexUsersResponse.body[0].email).toBe(userData.email);
  });

  it('should not be able to login with invalid data', async () => {
    const invalidData = { name: 1234, enrollment: 'invalid', email: 'invalidEmail' };

    const response = await request(App).post('/sessions').send(invalidData);

    expect(response.status).toBe(400);
  });

  it('should not be able to login without data', async () => {
    const response = await request(App).post('/sessions').send({});

    expect(response.status).toBe(400);
  });
});
