import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const ReserveSchema = Yup.object().shape({
  year: Yup.number().required('O ano é requerido'),
  month: Yup.number().required('O mês é requerido'),
  day: Yup.number().required('O dia é requerido'),
  roomId: Yup.number().required('O id da sala é requerido'),
  scheduleId: Yup.number().required('O id do hórario é requerido'),
  classmatesIDs: Yup.array().of(Yup.number()).required('Os ids dos alunos são requeridos'),
});

export async function validateReserveStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(ReserveSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateReserveUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(ReserveSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
