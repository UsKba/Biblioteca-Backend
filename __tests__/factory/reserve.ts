import { Reserve, Room, Schedule, User } from '@prisma/client';
import MockDate from 'mockdate';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { generateDate } from '../utils/date';

interface GenerateReserveParams {
  leader: User;
  users: User[];
  schedule: Schedule;
  room: Room;

  name?: string;
  date?: {
    year: number;
    month: number;
    day: number;
  };
}

export async function createReserve(params: GenerateReserveParams) {
  const { leader, users, room, schedule, date, name } = params;

  const classmatesEnrollments = users.map((user) => user.enrollment);

  const targetName = name || 'ReserveName';
  const tomorrowDate = date || generateDate({ sumDay: 1 });

  const reserve = {
    name: targetName,
    roomId: room.id,
    scheduleId: schedule.id,
    classmatesEnrollments,
    ...tomorrowDate,
  };

  const leaderToken = encodeToken(leader);

  const response = await request(App)
    .post('/reserves')
    .send(reserve)
    .set({
      authorization: `Bearer ${leaderToken}`,
    });

  return response.body as Reserve;
}

export async function createOldReserve(params: GenerateReserveParams) {
  // 2019.03.22
  MockDate.set(1555902000000);

  const oldReserve = await createReserve(params);

  MockDate.reset();

  return oldReserve;
}
