import prisma from '~/prisma';

export async function assertEmailNotExists(email: string) {
  const emailExists = await prisma.user.findOne({
    where: { email },
  });

  if (emailExists) {
    throw new Error('Email já cadastrado');
  }
}

export async function assertEnrollmentNotExists(enrollment: string) {
  const enrollmentExists = await prisma.user.findOne({
    where: { enrollment },
  });

  if (enrollmentExists) {
    throw new Error('Matrícula já está cadastrada');
  }

  return enrollmentExists;
}

export async function assertUserIdExists(id: number) {
  const userId = await prisma.user.findOne({
    where: { id },
  });

  if (!userId) {
    throw new Error('Usuário não encontrado');
  }

  return userId;
}

export async function assertUserEnrollmentExists(enrollment: string) {
  const user = await prisma.user.findOne({
    where: { enrollment },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return user;
}
