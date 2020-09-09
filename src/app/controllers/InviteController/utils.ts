import prisma from '~/prisma';

export async function deleteInvite(id: number) {
  try {
    await prisma.invite.delete({ where: { id } });

    return { id };
  } catch (e) {
    throw new Error('Convite não encontrado');
  }
}
