import { FriendRequest, User } from '@prisma/client';

type FriendRequestToFormat = FriendRequest & {
  userSender: User;
  userReceiver: User;
};

export function formatFriendRequestToResponse(friendRequest: FriendRequestToFormat) {
  return {
    id: friendRequest.id,
    status: friendRequest.status,
    sender: friendRequest.userSender,
    receiver: friendRequest.userReceiver,
  };
}
