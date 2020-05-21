import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  const user = await prisma.user.create({
    data: {
      name: 'Alou',
      email: 'ALOu@gmail.com',
    },
  });
}

createUser();
