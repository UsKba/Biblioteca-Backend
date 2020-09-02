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
    name: 'Kalon',
    email: 'kalon@gmail.com',
    enrollment: '20181104010048',
    ...params,
  };
}

export function generateDate(params?: GenerateDateParams) {
  const now = new Date();

  const dayWithSum = Number(params?.sumDay || 0);

  let targetDay = now.getDay() + dayWithSum;

  if (targetDay === 0) {
    // sunday to monday

    targetDay = now.getUTCDate() + dayWithSum + 1;
  } else if (targetDay === 6) {
    // saturday to monday

    targetDay = now.getUTCDate() + dayWithSum + 2;
  } else {
    targetDay = now.getUTCDate() + dayWithSum;
  }

  return {
    year: now.getFullYear() + Number(params?.sumYear || 0),
    month: now.getMonth() + Number(params?.sumMonth || 0),
    day: targetDay,
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
