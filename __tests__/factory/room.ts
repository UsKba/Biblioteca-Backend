import { Room, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateRoomParams {
  adminUser: User;
  initials?: string;
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    ...params,
  };
}

export async function createRoom(params: GenerateRoomParams) {
  const roomData = generateRoom(params);
  const adminToken = encodeToken(params.adminUser);

  const response = await request(App)
    .post('/rooms')
    .send(roomData)
    .set({
      authorization: `Bearer ${adminToken}`,
    });

  return response.body as Room;
}
