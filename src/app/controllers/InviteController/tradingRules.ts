import { Invite } from '@prisma/client';

import prisma from '~/prisma';

export async function assertUserIsNotFriend(senderId: number, receiverId: number) {
  const friends = await prisma.friend.findMany({
    where: { userId1: senderId, userId2: receiverId },
  });

  if (friends.length > 0) {
    throw new Error('Usuário já está na lista de amigos');
  }

  return friends[0];
}

export async function assertIsSenderOrReceiverId(senderId: number, invite: Invite) {
  if (invite?.senderId !== senderId && invite?.receiverId !== senderId) {
    throw new Error('Você não tem permissão para deletar o convite');
  }

  return invite;
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
