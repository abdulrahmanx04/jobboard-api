import { NotFoundException } from '@nestjs/common';

export function assertNotFound<T>(
  entity: T | null | undefined,
  entityName = 'Resource',
): asserts entity is T {
  if (!entity) {
    throw new NotFoundException(`${entityName} not found`);
  }
}