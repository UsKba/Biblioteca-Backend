import request from 'supertest';

import App from '~/App';
import prisma from '~/prisma';

import { createUser } from '../factory';


describe('Friend index', () => {
  beforeEach(async () => {
    await prisma.friend.deleteMany({});
  });


  it('should be able list 1 fried', async () => {

  });

  it('should be able list 2 users', async () => {

  });
});
