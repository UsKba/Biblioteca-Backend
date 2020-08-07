import { Response } from 'express';

import { RequestBody } from '~/types';

interface Reserve {
  initials: string;
}

type StoreRequest = RequestBody<Reserve>;

class ReserveController {
  async store(req: StoreRequest, res: Response) {
    return res.status(200).json({ ok: true });
  }
}

export default new ReserveController();
