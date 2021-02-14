interface GenerateMessageParams {
  senderId: number;
  receiverId: number;

  subject?: string;
  content?: string;
  tags?: number[];
}

export function generateMessage(params: GenerateMessageParams) {
  return {
    subject: 'Subject',
    content: 'Message content',
    tags: [],
    ...params,
  };
}
