import { RequestError } from '~/app/errors/request';

export function assertUserWhoIsConfirmingIsTheReceiver(userId: number, receiverId: number) {
  if (userId !== receiverId) {
    throw new RequestError('Somente o destinatário pode confirmar o convite');
  }
}
