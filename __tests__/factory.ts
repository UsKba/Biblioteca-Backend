interface GenerateUserParams {
  name?: string;
  email?: string;
  enrollment?: string;
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
