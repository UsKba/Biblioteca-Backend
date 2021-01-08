import { FriendWhereUniqueInput } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

export async function assertFriendExists(params: FriendWhereUniqueInput) {
  const friend = await prisma.friend.findOne({
    where: params,
  });

  if (!friend) {
    throw new RequestError('Amigo não encontrado');
  }

  return friend;
}

export async function assertUserIsNotFriend(senderId: number, receiverId: number) {
  const friends = await prisma.friend.findMany({
    where: { userId1: senderId, userId2: receiverId },
  });

  if (friends.length > 0) {
    throw new RequestError('Usuário já está na lista de amigos');
  }

  return friends[0];
}
