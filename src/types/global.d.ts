import { Color, User } from '@prisma/client';

type PrismaClient = import('@prisma/client').PrismaClient;

declare namespace NodeJS {
  export interface Global {
    prisma?: PrismaClient;
  }
}

export type UserWithColor = User & { color: Color };
