import { Computer, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateaComputerParams {
  adminUser: User;
  identification?: string;
  local?: string;
  status?: number;
}

export function generateComputer(params?: GenerateaComputerParams) {
  return {
    identification: 'F1-1',
    local: 'Sala B2',
    status: 1,
    ...params,
  };
}

export async function createComputer(params: GenerateaComputerParams) {
  const computerData = generateComputer(params);

  const adminToken = encodeToken(params.adminUser);

  const response = await request(App)
    .post('/computers')
    .send(computerData)
    .set({ authorization: `Bearer ${adminToken}` });

  return response.body as Computer;
}
