import { Response } from 'express';

import { RequestAuthParams } from '~/types/auth';

import { assertUserEnrollmentExists } from '../UserController/tradingRules';

type ShowSearch = {
  enrollment: string;
};

type ShowRequest = RequestAuthParams<ShowSearch>;

class SeachController {
  async show(req: ShowRequest, res: Response) {
    const { enrollment } = req.params;

    try {
      const user = await assertUserEnrollmentExists(enrollment);

      return res.json(user);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
}

export default new SeachController();
