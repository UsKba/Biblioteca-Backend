import request from 'supertest';

import App from '~/App';
import prisma from '~/prisma';

import { generateSchedule } from './factory';

describe('Schedule Store', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to create a schedule', async () => {
    const schedule = generateSchedule();

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(200);
    expect(response.body.initialHour).toBe(schedule.initialHour);
    expect(response.body.endHour).toBe(schedule.endHour);
  });
});

describe('Schedule Index', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to index one schedule', async () => {
    const schedule = generateSchedule();

    await request(App).post('/schedules').send(schedule);
    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].initialHour).toBe(schedule.initialHour);
    expect(response.body[0].endHour).toBe(schedule.endHour);
  });

  it('should be able to index many schedules', async () => {
    const schedule1 = generateSchedule();
    const schedule2 = generateSchedule();

    await request(App).post('/schedules').send(schedule1);
    await request(App).post('/schedules').send(schedule2);
    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].initialHour).toBe(schedule1.initialHour);
    expect(response.body[0].endHour).toBe(schedule1.endHour);

    expect(response.body[1].initialHour).toBe(schedule2.initialHour);
    expect(response.body[1].endHour).toBe(schedule2.endHour);
  });
});

describe('Schedule Update', () => {
  beforeEach(async () => {
    await prisma.schedule.deleteMany({});
  });

  it('should be able to update a schedule', async () => {
    const schedule = generateSchedule({ initialHour: '07:00', endHour: '08:00' });

    const storeResponse = await request(App).post('/schedules').send(schedule);

    const { id } = storeResponse.body;

    const updateResponse = await request(App).put(`/schedules/${id}`).send({
      endHour: '09:00',
    });

    expect(updateResponse.body.id).toBe(id);
    expect(updateResponse.body.initialHour).toBe('07:00');
    expect(updateResponse.body.endHour).toBe('09:00');
  });
});
