import prisma from '~/prisma';

export async function assertEmailNotExists(email: string) {
  const emailExists = await prisma.users.findOne({
    where: { email },
  });

  if (emailExists) {
    throw new Error('Email já cadastrado');
  }
}

export async function assertEnrollmentNotExists(enrollment: string) {
  const enrollmentExists = await prisma.users.findOne({
    where: { enrollment },
  });

  if (enrollmentExists) {
    throw new Error('Matricula já está cadastrada');
  }

  return enrollmentExists;
}

export async function assertUserIdExists(id: number) {
  const userId = await prisma.users.findOne({
    where: { id },
  });

  if (!userId) {
    throw new Error('Usuário não encontrado');
  }

  return userId;
}

export async function assertUserEnrollmentExists(enrollment: string) {
  const user = await prisma.users.findOne({
    where: { enrollment },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
}
