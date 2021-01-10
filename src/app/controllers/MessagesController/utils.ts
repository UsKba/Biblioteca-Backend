import { Message } from '@prisma/client';

import { UserWithColorAndRole } from '~/types/global';

import { formatUserToResponse } from '../UserController/utils';

interface MessageToFormat extends Message {
  sender: UserWithColorAndRole;
  receiver: UserWithColorAndRole;
}

export function formatMessageToResponse(message: MessageToFormat) {
  return {
    id: message.id,
    subject: message.subject,
    content: message.content,

    sender: formatUserToResponse(message.sender),
    receiver: formatUserToResponse(message.receiver),
  };
}
