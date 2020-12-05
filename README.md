GET /friends

Response:
[
  {
    id: int,
    name: string,
    enrollment: string,
    email: string
  }
]

------------------------------------

GET /invites

Response:
[
  {
    id: int,
    senderId: int,
    receiverId: int
  }
]

------------------------------------

POST /invites

Body:
{
  receiverId: int
}

Response:
{
  id: int,
  senderId: int,
  receiverId: int
}

------------------------------------

DELETE /invites/id:int

Response:
{
  id: int
}

------------------------------------

GET /invites/pending

Response:
[
  {
    id: int,
    senderId: int,
    receiverId: int
  }
]

------------------------------------

POST /invites/confirmation

Body:
{
  id: int
}

Response:
{
  id: int,
  senderId: int,
  receiverId: int
}
