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

export async function assertUserIsNotFriend(userId: number, recipientId: number) {
  const friends = await prisma.friend.findMany({
    where: { userId1: userId, userId2: recipientId },
  });

  if (friends.length > 0) {
    throw new Error('Usuário já está na lista de amigos');
  }

  return friends[0];
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
