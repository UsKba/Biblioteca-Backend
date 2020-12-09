import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser } from '../factory';
import { cleanDatabase } from '../utils';

describe('Seach Index (validate data)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should not be able to find a user with invalid enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ enrollment: 'invalidEnrollment' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to get an empty list with with name that not exists', async () => {
    const user = await createUser({ name: 'Lolon', enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ name: 'Kadu' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should be able to get an empty list with with email that not exists', async () => {
    const user = await createUser({ email: 'lonlon@gmail.com', enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ email: 'kadu@gmail.com' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should be able to get an empty list with with enrollment that not exists', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ enrollment: '20181104010022' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should have correct fields on search', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ enrollment: user.enrollment })
      .set({ authorization: `Bearer ${token}` });

    const userIndexed = response.body[0];

    expect(userIndexed.id).toBe(user.id);
    expect(userIndexed.name).toBe(user.name);
    expect(userIndexed.email).toBe(user.email);
    expect(userIndexed.enrollment).toBe(user.enrollment);
  });
});

describe('Seach Index (equals)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to find a user by enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ enrollment: user.enrollment })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to find a user by name', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ name: user.name })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to find a user by email', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ email: user.email })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});

describe('Seach Index (part of data)', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to find a user by part of enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ enrollment: '201811' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to find a user by part of name', async () => {
    const user = await createUser({ name: 'Lonlonka', enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ name: 'lon' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should be able to find a user by email', async () => {
    const user = await createUser({ email: 'lonlonka@gmail.com', enrollment: '20181104010011' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search`)
      .query({ email: 'lonka' })
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});
