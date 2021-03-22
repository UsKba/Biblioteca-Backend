import { Computer, ComputerLocal, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import computerConfig from '~/config/computer';

import App from '~/App';

interface GenerateComputerParams {
  localId: number;
  identification?: string;
  status?: number;
}

interface CreateComputerParams extends GenerateComputerParams {
  adminUser: User;
}

interface ComputerResponse extends Omit<Computer, 'localId'> {
  local: ComputerLocal;
}

export function generateComputer(params?: GenerateComputerParams) {
  return {
    identification: 'F1-1',
    status: computerConfig.disponible,
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

  return response.body as ComputerResponse;
}
