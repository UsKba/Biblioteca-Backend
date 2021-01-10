import { User } from '@prisma/client';

import { checkUserIsAdminByEnrollment } from '~/app/utils/user';

import { RequestError } from '~/app/errors/request';

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
