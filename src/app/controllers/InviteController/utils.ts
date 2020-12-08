import { Invite, User } from '@prisma/client';

type InviteToFormat = Invite & {
  UserSender: User;
  UserReceiver: User;
};

export function formatInviteToResponse(invite: InviteToFormat) {
  return {
    id: invite.id,
    status: invite.status,
    sender: invite.UserSender,
    receiver: invite.UserReceiver,
  };
}
