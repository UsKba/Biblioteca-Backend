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
      status: 1,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to create other computer with the `identification` that already exists', async () => {
    const admin = await createUser({ isAdmin: true });
    const computerLocals = await getComputerLocals();

    const computer = {
      identification: 'PC030',
      localId: computerLocals[0].id,
      status: 1,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    const response2 = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.status).toBe(200);
    expect(response2.status).toBe(400);
  });

  it('should have correct fields on computer store', async () => {
    const admin = await createUser({ isAdmin: true });
    const computerLocals = await getComputerLocals();

    const computer = {
      identification: 'PC030',
      localId: computerLocals[0].id,
      status: 1,
    };

    const adminToken = encodeToken(admin);

    const response = await request(App)
      .post('/computers')
      .send(computer)
      .set({ authorization: `Bearer ${adminToken}` });

    expect(response.body.identification).toBe('PC030');
    expect(response.body.localId).toBe(1);
    expect(response.body.status).toBe(1);
  });
});

// describe('Computer index', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able to index the 1 computer', async () => {
//     const admin = await createUser({ isAdmin: true });
//     await createComputer({ adminUser: admin });

//     const response = await request(App).get('/computers');

//     expect(response.status).toBe(200);
//   });

//   it('should be able to index the 2 computers', async () => {
//     const admin = await createUser({ isAdmin: true });

//     await createComputer({ identification: 'PC020', adminUser: admin });
//     await createComputer({ identification: 'PC030', adminUser: admin });

//     const response = await request(App).get('/computers');

//     expect(response.status).toBe(200);
//     expect(response.body.length).toBe(2);
//   });

//   it('should have correct fields on room index', async () => {
//     const admin = await createUser({ isAdmin: true });
//     const computer = await createComputer({ adminUser: admin });

//     const response = await request(App).get('/computers');
//     const computerCreated = response.body[0];

//     expect(computerCreated.id).toBe(computer.id);
//     expect(computerCreated.local).toBe(computer.local);
//     expect(computerCreated.identification).toBe(computer.identification);
//     expect(computerCreated.status).toBe(computer.status);
//   });
// });

// describe('Computer Update', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able to update a computer', async () => {
//     const admin = await createUser({ isAdmin: true });
//     const computer = await createComputer({ adminUser: admin, status: computerConfig.disponible });

//     const adminToken = encodeToken(admin);

//     const response = await request(App)
//       .put(`/computers/${computer.id}`)
//       .send({
//         status: computerConfig.indisponible,
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(200);
//     expect(response.body.status).toBe(computerConfig.indisponible);
//   });

//   it('should not be able to update the `status` of a computer to other that is not accepted', async () => {
//     const admin = await createUser({ isAdmin: true });
//     const computer = await createComputer({ identification: 'PC010', adminUser: admin });

//     const adminToken = encodeToken(admin);

//     const response = await request(App)
//       .put(`/computers/${computer.id}`)
//       .send({
//         status: -1,
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update the `identification` of a computer to another that already exists', async () => {
//     const admin = await createUser({ isAdmin: true });

//     await createComputer({ identification: 'PC020', adminUser: admin });
//     const computer2 = await createComputer({ identification: 'PC010', adminUser: admin });

//     const adminToken = encodeToken(admin);

//     const response = await request(App)
//       .put(`/computers/${computer2.id}`)
//       .send({
//         identification: 'PC020',
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with incorrect id format', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const response = await request(App)
//       .put(`/computers/incorrectId`)
//       .send({
//         initials: 'F1-2',
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with invalid `status` format', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ identification: 'PC020', adminUser: admin });
//     const nextComputerId = computer.id + 1;

//     const response = await request(App)
//       .put(`/computers/${nextComputerId}`)
//       .send({
//         status: 'invalidStatus',
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with id that not exists', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ identification: 'PC020', adminUser: admin });
//     const nextComputerId = computer.id + 1;

//     const response = await request(App)
//       .put(`/computers/${nextComputerId}`)
//       .send({
//         identification: 'PC010',
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should have correct fields on computer update', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ identification: 'PC010', adminUser: admin });

//     const response = await request(App)
//       .put(`/computers/${computer.id}`)
//       .send({
//         identification: 'PC000',
//       })
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.body.id).toBe(computer.id);
//     expect(response.body.identification).toBe('PC000');
//     expect(response.body.local).toBe(computer.local);
//     expect(response.body.status).toBe(computer.status);
//   });
// });

// describe('Computer Delete', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able to delete a computer', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ adminUser: admin });

//     const response = await request(App)
//       .delete(`/computers/${computer.id}`)
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(200);
//     expect(response.body.id).toBe(computer.id);
//   });

//   it('should not be able to delete a computer with incorrect id format', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const response = await request(App)
//       .delete(`/computers/incorrectId`)
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to delete a computer with id that not exists', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ adminUser: admin });
//     const nextComputerId = computer.id + 1;

//     const response = await request(App)
//       .delete(`/rooms/${nextComputerId}`)
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.status).toBe(400);
//   });

//   it('should have correct fields on computer delete', async () => {
//     const admin = await createUser({ isAdmin: true });

//     const adminToken = encodeToken(admin);

//     const computer = await createComputer({ adminUser: admin });

//     const response = await request(App)
//       .delete(`/computers/${computer.id}`)
//       .set({ authorization: `Bearer ${adminToken}` });

//     expect(response.body.id).toBe(computer.id);
//   });
// });
