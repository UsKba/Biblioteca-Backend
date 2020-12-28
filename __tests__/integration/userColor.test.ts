import { response } from 'express';

import request from 'supertest';

import App from '~/App';

import { generateUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('User store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should have diffent colors on users', async () => {
    const user1 = generateUser({ enrollment: '20181104010011' });
    const user2 = generateUser({ enrollment: '20181104010022' });
    const user3 = generateUser({ enrollment: '20181104010033' });

    const response1 = await request(App).post('/users').send(user1);
    const response2 = await request(App).post('/users').send(user2);
    const response3 = await request(App).post('/users').send(user3);

    const color1DifferentOf2 = response1.body.color !== response2.body.color;
    const color1DifferentOf3 = response1.body.color !== response3.body.color;

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response3.status).toBe(200);

    expect(color1DifferentOf2).toBeTruthy();
    expect(color1DifferentOf3).toBeTruthy();
  });
});
