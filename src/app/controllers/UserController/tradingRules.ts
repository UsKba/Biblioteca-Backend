import { UserWhereUniqueInput } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

type FindUser = UserWhereUniqueInput;

export async function assertUserNotExists(params: FindUser) {
  const { id, email, enrollment } = params;

  const user = await prisma.user.findOne({
    where: { id, email, enrollment },
  });

  if (user) {
    throw new RequestError('Usuário já cadastrado');
  }

  return user;
}

export async function assertUserExists(params: FindUser) {
  const { id, email, enrollment } = params;

  const user = await prisma.user.findOne({
    where: { id, email, enrollment },
  });

  if (!user) {
    throw new RequestError('Usuário não encontrado');
  }

  return user;
}

async function checkUsersExists(userEnrollments: string[]) {
  for (let i = 0; i < userEnrollments.length; i += 1) {
    const userEnrollment = userEnrollments[i];

    const userExists = await prisma.user.findOne({
      where: { enrollment: userEnrollment },
    });

    if (!userExists) {
      return {
        allUsersExists: false,
        nonUserEnrollment: userEnrollment,
      };
    }
  }

  return { allUsersExists: true };
}

export async function assertUsersExistsOnDatabase(usersEnrollments: string[]) {
  const { allUsersExists, nonUserEnrollment } = await checkUsersExists(usersEnrollments);

  if (!allUsersExists) {
    throw new RequestError(`Usuário ${nonUserEnrollment} não encontrado`);
  }
}
