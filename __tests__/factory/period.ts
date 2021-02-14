import { Period, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GeneratePeriodParams {
  name?: string;
}

interface CreatePeriodParams extends GeneratePeriodParams {
  adminUser: User;
}

export function generatePeriod(params?: GeneratePeriodParams) {
  return {
    name: 'Manhã',
    ...params,
  };
}

export async function createPeriod(params: CreatePeriodParams) {
  const { adminUser } = params;
  const periodData = generatePeriod(params);

  const adminToken = encodeToken(adminUser);

  const response = await request(App)
    .post('/periods')
    .send(periodData)
    .set({
      authorization: `Bearer ${adminToken}`,
    });

  return response.body as Period;
}
