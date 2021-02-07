import { Request, Response, NextFunction } from 'express';

import * as Yup from 'yup';

import { validateSchema } from '~/app/utils/yup';

const ComputerStoreSchema = Yup.object().shape({
  identification: Yup.string(),
  local: Yup.string(),
  status: Yup.number(),
});

const ComputersUpdateSchema = Yup.object().shape({
  identification: Yup.string(),
  local: Yup.string(),
  status: Yup.number(),
});

export async function validateComputersStore(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(ComputerStoreSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}

export async function validateComputersUpdate(request: Request, response: Response, next: NextFunction) {
  const error = await validateSchema(ComputersUpdateSchema, request.body);

  if (error) {
    return response.status(400).json(error);
  }

  return next();
}
