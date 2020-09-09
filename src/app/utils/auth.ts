import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '~/config/auth';

interface TokenObject {
  id: number;
}

export function encodeToken(objectToEncode: TokenObject) {
  return jwt.sign({ id: objectToEncode.id }, authConfig.secret);
}

export async function decodeToken(token: string) {
  try {
    const tokenDecoded = await promisify(jwt.verify)(token, authConfig.secret);

    return tokenDecoded as TokenObject;
  } catch (err) {
    return undefined;
  }
}
