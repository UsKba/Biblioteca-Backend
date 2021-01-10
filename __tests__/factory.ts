/* eslint-disable @typescript-eslint/no-explicit-any */

import { Friend, FriendRequest, Period, Reserve, Room, Schedule, User } from '@prisma/client';
import faker from 'faker';
import MockDate from 'mockdate';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';
import prisma from '~/prisma';

import { generateDate } from './utils/date';

interface GenerateUserParams {
  name?: string;
  email?: string;
  enrollment?: string;
}

interface CreateUserParams extends GenerateUserParams {
  isAdmin?: boolean;
}

interface GenerateRoomParams {
  initials?: string;
}

interface GeneratePeriodParams {
  name?: string;
}

interface GenerateScheduleParams {
  periodId: number;
  initialHour?: string;
  endHour?: string;
}

interface GenerateReserveParams {
  name?: string;
  leader: User;
  users: User[];
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

interface GenerateTagParams {
  name?: string;
}

interface GenerateMessageParams {
  senderId: number;
  receiverId: number;

  subject?: string;
  content?: string;
  tags?: number[];
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

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    ...params,
  };
}

export function generatePeriod(params?: GeneratePeriodParams) {
  return {
    name: 'Manhã',
    ...params,
  };
}

export function generateSchedule(params?: GenerateScheduleParams) {
  return {
    initialHour: '06:00',
    endHour: '07:00',
    ...params,
  };
}

export function generateTag(params?: GenerateTagParams) {
  return {
    name: 'Tag',
    ...params,
  };
}

export function generateMessage(params: GenerateMessageParams) {
  return {
    ...params,
    subject: 'Subject',
    content: 'Message content',
    tags: [],
  };
}

export async function createUser(params?: CreateUserParams) {
  const userData = params?.isAdmin ? generateUserAdmin(params) : generateUserStudent(params);

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

export async function createSchedule(params?: GenerateScheduleParams) {
  const scheduleData = generateSchedule(params);

  const response = await request(App).post('/schedules').send(scheduleData);

  return response.body as Schedule;
}

export async function createReserve(params: GenerateReserveParams) {
  const { leader, users, room, schedule, date, name } = params;

  const classmatesEnrollments = users.map((user) => user.enrollment);

  const targetName = name || 'Reuniao';
  const targetRoom = room || (await createRoom());
  const targetPeriodId = schedule?.periodId || (await createPeriod()).id;
  const targetSchedule = schedule || (await createSchedule({ periodId: targetPeriodId }));
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

export async function createOldReserve(params: GenerateReserveParams) {
  // 2019.03.22
  MockDate.set(1555902000000);

  const oldReserve = await createReserve(params);

  MockDate.reset();

  return oldReserve;
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

export async function createTag(params?: GenerateTagParams) {
  const tagData = generateTag(params);

  const tag = await prisma.tag.create({
    data: tagData,
  });

  return tag;
}
