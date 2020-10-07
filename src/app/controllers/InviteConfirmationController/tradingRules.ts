export function assertUserWhoIsConfirmingIsTheReceiver(userId: number, receiverId: number) {
  if (userId !== receiverId) {
    throw new Error('Somente o destinatário pode confirmar o convite');
  }
}
