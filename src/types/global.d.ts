type PrismaClient = import('@prisma/client').PrismaClient;

declare namespace NodeJS {
  export interface Global {
    prisma?: PrismaClient;
  }
}
