import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import App from '~/App';

import { generateUser } from './factory';

const prisma = new PrismaClient();

describe('User store', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to register an user', async () => {
    const user = generateUser();

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with invalid enrollment', async () => {
    const user = generateUser({
      enrollment: 'asdsaddeféofj',
    });

    const response = await request(App).post('/users').send(user);

    expect(response.status).toBe(400);
  });
});

describe('User index', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able list all users', async () => {
    const user1 = generateUser();
    const user2 = generateUser({
      enrollment: '20181104010049',
    });

    await request(App).post('/users').send(user1);
    await request(App).post('/users').send(user2);

    const response = await request(App).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('User Update', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able to update all users', async () => {
    const user = generateUser({
      password: 'Pass',
    });

    const changedUser = {
      ...user,
      password: 'JustAPassword',
    };

    await request(App).post('/users').send(user);

    const response = await request(App).put('/users').send(changedUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});

describe('User show', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  it('should be able show one user', async () => {
    const user = generateUser();

    const userResponse = await request(App).post('/users').send(user);

    const { id } = userResponse.body;

    const response = await request(App).get(`/users/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.enrollment).toBe('20181104010048');
  });
});

// Comeca com 4 ERRO DO USUARIO
// Comeca com 5 ERRO DO SERVIDOR

// Funcionalidade (Criar User)
// Regra de negocio (Nao pode existir usuarios com a mesma matricula)
// Regra de negocio (Nao retornar a senha em nehnuma rota!)
