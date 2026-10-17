// src/core/repositories/IRepository.ts

import { IEntity } from '../types';

export interface IRepository<T extends IEntity> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | undefined>;
    save(entity: T): Promise<T>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
    search(filters: Record<string, any>): Promise<T[]>;
}