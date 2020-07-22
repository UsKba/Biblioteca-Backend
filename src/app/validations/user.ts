import { Request, Response, NextFunction } from 'express';

import { PrismaClient } from '@prisma/client';
import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

interface Body {
  enrollment: string;
  password: string;
}

const prisma = new PrismaClient();

const UserSchema = Yup.object().shape({
  enrollment: Yup.number().required(),
  password: Yup.string().required(),
});

export async function validateUserStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(UserSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateUserUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(UserSchema, request.body);

  const { enrollment }: Body = request.body;

  const user = await prisma.user.findOne({
    where: { enrollment },
  });

  if (error) {
    return response.status(400).json(error);
  }

  if (user === null) {
    return response.status(400).json({ error: 'User not found.' });
  }

  return next();
}
