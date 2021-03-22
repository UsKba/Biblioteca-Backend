import request from 'supertest';

// COMENTARIO
// Toda vez que o ComputerLocals[0].id é lido ele tem um id diferente
// ele cresce de 2 em 2 como se toda vez que ele chamasse getComputerLocal
// ele criasse os 2 dnv então eu coloquei no cleandatabase mas agr ele nao
// reconhece nem o setup entao mudei pra manual inves de pegar no banco de dados
// e mesmo assim n foi
import { encodeToken } from '~/app/utils/auth';

import computerConfig from '~/config/computer';

import App from '~/App';

import { createComputer, createUser } from '../factory';
import { cleanDatabase, getComputerLocals } from '../utils/database';

describe('Computer store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to register an computer', async () => {
    const admin = await createUser({ isAdmin: true });
    const computerLocals = await getComputerLocals();

    const computer = {
      identification: 'PC030',
      localId: computerLocals[0].id,
      status: computerConfig.disponible,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should have correct fields on computer store', async () => {
    const admin = await createUser({ isAdmin: true });
    const computerLocals = await getComputerLocals();
    const computerLocal = computerLocals[0];

    const computer = {
      identification: 'PC030',
      localId: computerLocal.id,
      status: computerConfig.disponible,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.body).toHaveProperty('id');
    expect(response.body.identification).toBe(computer.identification);
    expect(response.body.status).toBe(computer.status);
    expect(response.body.local.id).toBe(computerLocal.id);
    expect(response.body.local.name).toBe(computerLocal.name);
  });
});

describe('Computer index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index the 1 computer', async () => {
    const admin = await createUser({ isAdmin: true });

    const computerLocals = await getComputerLocals();
    await createComputer({ adminUser: admin, localId: computerLocals[0].id });

    const response = await request(App).get('/computers');

    expect(response.status).toBe(200);
  });

  it('should be able to index the 2 computers', async () => {
    const admin = await createUser({ isAdmin: true });

    const computerLocals = await getComputerLocals();
    await createComputer({ identification: 'PC020', adminUser: admin, localId: computerLocals[0].id });
    await createComputer({ identification: 'PC030', adminUser: admin, localId: computerLocals[0].id });

    const response = await request(App).get('/computers');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should have correct fields on room index', async () => {
    const admin = await createUser({ isAdmin: true });

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ adminUser: admin, localId: computerLocals[0].id });

    const response = await request(App).get('/computers');

    const computerIndexed = response.body[0];

    expect(computerIndexed.id).toBe(computer.id);
    expect(computerIndexed.identification).toBe(computer.identification);
    expect(computerIndexed.status).toBe(computer.status);
    expect(computerIndexed.local.id).toBe(computer.local.id);
    expect(computerIndexed.local.name).toBe(computer.local.name);
  });
});

describe('Computer Update', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to update a computer', async () => {
    const admin = await createUser({ isAdmin: true });

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({
      adminUser: admin,
      status: computerConfig.disponible,
      localId: computerLocals[0].id,
    });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/computers/${computer.id}`)
      .send({
        status: computerConfig.indisponible,
      })
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(computerConfig.indisponible);
  });

  it('should not be able to update the `status` of a computer to other that is not accepted', async () => {
    const admin = await createUser({ isAdmin: true });

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ identification: 'PC010', adminUser: admin, localId: computerLocals[0].id });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/computers/${computer.id}`)
      .send({
        status: -1,
      })
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a computer with incorrect id format', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .put(`/computers/incorrectId`)
      .send({
        initials: 'F1-2',
      })
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a computer with invalid `status` format', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ identification: 'PC020', adminUser: admin, localId: computerLocals[0].id });
    const nextComputerId = computer.id + 1;

    const response = await request(App)
      .put(`/computers/${nextComputerId}`)
      .send({
        status: 'invalidStatus',
      })
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a computer with id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ identification: 'PC020', adminUser: admin, localId: computerLocals[0].id });
    const nextComputerId = computer.id + 1;

    const response = await request(App)
      .put(`/computers/${nextComputerId}`)
      .send({
        identification: 'PC010',
      })
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on computer update', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ identification: 'PC010', adminUser: admin, localId: computerLocals[0].id });

    const computerUpdateParams = {
      identification: 'PC000',
    };

    const response = await request(App)
      .put(`/computers/${computer.id}`)
      .send(computerUpdateParams)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.body.id).toBe(computer.id);
    expect(response.body.status).toBe(computer.status);
    expect(response.body.local.id).toBe(computer.local.id);
    expect(response.body.local.name).toBe(computer.local.name);

    expect(response.body.identification).toBe(computerUpdateParams.identification);
  });
});

describe('Computer Delete', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to delete a computer', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ adminUser: admin, localId: computerLocals[0].id });

    const response = await request(App)
      .delete(`/computers/${computer.id}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(computer.id);
  });

  it('should not be able to delete a computer with incorrect id format', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .delete(`/computers/incorrectId`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a computer with id that not exists', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ adminUser: admin, localId: computerLocals[0].id });
    const nextComputerId = computer.id + 1;

    const response = await request(App)
      .delete(`/rooms/${nextComputerId}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(400);
  });

  it('should have correct fields on computer delete', async () => {
    const admin = await createUser({ isAdmin: true });

    const adminToken = encodeToken(admin);

    const computerLocals = await getComputerLocals();
    const computer = await createComputer({ adminUser: admin, localId: computerLocals[0].id });

    const response = await request(App)
      .delete(`/computers/${computer.id}`)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.body.id).toBe(computer.id);
  });
});
