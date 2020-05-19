// import server from './app';

// server.listen(3333);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create() {
  const user = await prisma.user.create({
    data: {
      name: 'Lonzinaaaaaa',
      email: 'LoAnzinDoidaaaaaaaao@gmail.com',
    },
  });

  console.log('user');
  console.log(user);
}

create();
