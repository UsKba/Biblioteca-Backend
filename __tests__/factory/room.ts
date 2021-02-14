import { Room, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateRoomParams {
  initials?: string;
}

interface CreateRoomParams extends GenerateRoomParams {
  adminUser: User;
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    ...params,
  };
}

export async function createRoom(params: CreateRoomParams) {
  const { adminUser } = params;
  const roomData = generateRoom(params);

  const adminToken = encodeToken(adminUser);

  const response = await request(App)
    .post('/rooms')
    .send(roomData)
    .set({
      authorization: `Bearer ${adminToken}`,
    });

  return response.body as Room;
}
