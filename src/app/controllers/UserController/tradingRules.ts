import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

export async function assertEmailNotExists(email: string) {
  const emailExists = await prisma.user.findOne({
    where: { email },
  });

  if (emailExists) {
    throw new RequestError('Email já cadastrado');
  }
}

export async function assertEnrollmentNotExists(enrollment: string) {
  const enrollmentExists = await prisma.user.findOne({
    where: { enrollment },
  });

  if (enrollmentExists) {
    throw new RequestError('Matrícula já está cadastrada');
  }

  return enrollmentExists;
}

export async function assertUserEnrollmentExists(enrollment: string) {
  const user = await prisma.user.findOne({
    where: { enrollment },
  });

  if (!user) {
    throw new RequestError('Usuário não encontrado');
  }

  return user;
}

export async function assertUserIdExists(id: number) {
  const user = await prisma.user.findOne({
    where: { id },
  });

  if (!user) {
    throw new RequestError('Usuário não encontrado');
  }

  return user;
}
