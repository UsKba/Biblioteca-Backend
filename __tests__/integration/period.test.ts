import request from 'supertest';

import App from '~/App';

import { createPeriod, generatePeriod } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('period store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be to create a period', async () => {
    const periodData = generatePeriod();

    const response = await request(App).post('/periods').send(periodData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(periodData.name);
  });

  it('should not be to create a period with `initials` that already exists', async () => {
    const periodData = generatePeriod();

    const response = await request(App).post('/periods').send(periodData);

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
    const period = await createPeriod();

    const response = await request(App).get('/periods');
    const periodCreated = response.body[0];

    expect(periodCreated.id).toBe(period.id);
    expect(periodCreated.name).toBe(period.name);
  });
});
