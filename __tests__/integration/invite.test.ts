import request from 'supertest';

import App from '~/App';
import prisma from '~/prisma';

import { createUser } from '../factory';
import { encodeToken } from '~/app/utils/auth';


describe('invite store', () => {
  beforeEach(async () => {
    await prisma.invite.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('should be able store 1 invite', async () => {
    const user1 = await createUser({ enrollment: '20181104010022' });
    const user2 = await createUser({ enrollment: '20181104010033' });

    const token = encodeToken(user1);

    const response = await request(App).post('/invites').send({ recipientId : user2.id }).set({ authorization: `Bearer ${token}`});

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.recipientId).toBe(user2.id)
    expect(response.body.userId).toBe(user1.id)
  });
});
