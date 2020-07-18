import * as Yup from 'yup';

export async function validateSchema(schema: Yup.ObjectSchema, params: any) {
  try {
    await schema.validate(params, { abortEarly: false });

    return undefined;
  } catch (err) {
    return { errors: err.errors };
  }
}
