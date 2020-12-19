/* eslint-disable @typescript-eslint/no-explicit-any */

import { Friend, FriendRequest, Period, Reserve, Room, Schedule, User } from '@prisma/client';
import faker from 'faker';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { generateDate } from './utils/date';

interface GenerateUserParams {
  name?: string | any;
  email?: string | any;
  enrollment?: string | any;
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
  name?: string;
  leader: User;
  users: User[];
  period?: Period;
  schedule?: Schedule;
  room?: Room;
  date?: {
    year: number;
    month: number;
    day: number;
  };
}

interface GenerateFriendRequestParams {
  user1: User;
  user2: User;
}

interface GenerateFriendParams {
  user1: User;
  user2: User;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    enrollment: '20181104010048',
    ...params,
  };
}

// function getNextWeekDay(date: Date, sumDay: number) {
//   const weekDay = date.getDay();

//   if (weekDay === 0) {
//     return date.getUTCDate() + 1 + sumDay;
//   }

//   if (weekDay === 6) {
//     return date.getUTCDate() + 2 + sumDay;
//   }

//   return date.getUTCDate();
// }

// export function generateDate(params?: GenerateDateParams) {
//   const now = new Date();

//   const newYear = now.getUTCFullYear() + Number(params?.sumYear || 0);
//   const newMonth = now.getUTCMonth() + Number(params?.sumMonth || 0);
//   const newDay = now.getUTCDate() + Number(params?.sumDay || 0);

//   const newDate = new Date(newYear, newMonth, newDay);
//   const day = getNextWeekDay(newDate, Number(params?.sumDay || 0));

//   return {
//     year: newDate.getUTCFullYear(),
//     month: newDate.getUTCMonth(),
//     day,
//   };
// }

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

  return response.body as User;
}

export async function createRoom(params?: GenerateRoomParams) {
  const roomData = generateRoom(params);

  const response = await request(App).post('/rooms').send(roomData);

  return response.body as Room;
}

export async function createPeriod(params?: GeneratePeriodParams) {
  const periodData = generatePeriod(params);

  const response = await request(App).post('/periods').send(periodData);

  return response.body as Period;
}

export async function createSchedule(params: GenerateScheduleParams) {
  const scheduleData = generateSchedule(params);

  const response = await request(App).post('/schedules').send(scheduleData);

  return response.body as Schedule;
}

export async function createReserve(params: GenerateReserveParams) {
  const { leader, users, room, period, schedule, date, name } = params;

  const classmatesEnrollments = users.map((user) => user.enrollment);

  const targetName = name || 'Reuniao';
  const targetRoom = room || (await createRoom());
  const targetPeriod = period || (await createPeriod());
  const targetSchedule = schedule || (await createSchedule({ periodId: targetPeriod.id }));
  const tomorrowDate = date || generateDate({ sumDay: 1 });

  const reserve = {
    name: targetName,
    roomId: targetRoom.id,
    scheduleId: targetSchedule.id,
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

export async function createFriendRequest(params: GenerateFriendRequestParams) {
  const { user1, user2 } = params;

  const senderUserToken = encodeToken(user1);

  const response = await request(App)
    .post('/friends/request')
    .send({ receiverEnrollment: user2.enrollment })
    .set({ authorization: `Bearer ${senderUserToken}` });

  return response.body as FriendRequest;
}

export async function createFriend(params: GenerateFriendParams) {
  const { user1, user2 } = params;

  const tokenUser1 = encodeToken(user1);
  const tokenUser2 = encodeToken(user2);

  const friendRequestResponse = await request(App)
    .post('/friends/request')
    .send({ receiverEnrollment: user2.enrollment })
    .set({ authorization: `Bearer ${tokenUser1}` });

  const { id } = friendRequestResponse.body;

  const friendRequestConfirmationResponse = await request(App)
    .post('/friends/request/confirmation')
    .send({ id })
    .set({ authorization: `Bearer ${tokenUser2}` });

  return friendRequestConfirmationResponse.body as Friend;
}
