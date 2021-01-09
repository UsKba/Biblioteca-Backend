import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateHourYup, validateSchema } from '~/app/utils/yup';

const scheduleStoreSchema = Yup.object().shape({
  periodId: Yup.number().required('O id do turno é requerido'),
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inicial inválida', validateHourYup),
  endHour: Yup.string()
    .required('Hora final é requerida')
    .test('is-hour-valid', 'Hora final inválida', validateHourYup),
});

const scheduleUpdateSchema = Yup.object().shape({
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inicial inválida', validateHourYup),
  endHour: Yup.string()
    .required('Hora final é requerida')
    .test('is-hour-valid', 'Hora final inválida', validateHourYup),
});

export async function validateScheduleStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(scheduleStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateScheduleUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(scheduleUpdateSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
