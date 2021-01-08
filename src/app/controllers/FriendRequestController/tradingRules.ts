import { FriendRequest } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

export function assertUserLoggedAndFriendRequestReceiverAreDifferent(
  userEnrollment: string,
  receiverEnrollment: string
) {
  if (userEnrollment === receiverEnrollment) {
    throw new RequestError('Você não pode enviar solicitação de amizade para sigo mesmo');
  }
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

export async function assertIsSenderOrReceiverId(senderId: number, friendRequest: FriendRequest) {
  if (friendRequest?.senderId !== senderId && friendRequest?.receiverId !== senderId) {
    throw new RequestError('Você não tem permissão para deletar o convite');
  }

  return friendRequest;
}

export async function assertFriendRequestExists(id: number) {
  const friendRequest = await prisma.friendRequest.findOne({
    where: { id },
  });

  if (!friendRequest) {
    throw new RequestError('Convite não encontrado');
  }

  return friendRequest;
}
