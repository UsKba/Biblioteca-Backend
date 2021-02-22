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
  periodId: Yup.number().typeError('O id do turno é inválido'),
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inicial inválida', validateHourYup),
  endHour: Yup.string()
    .required('Hora final é requerida')
    .test('is-hour-valid', 'Hora final inválida', validateHourYup),
});

export async function validateScheduleStore(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(scheduleStoreSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}

export async function validateScheduleUpdate(req: Request, res: Response, next: NextFunction) {
  const error = await validateSchema(scheduleUpdateSchema, req.body);

  if (error) {
    return res.status(400).json(error);
  }

  return next();
}
