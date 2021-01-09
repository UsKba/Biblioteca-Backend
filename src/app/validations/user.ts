import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema, validateUserEnrollmentIsValidYup } from '~/app/utils/yup';

const UserStoreSchema = Yup.object().shape({
  name: Yup.string().required('O nome é requerido'),
  email: Yup.string().email('Email inválido').required('O email é requerido'),
  enrollment: Yup.number()
    .required('A matrícula é requerida')
    .typeError('A matrícula precisa ser composta apenas por números')
    .test('should validade enrollment', 'Matrícula inválida', validateUserEnrollmentIsValidYup),
});

const UserUpdateSchema = Yup.object().shape({
  name: Yup.string(),
  email: Yup.string().email('Email inválido'),
  enrollment: Yup.number()
    .test('should not pass enrollment', 'Você não pode atualizar a matrícula', (enrollment) => !enrollment)
    .typeError('A matrícula precisa ser um número'),
});

export async function validateUserStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(UserStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateUserUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(UserUpdateSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
