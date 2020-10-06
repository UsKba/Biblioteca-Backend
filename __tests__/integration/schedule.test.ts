import request from 'supertest';

import App from '~/App';

import { generateSchedule, createSchedule, createPeriod } from '../factory';
import { cleanDatabase } from '../utils';

describe('Schedule Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a schedule', async () => {
    const { id } = await createPeriod();
    const schedule = generateSchedule({ periodId: id });

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(200);
    expect(response.body.initialHour).toBe(schedule.initialHour);
    expect(response.body.endHour).toBe(schedule.endHour);
  });

  it('should be to create a schedule with `endHour` exact of `initialHour` of another', async () => {
    const period = await createPeriod({
      initialHour: '07:00',
      endHour: '12:00',
    });

    const scheduleData1 = generateSchedule({
      periodId: period.id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const scheduleData2 = generateSchedule({
      periodId: period.id,
      initialHour: '08:00',
      endHour: '09:00',
    });

    const response1 = await request(App).post('/schedules').send(scheduleData1);
    const response2 = await request(App).post('/schedules').send(scheduleData2);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should not be able to create a schedule with `endHour` before `initialHour`', async () => {
    const { id } = await createPeriod();

    const schedule = generateSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '06:00',
    });

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule inside a interval that already exists', async () => {
    const { id } = await createPeriod();

    const schedule1 = generateSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const schedule2 = generateSchedule({
      periodId: id,
      initialHour: '07:30',
      endHour: '08:30',
    });

    await request(App).post('/schedules').send(schedule1);
    const response = await request(App).post('/schedules').send(schedule2);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule with hour greater than 23:59 or smaller than 00:00', async () => {
    const { id } = await createPeriod();

    const schedule = generateSchedule({
      periodId: id,
      initialHour: '-01:00',
      endHour: '24:00',
    });

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule with `initialHour` or `endHour` outside of period interval ', async () => {
    const { id } = await createPeriod({
      initialHour: '07:00',
      endHour: '12:00',
    });

    const schedule = generateSchedule({
      periodId: id,
      initialHour: '06:00',
      endHour: '13:00',
    });

    const response = await request(App).post('/schedules').send(schedule);

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule without `initialHour`, `endHour` or `periodId`', async () => {
    const response = await request(App).post('/schedules').send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule with invalid `initialHour`, `endHour` or `periodId`', async () => {
    const response = await request(App).post('/schedules').send({
      periodId: 'invalidPeriod',
      initialHour: 'invalidInitalHour',
      endHour: 'invalidEndHour',
    });

    expect(response.status).toBe(400);
  });
});

describe('Schedule Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index one schedule', async () => {
    const { id } = await createPeriod();
    const schedule = await createSchedule({ periodId: id });

    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].initialHour).toBe(schedule.initialHour);
    expect(response.body[0].endHour).toBe(schedule.endHour);
  });

  it('should be able to index many schedules', async () => {
    const { id } = await createPeriod();

    const schedule1 = await createSchedule({ periodId: id, initialHour: '06:00', endHour: '07:00' });
    const schedule2 = await createSchedule({ periodId: id, initialHour: '07:00', endHour: '08:00' });

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
    await cleanDatabase();
  });

  it('should be able to update a schedule', async () => {
    const { id } = await createPeriod();

    const schedule = await createSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const updateResponse = await request(App).put(`/schedules/${schedule.id}`).send({
      initialHour: '07:00',
      endHour: '09:00',
    });

    expect(updateResponse.body.id).toBe(schedule.id);
    expect(updateResponse.body.initialHour).toBe('07:00');
    expect(updateResponse.body.endHour).toBe('09:00');
  });

  it('should not be able to update a schedule with invalid id', async () => {
    const response = await request(App).put(`/schedules/invalidId`).send({ initialHour: '08:00', endHour: '09:00' });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule wihout initialHour or endHour', async () => {
    const { id } = await createPeriod();

    const schedule = await createSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const nextScheduleId = schedule.id + 1;

    const response = await request(App).put(`/schedules/${nextScheduleId}`).send({});

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule with an id that not exists', async () => {
    const { id } = await createPeriod();

    const schedule = await createSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const nextScheduleId = schedule.id + 1;

    const response = await request(App)
      .put(`/schedules/${nextScheduleId}`)
      .send({ initialHour: '08:00', endHour: '09:00' });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule with `endHour` before `initialHour`', async () => {
    const { id } = await createPeriod();
    const schedule = await createSchedule({ periodId: id });

    const updateResponse = await request(App).put(`/schedules/${schedule.id}`).send({
      initialHour: '06:00',
      endHour: '05:00',
    });

    expect(updateResponse.status).toBe(400);
  });

  it('should not be able to update a schedule inside a interval that already exists', async () => {
    const { id } = await createPeriod();

    const schedule1 = await createSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    await createSchedule({
      periodId: id,
      initialHour: '08:00',
      endHour: '09:00',
    });

    const update = await request(App).put(`/schedules/${schedule1.id}`).send({
      initialHour: '08:00',
      endHour: '09:00',
    });

    expect(update.status).toBe(400);
  });
});
