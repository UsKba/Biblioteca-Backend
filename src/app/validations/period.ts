import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateHourYup, validateSchema } from '~/app/utils/yup';

const periodStoreSchema = Yup.object().shape({
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inicial inválida', validateHourYup),
  endHour: Yup.string()
    .required('Hora final é requerida')
    .test('is-hour-valid', 'Hora final inválida', validateHourYup),
});

export async function validatePeriodStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(periodStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
