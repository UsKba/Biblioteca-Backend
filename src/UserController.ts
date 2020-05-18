import { Request, Response } from 'express';

const users = [
  {
    name: 'Kadu',
  },
  {
    name: 'Lonlon',
  },
];

export default {
  index(request: Request, response: Response) {
    return response.json(users);
  },

  create(request: Request, response: Response) {
    const { user } = request.body;

    users.push(user);

    return response.json(user);
  },

  update(request: Request, response: Response) {
    const { user } = request.body;

    users[Number(user.id)].name = user.name;

    return response.json(user);
  },

  getUserById(request: Request, response: Response) {
    const { id } = request.params;

    console.log(`ID ${id}`);

    return response.json(users[Number(id)]);
  },
};
