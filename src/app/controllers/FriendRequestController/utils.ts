import { FriendRequest } from '@prisma/client';

import { UserWithColor } from '~/types/global';

import { formatUserToResponse } from '../UserController/utils';

type FriendRequestToFormat = FriendRequest & {
  userSender: UserWithColor;
  userReceiver: UserWithColor;
};

export function formatFriendRequestToResponse(friendRequest: FriendRequestToFormat) {
  return {
    id: friendRequest.id,
    status: friendRequest.status,
    sender: formatUserToResponse(friendRequest.userSender),
    receiver: formatUserToResponse(friendRequest.userReceiver),
  };
}
