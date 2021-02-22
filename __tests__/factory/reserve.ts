import { Reserve, Room, Schedule, User } from '@prisma/client';
import { isBefore, subDays } from 'date-fns';
import MockDate from 'mockdate';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { generateDate } from '../utils/date';

interface ReserveDateFormat {
  year: number;
  month: number;
  day: number;
}

interface GenerateReserveParams {
  leader: User;
  users: User[];
  schedule: Schedule;
  room: Room;

  name?: string;
  date?: ReserveDateFormat;
}

export async function createReserve(params: GenerateReserveParams) {
  const { leader, users, room, schedule, date, name } = params;

  const classmatesEnrollments = users.map((user) => user.enrollment);

  const targetName = name || 'ReserveName';
  const requestReserveDate = date || generateDate({ sumDay: 1 });
  const reserveDate = new Date(requestReserveDate.year, requestReserveDate.month, requestReserveDate.day);

  const reserve = {
    name: targetName,
    roomId: room.id,
    scheduleId: schedule.id,
    classmatesEnrollments,
  };

  const leaderToken = encodeToken(leader);

  async function create() {
    const reserveData = {
      ...reserve,
      ...requestReserveDate,
    };

    const response = await request(App)
      .post('/reserves')
      .send(reserveData)
      .set({
        authorization: `Bearer ${leaderToken}`,
      });

    return response.body as Reserve;
  }

  async function createOld() {
    const newSystemDate = subDays(reserveDate, 1);

    MockDate.set(newSystemDate);

    const notice = await create();

    MockDate.reset();

    return notice;
  }

  const isOld = isBefore(reserveDate, new Date());

  if (isOld) {
    return createOld();
  }

  return create();
}
