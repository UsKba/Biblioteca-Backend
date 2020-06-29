import request from 'supertest';
import { PrismaClient } from '@prisma/client';

import App from '../src/App';

const prisma = new PrismaClient();

describe('User store', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to register an user', async () => {
    const user = {
      enrollment: 20181104010048,
      password: 'MyPass',
    };

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});

describe('User index', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able list all users', async () => {
    const user = {
      enrollment: 20181104010048,
      password: 'MyPass',
    };

    await request(App).post('/users').send(user);
    await request(App).post('/users').send(user);

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

// Comeca com 4 ERRO DO USUARIO
// Comeca com 5 ERRO DO SERVIDOR
