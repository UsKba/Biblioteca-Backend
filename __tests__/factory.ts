import prisma from '~/prisma';

interface GenerateUserParams {
  name?: string;
  email?: string;
  enrollment?: string;
}

interface GenerateReserveParams {
  roomId?: number;
  scheduleId?: number;
  month?: number;
  day?: number;
  classmatesIDs?: number[];
}

interface GenerateRoomParams {
  initials?: string;
}

interface GenerateScheduleParams {
  initialHour?: string;
  endHour?: string;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    name: 'Kalon',
    email: 'kalon@gmail.com',
    enrollment: '20181104010048',
    ...params,
  };
}

export function generateReserve(params?: GenerateReserveParams) {
  return {
    roomId: 2,
    scheduleId: 2,
    month: 10,
    day: 12,
    classmatesIDs: [1, 2, 3],
    ...params,
  };
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
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
