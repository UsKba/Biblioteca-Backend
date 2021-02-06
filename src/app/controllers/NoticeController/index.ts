import { Response } from 'express';

import { RequestAuth } from '~/types/requestAuth';

// interface Store {
//   title: string;
//   content: string;
//   expiredAt: Date;
// }

type StoreRequest = RequestAuth;

class NoticeController {
  store(req: StoreRequest, res: Response) {
    return res.json({ ok: true });
  }
}

export default new NoticeController();
