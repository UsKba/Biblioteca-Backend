interface GenerateUserParams {
  enrollment?: string;
  password?: string;
}

interface GenerateRoomParams {
  initials?: string;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    enrollment: '20181104010048',
    password: 'MyPass',
    ...params,
  };
}

export function generateRoom(params?: GenerateRoomParams) {
  return {
    initials: 'F1-1',
    ...params,
  };
}
