import * as Yup from 'yup';

export async function validateSchema(schema: Yup.ObjectSchema, params: object) {
  try {
    await schema.validate(params);
    return undefined;
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      return { error: err.message };
    }

    return err;
  }
}
