import { Notice, NoticeComputer, NoticeRoom } from '@prisma/client';

import { UserWithColorAndRole } from '~/types/global';

import { formatUserToResponse } from '../UserController/utils';

interface NoticeToFormat extends Notice {
  userCreator: UserWithColorAndRole;

  NoticeComputer?: NoticeComputer[];
  NoticeRoom?: NoticeRoom[];
}

export function formatNoticeRoomToResponse(noticeRoom: NoticeRoom) {
  return {
    roomId: noticeRoom.roomId,
    roomStatus: noticeRoom.roomStatus,
  };
}

export function formatNoticeComputerToResponse(noticeComputer: NoticeComputer) {
  return {
    computerId: noticeComputer.computerId,
    computerStatus: noticeComputer.computerStatus,
  };
}

export function formatNoticeToResponse(notice: NoticeToFormat) {
  let roomData;
  let computerData;

  if (notice.NoticeRoom && notice.NoticeRoom.length > 0) {
    roomData = formatNoticeRoomToResponse(notice.NoticeRoom[0]);
  }

  if (notice.NoticeComputer && notice.NoticeComputer.length > 0) {
    computerData = formatNoticeComputerToResponse(notice.NoticeComputer[0]);
  }

  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    imageCode: notice.imageCode,
    status: notice.status,
    type: notice.type,

    createdAt: notice.createdAt,
    expiredAt: notice.expiredAt,

    roomData,
    computerData,
    userCreator: formatUserToResponse(notice.userCreator),
  };
}
