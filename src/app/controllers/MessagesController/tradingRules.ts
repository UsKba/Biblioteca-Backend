import { User } from '@prisma/client';

import { checkUserIsAdminByEnrollment } from '~/app/utils/user';

import { RequestError } from '~/app/errors/request';

import prisma from '~/prisma';

// Tag

interface TagExistsParams {
  id?: number;
  name?: string;
}

export async function assertTagExists(params: TagExistsParams) {
  const { id, name } = params;

  const tag = await prisma.tag.findOne({
    where: { id, name },
  });

  if (!tag) {
    const findElement = id || name;

    throw new RequestError(`Tag ${findElement} não encontrada`);
  }

  return tag;
}

export async function assertTagsExists(tagsIds: number[]) {
  for (const tagId of tagsIds) {
    await assertTagExists({ id: tagId });
  }
}

// Message

export function assertMessageSenderIsTheLoggedUser(userSenderId: number, loggedUserId: number) {
  if (userSenderId !== loggedUserId) {
    throw new RequestError('Somente o usuário logado pode enviar mensagens');
  }
}

export function assertMessageReceiverIsAdmin(userReceiver: User) {
  const isAdmin = checkUserIsAdminByEnrollment(userReceiver.enrollment);

  if (!isAdmin) {
    throw new RequestError('Você só pode enviar mensagens para o bibliotecário ou bolsistas');
  }
}
