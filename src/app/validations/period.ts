import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

import { checkIsCorrectHourFormat } from '../utils/date';

const periodStoreSchema = Yup.object().shape({
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inicial inválida', checkIsCorrectHourFormat),
  endHour: Yup.string()
    .required('Hora final é requerida')
    .test('is-hour-valid', 'Hora final inválida', checkIsCorrectHourFormat),
});

export async function validatePeriodStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(periodStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
