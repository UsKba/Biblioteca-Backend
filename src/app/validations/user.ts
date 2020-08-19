import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

interface Body {
  enrollment: string;
  name: string;
  email: string;
}

const UserSchema = Yup.object().shape({
  name: Yup.string().required('O nome é requerido'),
  email: Yup.string().email('Email inválido').required('O email é requerido'),
  enrollment: Yup.number().required('A matrícula é requerida'),
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

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
