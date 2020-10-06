import request from 'supertest';

import App from '~/App';

import { generatePeriod } from '../factory';
import { cleanDatabase } from '../utils';

describe('period store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be to create a period', async () => {
    const periodData = generatePeriod();

    const response = await request(App).post('/periods').send(periodData);

    expect(response.status).toBe(200);
  });

  it('should be to create a period with `endHour` exact of `initialHour` of another', async () => {
    const periodData1 = generatePeriod({
      name: 'Período 1',
      initialHour: '07:00',
      endHour: '12:00',
    });

    const periodData2 = generatePeriod({
      name: 'Período 2',
      initialHour: '12:00',
      endHour: '18:00',
    });

    const response1 = await request(App).post('/periods').send(periodData1);
    const response2 = await request(App).post('/periods').send(periodData2);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should not be able to create a schedule with `endHour` before `initialHour`', async () => {
    const periodData = generatePeriod({
      initialHour: '08:00',
      endHour: '07:00',
    });

    const response = await request(App).post('/periods').send(periodData);

    expect(response.status).toBe(400);
  });

  it('should not be to create a period inside a period interval that already exists', async () => {
    const periodData1 = generatePeriod({
      name: 'Período 1',
      initialHour: '07:00',
      endHour: '12:00',
    });

    const periodData2 = generatePeriod({
      name: 'Período 2',
      initialHour: '08:00',
      endHour: '20:00',
    });

    const response1 = await request(App).post('/periods').send(periodData1);
    const response2 = await request(App).post('/periods').send(periodData2);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(400);
  });

  it('should not be able to create a period with hour greater than 23:59 or smaller than 00:00', async () => {
    const period = generatePeriod({
      initialHour: '-01:00',
      endHour: '24:00',
    });

    const response = await request(App).post('/periods').send(period);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a period without `initialHour` or `endHour`', async () => {
    const response = await request(App).post('/periods').send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to create a period with invalid `initialHour` or `endHour`', async () => {
    const response = await request(App).post('/periods').send({
      initialHour: 'invalidInitalHour',
      endHour: 'invalidEndHour',
    });

    expect(response.status).toBe(400);
  });
});
