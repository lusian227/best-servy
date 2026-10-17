// src/repositories/IRepository.ts

export interface IRepository<T> {
  findAll(): T[];
  findById(id: string): T | undefined;
  save(entity: T): T[];
  delete(id: string): T[];
}
