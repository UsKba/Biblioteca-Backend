import { Router } from 'express';

const routes = Router();

routes.get('/', async (req, res) => res.json({ ok: true }));

export default routes;
