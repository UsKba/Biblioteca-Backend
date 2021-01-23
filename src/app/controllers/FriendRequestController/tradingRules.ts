import { FriendRequest } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

export async function assertFriendRequestExists(id: number) {
  const friendRequest = await prisma.friendRequest.findOne({
    where: { id },
  });

  if (!friendRequest) {
    throw new RequestError('Convite não encontrado');
  }

  return friendRequest;
}

export function assertUserLoggedAndFriendRequestReceiverAreDifferent(
  userEnrollment: string,
  receiverEnrollment: string
) {
  if (userEnrollment === receiverEnrollment) {
    throw new RequestError('Você não pode enviar solicitação de amizade para sigo mesmo');
  }
}

export function assertIsSenderOrReceiverId(senderId: number, friendRequest: FriendRequest) {
  if (friendRequest?.senderId !== senderId && friendRequest?.receiverId !== senderId) {
    throw new RequestError('Você não tem permissão para deletar o convite');
  }

  return friendRequest;
}

export async function assertFriendRequestReceiverAlreadyNotSendOneToYou(userId: number, receiverId: number) {
  const [friendRequest] = await prisma.friendRequest.findMany({
    where: {
      senderId: receiverId,
      receiverId: userId,
    },
  });

  if (friendRequest) {
    throw new RequestError('Esse usuário já o envio uma solicitação de amizade', 207);
  }
}
