import prisma from '~/prisma';

export async function assertInviteNotExists(userId: number, recipientId: number) {
  const invites = await prisma.invite.findMany({
    where: { userId, recipientId },
  });

  if (invites.length > 0) {
    throw new Error('Convite já foi feito');
  }

  return invites[0];
}
export async function assertInviteExists(id: number) {
  const invite = await prisma.invite.findOne({
    where: { id },
  });

  if (!invite) {
    throw new Error('Convite não encontrado');
  }

  return invite;
}
