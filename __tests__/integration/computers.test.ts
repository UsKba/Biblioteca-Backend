import request from 'supertest';

import { encodeToken } from '~/app/utils/auth';

import App from '~/App';

import { createComputer, createUser } from '../factory';
import { cleanDatabase } from '../utils/database';

describe('Computer store', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to register an computer', async () => {
    const admin = await createUser({ isAdmin: true });

    const computer = {
      identification: 'PC030',
      local: 'Sala B2',
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

  // it('should not be able to create other computer with the `identification` that already exists', async () => {
  //   const admin = await createUser({ isAdmin: true });

  //   const computer = {
  //     identification: 'PC030',
  //     local: 'Sala B2',
  //     status: 1,
  //   };

  //   const adminToken = encodeToken(admin);

  //   const response = await request(App)
  //     .post('/computers')
  //     .send(computer)
  //     .set({ authorization: `Bearer ${adminToken}` });

  //   const response2 = await request(App)
  //     .post('/computers')
  //     .send(computer)
  //     .set({ authorization: `Bearer ${adminToken}` });

  //   expect(response.status).toBe(200);
  //   expect(response2.status).toBe(400);
  // });

  // it('should have correct fields on computer store', async () => {
  //   const computer = {
  //     identification: 'PC030',
  //     local: 'Sala B2',
  //     status: 1,
  //   };

  //   const response = await request(App).post('/computers').send(computer);

  //   expect(response.body.identification).toBe('PC030');
  //   expect(response.body.local).toBe('Sala B2');
  //   expect(response.body.status).toBe(1);
  // });
});

describe('Computer index', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should be able to index the 1 computer', async () => {
    const admin = await createUser({ isAdmin: true });
    await createComputer({ adminUser: admin });

    const response = await request(App).get('/computers');

    expect(response.status).toBe(200);
  });

  // it('should be able to index the 2 rooms', async () => {
  //   await createComputer({ identification: 'PC020' });
  //   await createComputer({ identification: 'PC030' });

  //   const response = await request(App).get('/computers');

  //   expect(response.status).toBe(200);
  //   expect(response.body.length).toBe(2);
  // });

  // it('should have correct fields on room index', async () => {
  //   const computer = await createComputer();

  //   const response = await request(App).get('/computers');
  //   const computerCreated = response.body[0];

  //   expect(computerCreated.id).toBe(computer.local);
  //   expect(computerCreated.initials).toBe(computer.identification);
  //   expect(computerCreated.initials).toBe(computer.status);
  // });
});

// describe('Computer Update', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able to update a computer', async () => {
//     const computer = await createComputer();

//     const response = await request(App).put(`/computers/${computer.id}`).send({
//       status: 2,
//     });

//     expect(response.status).toBe(200);
//     expect(response.body.status).toBe(2);
//   });

//   it('should not be able to update the `status` of a computer to other that is not accepted', async () => {
//     const computer = await createComputer({ identification: 'PC010' });

//     const response = await request(App).put(`/computers/${computer.id}`).send({
//       status: -1,
//     });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update the `identification` of a room to another that already exists', async () => {
//     await createComputer({ identification: 'PC020' });

//     const computer2 = await createComputer({ identification: 'PC010' });

//     const response = await request(App).put(`/computers/${computer2.id}`).send({
//       identification: 'PC030',
//     });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with incorrect id format', async () => {
//     const response = await request(App).put(`/computers/incorrectId`).send({
//       initials: 'F1-2',
//     });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with invalid `status` format', async () => {
//     const computer = await createComputer({ identification: 'PC020' });
//     const nextComputerId = computer.id + 1;

//     const response = await request(App).put(`/computers/${nextComputerId}`).send({
//       status: 'invalidStatus',
//     });

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to update a computer with id that not exists', async () => {
//     const computer = await createComputer({ identification: 'PC020' });
//     const nextComputerId = computer.id + 1;

//     const response = await request(App).put(`/computers/${nextComputerId}`).send({
//       identification: 'PC010',
//     });

//     expect(response.status).toBe(400);
//   });

//   it('should have correct fields on computer update', async () => {
//     const computer = await createComputer({ identification: 'PC010' });

//     const response = await request(App).put(`/computers/${computer.id}`).send({
//       identification: 'PC000',
//     });

//     expect(response.body.id).toBe(computer.id);
//     expect(response.body.identification).toBe(computer.identification);
//     expect(response.body.local).toBe(computer.local);
//     expect(response.body.status).toBe(computer.status);
//     expect(response.body.initials).toBe('PC000');
//   });
// });

// describe('Computer Delete', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able to delete a computer', async () => {
//     const computer = await createComputer();

//     const response = await request(App).delete(`/computers/${computer.id}`);

//     expect(response.status).toBe(200);
//     expect(response.body.id).toBe(computer.id);
//   });

//   it('should not be able to delete a computer with incorrect id format', async () => {
//     const response = await request(App).delete(`/computers/incorrectId`);

//     expect(response.status).toBe(400);
//   });

//   it('should not be able to delete a computer with id that not exists', async () => {
//     const computer = await createComputer();
//     const nextComputerId = computer.id + 1;

//     const response = await request(App).delete(`/rooms/${nextComputerId}`);

//     expect(response.status).toBe(400);
//   });

//   it('should have correct fields on room delete', async () => {
//     const computer = await createComputer();

//     const response = await request(App).delete(`/computers/${computer.id}`);

//     expect(response.body.id).toBe(computer.id);
//   });
// });
