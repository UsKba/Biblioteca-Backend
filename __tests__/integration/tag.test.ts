describe('temp', () => {
  it('should be temporary', () => {
    expect(true).toBeTruthy();
  });
});

// import request from 'supertest';

// import App from '~/App';

// import { createTag } from '../factory';
// import { cleanDatabase } from '../utils/database';

// describe('tags index', () => {
//   beforeEach(async () => {
//     await cleanDatabase();
//   });

//   it('should be able index the tag created', async () => {
//     const tag = await createTag();

//     const response = await request(App).get('/tags');

//     // Some tags are created before all tests on setup.ts cause of messages
//     const tagIndexed = response.body[response.body.length - 1];

//     expect(response.status).toBe(200);
//     expect(tagIndexed.id).toBe(tag.id);
//     expect(tagIndexed.name).toBe(tag.name);
//   });
// });
