import { isBefore } from 'date-fns';

import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import { Notice, NoticeWhereUniqueInput } from '.prisma/client';

import noticeConfig from '~/config/notice';

import prisma from '~/prisma';

type FindNotice = NoticeWhereUniqueInput;

export function assertNoticeExpiredDateIsNotBeforeOfNow(date: Date) {
  const now = new Date();
  const dateOnBrazilTimezone = getDateOnBrazilTimezone(now);

  if (isBefore(date, dateOnBrazilTimezone)) {
    throw new RequestError('Essa data já passou');
  }
}

export async function assertNoticeExists(noticeParams: FindNotice) {
  const notice = await prisma.notice.findOne({
    where: noticeParams,
  });

  if (!notice) {
    throw new RequestError('Aviso não encontrado');
  }

  return notice;
}

export function assertNoticeIsActive(notice: Notice) {
  if (notice.status !== noticeConfig.statusActive) {
    throw new RequestError('Aviso não está ativo');
  }
}
