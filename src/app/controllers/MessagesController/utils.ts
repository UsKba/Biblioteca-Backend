import { Message, MessageTags, Tag } from '@prisma/client';

import { UserWithColorAndRole } from '~/types/global';

import prisma from '~/prisma';

import { formatUserToResponse } from '../UserController/utils';

interface MessageToFormat extends Message {
  sender: UserWithColorAndRole;
  receiver: UserWithColorAndRole;
}

interface MessageTagToFormat extends MessageTags {
  tag: Tag;
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

export function formatTagToResponse(tag: Tag) {
  return {
    id: tag.id,
    name: tag.name,
  };
}

export function formatMessageTagToResponse(messageTag: MessageTagToFormat) {
  return formatTagToResponse(messageTag.tag);
}

export async function createRelationBetweenMessageAndTags(message: Message, tags: number[]) {
  const tagsCreated = [];

  for (const tagId of tags) {
    const tag = await prisma.messageTags.create({
      data: {
        message: { connect: { id: message.id } },
        tag: { connect: { id: tagId } },
      },
      include: {
        tag: true,
      },
    });

    tagsCreated.push(formatMessageTagToResponse(tag));
  }

  return tagsCreated;
}
