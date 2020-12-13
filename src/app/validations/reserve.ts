import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const ReserveSchema = Yup.object().shape({
  name: Yup.string(),
  year: Yup.number().required('O ano é requerido').typeError('O ano precisa ser um número'),
  month: Yup.number().required('O mês é requerido').typeError('O mês precisa ser um número'),
  day: Yup.number().required('O dia é requerido').typeError('O dia precisa ser um número'),
  roomId: Yup.number().required('O id da sala é requerido').typeError('O id da sala precisa ser um número'),
  scheduleId: Yup.number().required('O id do hórario é requerido').typeError('O id do horário precisa ser um número'),
  classmatesEnrollments: Yup.array()
    .of(Yup.number())
    .required('As matrículas dos alunos são requeridas')
    .typeError('As matrículas dos usuários precisam ser números'),
});

export async function validateReserveStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(ReserveSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
