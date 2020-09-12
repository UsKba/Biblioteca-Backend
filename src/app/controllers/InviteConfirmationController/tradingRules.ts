export function assertUserWhoIsConfirmingIsTheRecipient(userId: number, recipientId: number) {
  if (userId !== recipientId) {
    throw new Error('Somente o destinatário pode confirmar o convite');
  }
}
