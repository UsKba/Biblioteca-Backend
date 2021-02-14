import { User } from '@prisma/client';
import faker from 'faker';
import request from 'supertest';

import App from '~/App';

interface GenerateUserParams {
  name?: string;
  email?: string;
  enrollment?: string;
}

interface CreateUserParams extends GenerateUserParams {
  isAdmin?: boolean;
}

export function generateUserStudent(params?: GenerateUserParams) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    enrollment: '20181104010048',
    ...params,
  };
}

export function generateUserAdmin(params?: GenerateUserParams) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    enrollment: '1138756',
    ...params,
  };
}

export async function createUser(params?: CreateUserParams) {
  const userData = params?.isAdmin ? generateUserAdmin(params) : generateUserStudent(params);

  const response = await request(App).post('/users').send(userData);

  return response.body as User;
}
