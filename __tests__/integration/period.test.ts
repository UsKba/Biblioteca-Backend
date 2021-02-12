import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createPeriod, createUser, generatePeriod } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('period store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be to create a period', async () => {
    const admin = await createUser({ isAdmin: true });
    const periodData = generatePeriod();

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/periods')
      .send(periodData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(periodData.name);
  });

  it('should not be to create a period with `initials` that already exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const periodData = generatePeriod();

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/periods')
      .send(periodData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(periodData.name);
  });
});

describe('period index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should have correct fields on period index', async () => {
    const admin = await createUser({ isAdmin: true });
    const period = await createPeriod({ adminUser: admin });

    const response = await request(App).get('/periods');
    const periodCreated = response.body[0];

    expect(periodCreated.id).toBe(period.id);
    expect(periodCreated.name).toBe(period.name);
  });
});
