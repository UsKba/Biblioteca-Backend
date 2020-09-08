import prisma from '~/prisma';

export async function assertEmailNotExists(email: string) {
  const emailExists = await prisma.user.findOne({
    where: { email },
  });

  if (emailExists) {
    throw new Error('email já cadastrado');
  }
}

export async function assertEnrollmentNotExists(enrollment: string) {
  const enrollmentExists = await prisma.user.findOne({
    where: { enrollment },
  });

  if (enrollmentExists) {
    throw new Error('matricula já está cadastrada');
  }
}

export async function assertIdExists(id: number) {
  const userId = await prisma.user.findOne({
    where: { id },
  });

  if (!userId) {
    throw new Error('Usuário não encontrado');
  }
}
