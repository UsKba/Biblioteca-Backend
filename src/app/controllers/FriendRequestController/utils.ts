import { FriendRequest, User } from '@prisma/client';

type FriendRequestToFormat = FriendRequest & {
  UserSender: User;
  UserReceiver: User;
};

export function formatFriendRequestToResponse(friendRequest: FriendRequestToFormat) {
  return {
    id: friendRequest.id,
    status: friendRequest.status,
    sender: friendRequest.UserSender,
    receiver: friendRequest.UserReceiver,
  };
}
