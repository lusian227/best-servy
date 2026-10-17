// src/core/repositories/RepositoryFactory.ts

import { IEntity } from '../types';
import { IRepository } from './IRepository';
import { MemoryRepository } from './MemoryRepository';

export class RepositoryFactory {
    private static instances: Map<string, IRepository<any>> = new Map();

    static getRepository<T extends IEntity>(
        key: string,
        RepositoryClass: new () => IRepository<T>
    ): IRepository<T> {
        if (!this.instances.has(key)) {
            this.instances.set(key, new RepositoryClass());
        }
        return this.instances.get(key) as IRepository<T>;
    }

    static clearCache(): void {
        this.instances.clear();
    }
}