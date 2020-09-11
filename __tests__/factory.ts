/* eslint-disable @typescript-eslint/no-explicit-any */
import faker from 'faker';

import prisma from '~/prisma';

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

interface GenerateScheduleParams {
  initialHour?: string | any;
  endHour?: string | any;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    name: faker.name.findName(),
    email: faker.internet.email(),
    enrollment: '20181104010048',
    ...params,
  };
}

export function generateDate(params?: GenerateDateParams) {
  const now = new Date();

  const newYear = now.getFullYear() + Number(params?.sumYear || 0);
  const newMonth = now.getMonth() + Number(params?.sumMonth || 0);
  const newDay = now.getUTCDate() + Number(params?.sumDay || 0);

  const newDate = new Date(newYear, newMonth, newDay);
  const weekDay = newDate.getDay();
  let newWeekDay = newDate.getUTCDate();

  if (weekDay === 0) {
    newWeekDay = newDate.getUTCDate() + 1;
  } else if (weekDay === 6) {
    newWeekDay = newDate.getUTCDate() + 2;
  }

  return {
    year: now.getFullYear() + Number(params?.sumYear || 0),
    month: now.getMonth() + Number(params?.sumMonth || 0),
    day: newWeekDay,
  };
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    available: true,
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

export async function createUser(params?: GenerateUserParams) {
  const userData = generateUser(params);

  const user = await prisma.user.create({
    data: userData,
  });

  return user;
}

export async function createRoom(params?: GenerateRoomParams) {
  const roomData = generateRoom(params);

  const room = await prisma.room.create({
    data: roomData,
  });

  return room;
}

export async function createSchedule(params?: GenerateScheduleParams) {
  const scheduleData = generateSchedule(params);

  const schedule = await prisma.schedule.create({
    data: scheduleData,
  });

  return schedule;
}
