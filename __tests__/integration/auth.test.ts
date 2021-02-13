import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser, generateUserAdmin, generateUserStudent } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('Login Auth User', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to access private routes', async () => {
    const userData = generateUserStudent();

    const loginResponse = await request(App).post('/login').send(userData);
    const { token } = loginResponse.body;

    const testAuthResponse = await request(App)
      .get('/test/auth')
      .set({ authorization: `Bearer ${token}` });

    expect(loginResponse.status).toBe(200);
    expect(testAuthResponse.status).toBe(200);
  });

  it('should not be able to access private routes with invalid token format', async () => {
    const userData = generateUserStudent();

    const loginResponse = await request(App).post('/login').send(userData);
    const { token } = loginResponse.body;

    const response = await request(App).get('/test/auth').set({ authorization: token });

    expect(response.status).toBe(400);
  });

  it('should not be able to access private routes with invalid token', async () => {
    const response = await request(App).get('/test/auth').set({ authorization: `Bearer invalidToken` });

    expect(response.status).toBe(400);
  });

  it('should not be able to access private routes with a user token that not exists ', async () => {
    const user = await createUser();
    const nonUserId = user.id + 1;

    const token = encodeToken({ id: nonUserId });
    const response = await request(App)
      .get('/test/auth')
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(401);
  });
});

describe('Login Auth User Admin', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to access private routes', async () => {
    const userData = generateUserAdmin();

    const loginResponse = await request(App).post('/login').send(userData);
    const { token } = loginResponse.body;

    const testAuthResponse = await request(App)
      .get('/test/auth/admin')
      .set({ authorization: `Bearer ${token}` });

    expect(loginResponse.status).toBe(200);
    expect(testAuthResponse.status).toBe(200);
  });

  it('should not be able to access private routes with invalid token format', async () => {
    const userData = generateUserAdmin();

    const loginResponse = await request(App).post('/login').send(userData);
    const { token } = loginResponse.body;

    const response = await request(App).get('/test/auth/admin').set({ authorization: token });

    expect(response.status).toBe(400);
  });

  it('should not be able to access private routes with invalid token', async () => {
    const response = await request(App).get('/test/auth/admin').set({ authorization: `Bearer invalidToken` });

    expect(response.status).toBe(400);
  });

  it('should not be able to access private routes with a user token that not exists ', async () => {
    const user = await createUser({ isAdmin: true });
    const nonUserId = user.id + 1;

    const token = encodeToken({ id: nonUserId });
    const response = await request(App)
      .get('/test/auth/admin')
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(401);
  });
});
