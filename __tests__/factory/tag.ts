import prisma from '~/prisma';

interface GenerateTagParams {
  name?: string;
}

export function generateTag(params?: GenerateTagParams) {
  return {
    name: 'Tag',
    ...params,
  };
}

export async function createTag(params?: GenerateTagParams) {
  const tagData = generateTag(params);

  const tag = await prisma.tag.create({
    data: tagData,
  });

  return tag;
}
