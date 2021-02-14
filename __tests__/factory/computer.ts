import { Computer, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateComputerParams {
  identification?: string;
  local?: string;
  status?: number;
}

interface CreateComputerParams extends GenerateComputerParams {
  adminUser: User;
}

export function generateComputer(params?: GenerateComputerParams) {
  return {
    identification: 'F1-1',
    local: 'Sala B2',
    status: 1,
    ...params,
  };
}

export async function createComputer(params: CreateComputerParams) {
  const { adminUser } = params;
  const computerData = generateComputer(params);

  const adminToken = encodeToken(adminUser);

  const response = await request(App)
    .post('/computers')
    .send(computerData)
    .set({ authorization: `Bearer ${adminToken}` });

  return response.body as Computer;
}
