// import { Friend, Invite, Room, Schedule, User } from '@prisma/client';
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import faker from 'faker';
// import request from 'supertest';

// import { encodeToken } from '~/app/utils/auth';

// import App from '~/App';
// import prisma from '~/prisma';

// interface GenerateUserParams {
//   name?: string | any;
//   email?: string | any;
//   enrollment?: string | any;
// }

// interface GenerateDateParams {
//   sumYear?: number | any;
//   sumMonth?: number | any;
//   sumDay?: number | any;
// }

// interface GenerateRoomParams {
//   initials?: string | any;
//   available?: boolean | any;
// }

// interface GenerateScheduleParams {
//   initialHour?: string | any;
//   endHour?: string | any;
// }

// interface GenerateReserveParams {
//   users: User[];
//   schedule?: Schedule;
//   room?: Room;
//   date?: {
//     year: number;
//     month: number;
//     day: number;
//   };
// }

// interface GenerateInviteParams {
//   user1: User;
//   user2: User;
// }

// interface GenerateFriendParams {
//   user1: User;
//   user2: User;
// }

// export function generateUser(params?: GenerateUserParams) {
//   return {
//     name: faker.name.findName(),
//     email: faker.internet.email(),
//     enrollment: '20181104010048',
//     ...params,
//   };
// }

// export function generateDate(params?: GenerateDateParams) {
//   const now = new Date();

//   const newYear = now.getFullYear() + Number(params?.sumYear || 0);
//   const newMonth = now.getMonth() + Number(params?.sumMonth || 0);
//   const newDay = now.getUTCDate() + Number(params?.sumDay || 0);

//   const newDate = new Date(newYear, newMonth, newDay);
//   const weekDay = newDate.getDay();
//   let newWeekDay = newDate.getUTCDate();

//   if (weekDay === 0) {
//     newWeekDay = newDate.getUTCDate() + 1;
//   } else if (weekDay === 6) {
//     newWeekDay = newDate.getUTCDate() + 2;
//   }

//   return {
//     year: now.getFullYear() + Number(params?.sumYear || 0),
//     month: now.getMonth() + Number(params?.sumMonth || 0),
//     day: newWeekDay,
//   };
// }

// export function generateRoom(params?: GenerateRoomParams) {
//   return {
//     initials: 'F1-1',
//     available: true,
//     ...params,
//   };
// }

// export function generateSchedule(params?: GenerateScheduleParams) {
//   return {
//     initialHour: '06:00',
//     endHour: '07:00',
//     ...params,
//   };
// }

// export async function createUser(params?: GenerateUserParams) {
//   const userData = generateUser(params);

//   const user = await prisma.users.create({
//     data: userData,
//   });

//   return user;
// }

// export async function createRoom(params?: GenerateRoomParams) {
//   const roomData = generateRoom(params);

//   const room = await prisma.rooms.create({
//     data: roomData,
//   });

//   return room;
// }

// export async function createSchedule(params?: GenerateScheduleParams) {
//   const scheduleData = generateSchedule(params);

//   const schedule = await prisma.schedules.create({
//     data: scheduleData,
//   });

//   return schedule;
// }

// export async function createReserve(params: GenerateReserveParams) {
//   const room = params?.room || (await createRoom());
//   const schedule = params?.schedule || (await createSchedule(params?.schedule));

//   const { day, month, year } = params.date || generateDate({ sumDay: 1 });

//   const reserve = await prisma.reserves.create({
//     data: {
//       day,
//       month,
//       year,
//       room: { connect: { id: room.id } },
//       schedule: { connect: { id: schedule.id } },
//     },
//   });

//   for (let i = 0; i < params.users.length; i += 1) {
//     await prisma.userReserves.create({
//       data: {
//         reserve: { connect: { id: reserve.id } },
//         user: { connect: { id: params.users[i].id } },
//       },
//     });
//   }

//   return reserve;
// }

// export async function createInvite(params: GenerateInviteParams) {
//   const { user1, user2 } = params;

//   const token = encodeToken(user1);

//   const response = await request(App)
//     .post('/invites')
//     .send({ recipientId: user2.id })
//     .set({ authorization: `Bearer ${token}` });

//   return response.body as Invite;
// }

// export async function createFriend(params: GenerateFriendParams) {
//   const { user1, user2 } = params;

//   const tokenUser1 = encodeToken(user1);
//   const tokenUser2 = encodeToken(user2);

//   const inviteResponse = await request(App)
//     .post('/invites')
//     .send({ recipientId: user2.id })
//     .set({ authorization: `Bearer ${tokenUser1}` });

//   const { id } = inviteResponse.body;

//   const inviteConfirmationResponse = await request(App)
//     .post('/invites/confirmation')
//     .send({ id })
//     .set({ authorization: `Bearer ${tokenUser2}` });

//   return inviteConfirmationResponse.body as Friend;
// }

import { Friend, Invite, Reserve, Room, Schedule, User } from '@prisma/client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import faker from 'faker';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';
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

interface GenerateReserveParams {
  users: User[];
  schedule?: Schedule;
  room?: Room;
  date?: {
    year: number;
    month: number;
    day: number;
  };
}

interface GenerateInviteParams {
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

  const response = await request(App).post('/users').send(userData);

  return response.body as User;
}

export async function createRoom(params?: GenerateRoomParams) {
  const roomData = generateRoom(params);

  const response = await request(App).post('/rooms').send(roomData);

  return response.body as Room;
}

export async function createSchedule(params?: GenerateScheduleParams) {
  const scheduleData = generateSchedule(params);

  const response = await request(App).post('/schedules').send(scheduleData);

  return response.body as Schedule;
}

export async function createReserve(params: GenerateReserveParams) {
  const { users, room, schedule, date } = params;

  const classmatesIDs = users.map((user) => user.id);

  const targetRoom = room || (await createRoom());
  const targetSchedule = schedule || (await createSchedule());
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

  return response.body as Reserve;
}

export async function createInvite(params: GenerateInviteParams) {
  const { user1, user2 } = params;

  const token = encodeToken(user1);

  const response = await request(App)
    .post('/invites')
    .send({ recipientId: user2.id })
    .set({ authorization: `Bearer ${token}` });

  return response.body as Invite;
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

  return inviteConfirmationResponse.body as Friend;
}
