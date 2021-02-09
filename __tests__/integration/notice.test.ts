import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import userConfig from '~/config/user';

import App from '~/App';

import { createNotice, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';
import { generateDate } from '../utils/date';

describe('notice store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to create an notice and assert have corerct fields', async () => {
    const adminUser = await createUser({ isAdmin: true });

    const { year, month, day } = generateDate({ sumDay: 1 });
    const tomorrowDate = new Date(year, month, day);

    const noticeData = {
      title: 'Notice Title',
      content: 'Notice content',
      expiredAt: tomorrowDate,
    };

    const userCreatorToken = encodeToken(adminUser);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(200);

    expect(response.body.title).toBe(noticeData.title);
    expect(response.body.content).toBe(noticeData.content);
    expect(response.body.expiredAt).toBe(noticeData.expiredAt.toISOString());
    expect(response.body).toHaveProperty('createdAt');

    expect(response.body.userCreator.id).toBe(adminUser.id);
    expect(response.body.userCreator.name).toBe(adminUser.name);
    expect(response.body.userCreator.email).toBe(adminUser.email);
    expect(response.body.userCreator.enrollment).toBe(adminUser.enrollment);
    expect(response.body.userCreator.role).toBe(userConfig.role.admin.slug);
    expect(response.body.userCreator).toHaveProperty('color');
  });

  it('should not be able to create an notice with `expiredDate` before of now', async () => {
    const adminUser = await createUser({ isAdmin: true });

    const { year, month, day } = generateDate({ sumDay: -1 });
    const yesterdayDate = new Date(year, month, day);

    const noticeData = {
      title: 'Notice Title',
      content: 'Notice content',
      expiredAt: yesterdayDate,
    };

    const userCreatorToken = encodeToken(adminUser);

    const response = await request(App)
      .post('/notices')
      .send(noticeData)
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(400);
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

describe('notice index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index an notice and assert have corerct fields', async () => {
    const adminUser = await createUser({ isAdmin: true });
    const notice = await createNotice({ userCreator: adminUser });

    const userCreatorToken = encodeToken(adminUser);

    const response = await request(App)
      .get('/notices')
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    const noticeIndexed = response.body[0];

    expect(response.status).toBe(200);

    expect(noticeIndexed.title).toBe(notice.title);
    expect(noticeIndexed.content).toBe(notice.content);
    expect(noticeIndexed.expiredAt).toBe(notice.expiredAt);
    expect(noticeIndexed).toHaveProperty('createdAt');

    expect(noticeIndexed.userCreator.id).toBe(adminUser.id);
    expect(noticeIndexed.userCreator.name).toBe(adminUser.name);
    expect(noticeIndexed.userCreator.email).toBe(adminUser.email);
    expect(noticeIndexed.userCreator.enrollment).toBe(adminUser.enrollment);
    expect(noticeIndexed.userCreator.role).toBe(userConfig.role.admin.slug);
    expect(noticeIndexed.userCreator).toHaveProperty('color');
  });

  it('should index only notices that already not expired', async () => {
    const adminUser = await createUser({ isAdmin: true });

    const { year, month, day } = generateDate({ sumDay: -1 });
    const yesterdayDate = new Date(year, month, day);

    await createNotice({ userCreator: adminUser });
    await createNotice({ userCreator: adminUser, expiredAt: yesterdayDate });

    const userCreatorToken = encodeToken(adminUser);

    const response = await request(App)
      .get('/notices')
      .set({
        authorization: `Bearer ${userCreatorToken}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});
