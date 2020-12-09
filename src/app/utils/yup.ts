import * as Yup from 'yup';

import { checkIsCorrectHourFormat } from './date';

export async function validateSchema(schema: Yup.ObjectSchema, params: any) {
  try {
    await schema.validate(params, { abortEarly: false });

    return undefined;
  } catch (err) {
    return { error: err.errors[0] };
  }
}

export function validateHourYup(hour?: string | null) {
  if (!hour) {
    return false;
  }

  return checkIsCorrectHourFormat(hour);
}
