import { Response } from 'express';

import { encodeToken } from '~/app/utils/auth';

import { RequestBody } from '~/types/request';

import { formatUserToResponse } from '../UserController/utils';
import { findUserOrCreate } from './utils';

interface StoreBody {
  name: string;
  email: string;
  enrollment: string;
}

type StoreRequest = RequestBody<StoreBody>;

class LoginController {
  async store(req: StoreRequest, res: Response) {
    const { enrollment, name, email } = req.body;

    const user = await findUserOrCreate({ enrollment, name, email });

    return res.json({
      user: formatUserToResponse(user),
      token: encodeToken(user),
    });
  }
}

export default new LoginController();
