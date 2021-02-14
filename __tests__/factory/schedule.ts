import { Schedule, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateScheduleParams {
  periodId: number;
  initialHour?: string;
  endHour?: string;
}

interface CreateScheduleParams extends GenerateScheduleParams {
  adminUser: User;
}

export function generateSchedule(params?: GenerateScheduleParams) {
  return {
    initialHour: '06:00',
    endHour: '07:00',
    ...params,
  };
}

export async function createSchedule(params: CreateScheduleParams) {
  const scheduleData = generateSchedule(params);
  const adminToken = encodeToken(params.adminUser);

  const response = await request(App)
    .post('/schedules')
    .send(scheduleData)
    .set({
      authorization: `Bearer ${adminToken}`,
    });

  return response.body as Schedule;
}
