import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDate } from '../utils/date';

describe('notice store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create an notice and assert have corerct fields', async () => {
    const user = await createUser();

    const { year, month, day } = generateDate({ sumDay: 1 });
    const tomorrowDate = new Date(year, month, day);

    const noticeData = {
      title: 'Notice Title',
      content: 'Notice content',
      expiredAt: tomorrowDate,
    };

    const userCreatorToken = encodeToken(user);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to create an notice with invalid `expiredAt`', async () => {
    const user = await createUser();

    const noticeData = {
      title: 'Notice Title',
      content: 'Notice content',
      expiredAt: 'invalidDate',
    };

    const userCreatorToken = encodeToken(user);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create an notice without data', async () => {
    const user = await createUser();

    const noticeData = {};

    const userCreatorToken = encodeToken(user);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(400);
  });
});
