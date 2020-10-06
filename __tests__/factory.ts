/* eslint-disable @typescript-eslint/no-explicit-any */

import { Friends, Invites, Periods, Reserves, Rooms, Schedules, Users } from '@prisma/client';
import faker from 'faker';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateUserParams {
  name?: string | any;
  email?: string | any;
  enrollment?: string | any;
}

interface GenerateDateParams {
  sumYear?: number | any;
  sumMonth?: number | any;
  sumDay?: number | any;
}

interface GenerateRoomParams {
  initials?: string | any;
  available?: boolean | any;
}

interface GeneratePeriodParams {
  name?: string | any;
  initialHour?: string | any;
  endHour?: string | any;
}

interface GenerateScheduleParams {
  periodId: number;
  initialHour?: string | any;
  endHour?: string | any;
}

interface GenerateReserveParams {
  users: Users[];
  period?: Periods;
  schedule?: Schedules;
  room?: Rooms;
  date?: {
    year: number;
    month: number;
    day: number;
  };
}

interface GenerateInviteParams {
  user1: Users;
  user2: Users;
}

interface GenerateFriendParams {
  user1: Users;
  user2: Users;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    enrollment: '20181104010048',
    ...params,
  };
}

function getDayBasedOnSumDayAndWeekDay(weekDay: number, sumDay: number, date: Date) {
  if (weekDay === 0) {
    if (sumDay < 0) {
      return date.getUTCDate() - 2;
    }

    return date.getUTCDate() + 1;
  }

  if (weekDay === 6) {
    if (sumDay < 0) {
      return date.getUTCDate() - 1;
    }

    return date.getUTCDate() + 2;
  }

  return date.getUTCDate();
}

export function generateDate(params?: GenerateDateParams) {
  const now = new Date();

  const newYear = now.getFullYear() + Number(params?.sumYear || 0);
  const newMonth = now.getMonth() + Number(params?.sumMonth || 0);
  const newDay = now.getUTCDate() + Number(params?.sumDay || 0);

  const newDate = new Date(newYear, newMonth, newDay);
  const weekDay = newDate.getDay();
  const day = getDayBasedOnSumDayAndWeekDay(weekDay, params?.sumDay || 0, newDate);

  return {
    year: now.getFullYear() + Number(params?.sumYear || 0),
    month: now.getMonth() + Number(params?.sumMonth || 0),
    day,
  };
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    available: true,
    ...params,
  };
}

export function generatePeriod(params?: GeneratePeriodParams) {
  return {
    name: 'Manhã',
    initialHour: '06:00',
    endHour: '12:00',
    ...params,
  };
}

export function generateSchedule(params: GenerateScheduleParams) {
  return {
    initialHour: '06:00',
    endHour: '07:00',
    ...params,
  };
}

export async function createUser(params?: GenerateUserParams) {
  const userData = generateUser(params);

  const response = await request(App).post('/users').send(userData);

  return response.body as Users;
}

export async function createRoom(params?: GenerateRoomParams) {
  const roomData = generateRoom(params);

  const response = await request(App).post('/rooms').send(roomData);

  return response.body as Rooms;
}

export async function createPeriod(params?: GeneratePeriodParams) {
  const periodData = generatePeriod(params);

  const response = await request(App).post('/periods').send(periodData);

  return response.body as Periods;
}

export async function createSchedule(params: GenerateScheduleParams) {
  const scheduleData = generateSchedule(params);

  const response = await request(App).post('/schedules').send(scheduleData);

  return response.body as Schedules;
}

export async function createReserve(params: GenerateReserveParams) {
  const { users, room, period, schedule, date } = params;

  const classmatesIDs = users.map((user) => user.id);

  const targetRoom = room || (await createRoom());
  const targetPeriod = period || (await createPeriod());
  const targetSchedule = schedule || (await createSchedule({ periodId: targetPeriod.id }));
  const tomorrowDate = date || generateDate({ sumDay: 1 });

  const reserve = {
    roomId: targetRoom.id,
    scheduleId: targetSchedule.id,
    classmatesIDs,
    ...tomorrowDate,
  };

  const token = encodeToken(users[0]); // Lider do grupo

  const response = await request(App)
    .post('/reserves')
    .send(reserve)
    .set({
      authorization: `Bearer ${token}`,
    });

  return response.body as Reserves;
}

export async function createInvite(params: GenerateInviteParams) {
  const { user1, user2 } = params;

  const token = encodeToken(user1);

  const response = await request(App)
    .post('/invites')
    .send({ recipientId: user2.id })
    .set({ authorization: `Bearer ${token}` });

  return response.body as Invites;
}

export async function createFriend(params: GenerateFriendParams) {
  const { user1, user2 } = params;

  const tokenUser1 = encodeToken(user1);
  const tokenUser2 = encodeToken(user2);

  const inviteResponse = await request(App)
    .post('/invites')
    .send({ recipientId: user2.id })
    .set({ authorization: `Bearer ${tokenUser1}` });

  const { id } = inviteResponse.body;

  const inviteConfirmationResponse = await request(App)
    .post('/invites/confirmation')
    .send({ id })
    .set({ authorization: `Bearer ${tokenUser2}` });

  return inviteConfirmationResponse.body as Friends;
}
