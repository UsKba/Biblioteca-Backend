import { Computer } from '@prisma/client';

import { RequestError } from '~/app/errors/request';

import computerConfig from '~/config/computer';

import prisma from '~/prisma';

interface ComputerNotExistsParams {
  identification?: string;
}

interface ComputerExistsParams {
  id?: number;
}

export async function assertComputerNotExists(params: ComputerNotExistsParams) {
  const { identification } = params;

  const computer = await prisma.computer.findOne({
    where: { identification },
  });

  if (computer !== null) {
    throw new RequestError(`${identification} já existe`);
  }

  return computer;
}

export async function assertComputerExists(params: ComputerExistsParams) {
  const { id } = params;

  const computer = await prisma.computer.findOne({
    where: { id },
  });

  if (!computer) {
    throw new RequestError('Computador não encontrada');
  }

  return computer;
}

export function assertComputerIsDisponible(computer: Computer) {
  const isDisponible = computer.status === computerConfig.disponible;

  if (!isDisponible) {
    throw new RequestError(`O computador não está disponível`);
  }
}

export function assertIsValidComputerStatus(status: number) {
  const validStatus = Object.values(computerConfig);
  const statusExists = validStatus.find((currentStatus) => currentStatus === status);

  if (!statusExists) {
    throw new RequestError(`'Status' inválido`);
  }
}
