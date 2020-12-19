import { FriendWhereUniqueInput } from '@prisma/client';

import prisma from '~/prisma';

export async function assertFriendExists(params: FriendWhereUniqueInput) {
  const friend = await prisma.friend.findOne({
    where: params,
  });

  if (!friend) {
    throw new Error('Amigo não encontrado');
  }

  return friend;
}
