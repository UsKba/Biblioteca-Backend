import { PrismaClient } from '@prisma/client';

function getPrismaAndSetItOnGlobal() {
  if (process.env.NODE_ENV === 'PRODUCTION') {
    return new PrismaClient();
  }

  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  return global.prisma;
}

const prisma = getPrismaAndSetItOnGlobal();

export default prisma;
