import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser } from '../factory';
import { generateDate } from '../utils/date';

describe('notice store', () => {
  it('should be able to create an notice and assert have corerct fields', async () => {
    const user = await createUser();
    const tomorrowDate = generateDate({ sumDay: 1 });

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
});
