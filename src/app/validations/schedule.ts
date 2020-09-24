import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

function checkIsHourValid(hour: string) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(hour);
}

const scheduleSchema = Yup.object().shape({
  initialHour: Yup.string()
    .required('Hora inicial é requerida')
    .test('is-hour-valid', 'Hora inválida', checkIsHourValid),
  endHour: Yup.string().required('Hora final é requerida').test('is-hour-valid', 'Hora inválida', checkIsHourValid),
});

export async function validateScheduleStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(scheduleSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateScheduleUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(scheduleSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
