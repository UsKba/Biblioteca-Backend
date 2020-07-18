interface GenerateUserParams {
  enrollment?: string;
  password?: string;
}

export function generateUser(params?: GenerateUserParams) {
  return {
    enrollment: '20181104010048',
    password: 'MyPass',
    ...params,
  };
}
