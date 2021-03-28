import { isBefore } from 'date-fns';

import { getDateOnBrazilTimezone } from '~/app/utils/date';

import { RequestError } from '~/app/errors/request';

import { NoticeWhereUniqueInput } from '.prisma/client';

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
