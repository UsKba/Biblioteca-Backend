import { Notice } from '@prisma/client';

import { UserWithColorAndRole } from '~/types/global';

import { formatUserToResponse } from '../UserController/utils';

interface NoticeToFormat extends Notice {
  userCreator: UserWithColorAndRole;
}

export function formatNoticeToResponse(notice: NoticeToFormat) {
  return {
    title: notice.title,
    content: notice.content,
    createdAt: notice.createdAt,
    expiredAt: notice.expiredAt,

    userCreator: formatUserToResponse(notice.userCreator),
  };
}
