import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { generateSchedule, createSchedule, createPeriod, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('Schedule Store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create a schedule', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = generateSchedule({ periodId: id });
    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/schedules')
      .send(schedule)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.initialHour).toBe(schedule.initialHour);
    expect(response.body.endHour).toBe(schedule.endHour);
  });

  it('should be to create a schedule with `endHour` exact of `initialHour` of another', async () => {
    const admin = await createUser({ isAdmin: true });
    const period = await createPeriod({ adminUser: admin });

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

    const adminToken = encodeToken(admin);

    const response1 = await request(App)
      .post('/schedules')
      .send(scheduleData1)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    const response2 = await request(App)
      .post('/schedules')
      .send(scheduleData2)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should not be able to create a schedule with `endHour` before `initialHour`', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = generateSchedule({
      periodId: id,
      initialHour: '07:00',
      endHour: '06:00',
    });

    const adminToken = encodeToken(admin);
    const response = await request(App)
      .post('/schedules')
      .send(schedule)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule inside a interval that already exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

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

    const adminToken = encodeToken(admin);

    await request(App)
      .post('/schedules')
      .send(schedule1)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    const response = await request(App)
      .post('/schedules')
      .send(schedule2)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule with hour greater than 23:59 or smaller than 00:00', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = generateSchedule({
      periodId: id,
      initialHour: '-01:00',
      endHour: '24:00',
    });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/schedules')
      .send(schedule)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule without `initialHour`, `endHour` or `periodId`', async () => {
    const admin = await createUser({ isAdmin: true });
    const scheduleData = {};

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/schedules')
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a schedule with invalid `initialHour`, `endHour` or `periodId`', async () => {
    const admin = await createUser({ isAdmin: true });
    const adminToken = encodeToken(admin);

    const scheduleData = {
      periodId: 'invalidPeriod',
      initialHour: 'invalidInitalHour',
      endHour: 'invalidEndHour',
    };

    const response = await request(App)
      .post('/schedules')
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should have correct fields', async () => {
    const admin = await createUser({ isAdmin: true });
    const period = await createPeriod({ adminUser: admin });

    const scheduleData = generateSchedule({ periodId: period.id });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/schedules')
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    const scheduleCreated = response.body;

    expect(scheduleCreated.periodId).toBe(period.id);
    expect(scheduleCreated.initialHour).toBe(scheduleData.initialHour);
    expect(scheduleCreated.endHour).toBe(scheduleData.endHour);
  });
});

describe('Schedule Index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index one schedule', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({ adminUser: admin, periodId: id });

    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    expect(response.body[0].initialHour).toBe(schedule.initialHour);
    expect(response.body[0].endHour).toBe(schedule.endHour);
  });

  it('should be able to index many schedules', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule1 = await createSchedule({ adminUser: admin, periodId: id, initialHour: '06:00', endHour: '07:00' });
    const schedule2 = await createSchedule({ adminUser: admin, periodId: id, initialHour: '07:00', endHour: '08:00' });

    const response = await request(App).get('/schedules');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].initialHour).toBe(schedule1.initialHour);
    expect(response.body[0].endHour).toBe(schedule1.endHour);

    expect(response.body[1].initialHour).toBe(schedule2.initialHour);
    expect(response.body[1].endHour).toBe(schedule2.endHour);
  });

  it('should have correct on schedule index', async () => {
    const admin = await createUser({ isAdmin: true });
    const period = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({ adminUser: admin, periodId: period.id });

    const response = await request(App).get('/schedules');
    const scheduleCreated = response.body[0];

    expect(scheduleCreated.periodId).toBe(period.id);
    expect(scheduleCreated.initialHour).toBe(schedule.initialHour);
    expect(scheduleCreated.endHour).toBe(schedule.endHour);
  });
});

describe('Schedule Update', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to update a schedule', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({
      adminUser: admin,
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const scheduleData = { initialHour: '07:00', endHour: '09:00' };
    const adminToken = encodeToken(admin);

    const updateResponse = await request(App)
      .put(`/schedules/${schedule.id}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(updateResponse.body.id).toBe(schedule.id);
    expect(updateResponse.body.initialHour).toBe('07:00');
    expect(updateResponse.body.endHour).toBe('09:00');
  });

  it('should not be able to update a schedule with invalid id', async () => {
    const admin = await createUser({ isAdmin: true });
    const adminToken = encodeToken(admin);

    const scheduleData = { initialHour: '08:00', endHour: '09:00' };

    const response = await request(App)
      .put(`/schedules/invalidId`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule wihout initialHour or endHour', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({
      adminUser: admin,
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const scheduleData = {};
    const nextScheduleId = schedule.id + 1;

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/schedules/${nextScheduleId}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule with an id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({
      adminUser: admin,
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const scheduleData = { initialHour: '08:00', endHour: '09:00' };

    const nextScheduleId = schedule.id + 1;
    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/schedules/${nextScheduleId}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a schedule with `endHour` before `initialHour`', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({ adminUser: admin, periodId: id });
    const scheduleData = {
      initialHour: '06:00',
      endHour: '05:00',
    };

    const adminToken = encodeToken(admin);

    const updateResponse = await request(App)
      .put(`/schedules/${schedule.id}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(updateResponse.status).toBe(400);
  });

  it('should not be able to update a schedule inside a interval that already exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const { id } = await createPeriod({ adminUser: admin });

    const schedule1 = await createSchedule({
      adminUser: admin,
      periodId: id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    await createSchedule({
      adminUser: admin,
      periodId: id,
      initialHour: '08:00',
      endHour: '09:00',
    });

    const scheduleData = { initialHour: '08:00', endHour: '09:00' };
    const adminToken = encodeToken(admin);

    const updateResponse = await request(App)
      .put(`/schedules/${schedule1.id}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(updateResponse.status).toBe(400);
  });

  it('should have correct fields on schedule update', async () => {
    const admin = await createUser({ isAdmin: true });
    const period = await createPeriod({ adminUser: admin });

    const schedule = await createSchedule({
      adminUser: admin,
      periodId: period.id,
      initialHour: '07:00',
      endHour: '08:00',
    });

    const scheduleData = { initialHour: '07:00', endHour: '09:00' };
    const adminToken = encodeToken(admin);

    const updateResponse = await request(App)
      .put(`/schedules/${schedule.id}`)
      .send(scheduleData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.id).toBe(schedule.id);
    expect(updateResponse.body.periodId).toBe(period.id);
    expect(updateResponse.body.initialHour).toBe('07:00');
    expect(updateResponse.body.endHour).toBe('09:00');
  });
});
