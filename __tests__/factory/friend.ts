import { Friend, FriendRequest, User } from '@prisma/client';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

interface GenerateFriendRequestParams {
  user1: User;
  user2: User;
}

interface GenerateFriendParams {
  user1: User;
  user2: User;
}

export async function createFriendRequest(params: GenerateFriendRequestParams) {
  const { user1, user2 } = params;

  const senderUserToken = encodeToken(user1);

  const response = await request(App)
    .post('/friends/request')
    .send({ receiverEnrollment: user2.enrollment })
    .set({ authorization: `Bearer ${senderUserToken}` });

  return response.body as FriendRequest;
}

export async function createFriend(params: GenerateFriendParams) {
  const { user1, user2 } = params;

  const tokenUser1 = encodeToken(user1);
  const tokenUser2 = encodeToken(user2);

  const friendRequestResponse = await request(App)
    .post('/friends/request')
    .send({ receiverEnrollment: user2.enrollment })
    .set({ authorization: `Bearer ${tokenUser1}` });

  const { id } = friendRequestResponse.body;

  const friendRequestConfirmationResponse = await request(App)
    .post('/friends/request/confirmation')
    .send({ id })
    .set({ authorization: `Bearer ${tokenUser2}` });

  return friendRequestConfirmationResponse.body as Friend;
}
