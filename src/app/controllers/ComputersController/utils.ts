import { Computer, ComputerLocal } from '.prisma/client';

interface ComputerToFormat extends Computer {
  local: ComputerLocal;
}

export function formatComputerToResponse(computer: ComputerToFormat) {
  return {
    id: computer.id,
    status: computer.status,
    identification: computer.identification,
    local: computer.local,
  };
}
