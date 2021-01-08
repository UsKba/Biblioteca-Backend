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
