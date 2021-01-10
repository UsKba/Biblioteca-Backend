import { FriendRequest } from '@prisma/client';

import { UserWithColorAndRole } from '~/types/global';

import { formatUserToResponse } from '../UserController/utils';

type FriendRequestToFormat = FriendRequest & {
  userSender: UserWithColorAndRole;
  userReceiver: UserWithColorAndRole;
};

export function formatFriendRequestToResponse(friendRequest: FriendRequestToFormat) {
  return {
    id: friendRequest.id,
    status: friendRequest.status,
    sender: formatUserToResponse(friendRequest.userSender),
    receiver: formatUserToResponse(friendRequest.userReceiver),
  };
}
