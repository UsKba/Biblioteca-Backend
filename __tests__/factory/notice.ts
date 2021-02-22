import { Notice, User } from '@prisma/client';
import { isBefore, subDays } from 'date-fns';
import MockDate from 'mockdate';
import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { generateDate } from '../utils/date';

interface GenerateNoticeParams {
  title?: string;
  content?: string;
  expiredAt?: Date;
}

interface CreateNoticeParams extends GenerateNoticeParams {
  adminUser: User;
}

type NoticeResponse = Notice & {
  expiredAt: string;
};

export function generateNotice(params: GenerateNoticeParams) {
  return {
    title: 'Notice Title',
    content: 'Notice content',
    ...params,
  };
}

export async function createNotice(params: CreateNoticeParams) {
  const { adminUser } = params;
  const date = params.expiredAt || new Date();

  function generateDefaultDate() {
    const { year, month, day } = generateDate({ sumDay: 1 });
    const tomorrowDate = new Date(year, month, day);

    return tomorrowDate;
  }

  async function create() {
    const { title, content, expiredAt } = generateNotice(params);
    const expiredAtDate = expiredAt || generateDefaultDate();

    const noticeData = {
      title,
      content,
      expiredAt: expiredAtDate,
    };

    const adminToken = encodeToken(adminUser);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${adminToken}`,
      });

    return response.body as NoticeResponse;
  }

  async function createOld() {
    // need to create before expire date
    const newSystemDate = subDays(date, 1);

    MockDate.set(newSystemDate);

    const notice = await create();

    MockDate.reset();

    return notice;
  }

  const isOld = isBefore(date, new Date());

  if (isOld) {
    return createOld();
  }

  return create();
}
