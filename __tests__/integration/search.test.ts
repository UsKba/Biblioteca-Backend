import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createUser } from '../factory';
import { cleanDatabase } from '../utils';

describe('Show Search', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to find a user by enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010087' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search/${user.enrollment}`)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it('should not be able to find a user with invalid enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010087' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search/InvalidEnrollment`)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to find a user with with enrollment that not exists', async () => {
    const user = await createUser({ enrollment: '20181104010087' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search/20181104010088`)
      .set({ authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should be able to find a user by enrollment', async () => {
    const user = await createUser({ enrollment: '20181104010087' });
    const token = encodeToken(user);

    const response = await request(App)
      .get(`/search/${user.enrollment}`)
      .set({ authorization: `Bearer ${token}` });

    expect(response.body.id).toBe(user.id);
    expect(response.body.name).toBe(user.name);
    expect(response.body.email).toBe(user.email);
    expect(response.body.enrollment).toBe(user.enrollment);
  });
});
