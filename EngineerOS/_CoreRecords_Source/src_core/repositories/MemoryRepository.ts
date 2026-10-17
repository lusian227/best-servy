// src/core/repositories/MemoryRepository.ts

import { IEntity } from '../types';
import { IRepository } from './IRepository';

export abstract class MemoryRepository<T extends IEntity> implements IRepository<T> {
    protected entities: T[] = [];

    async findAll(): Promise<T[]> {
        return [...this.entities];
    }

    async findById(id: string): Promise<T | undefined> {
        return this.entities.find(e => e.id === id);
    }

    async save(entity: T): Promise<T> {
        const index = this.entities.findIndex(e => e.id === entity.id);
        if (index >= 0) {
            this.entities[index] = { ...entity };
        } else {
            this.entities.push({ ...entity });
        }
        return entity;
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.entities.length;
        this.entities = this.entities.filter(e => e.id !== id);
        return this.entities.length < initialLength;
    }

    async count(): Promise<number> {
        return this.entities.length;
    }

    async search(filters: Record<string, any>): Promise<T[]> {
        let results = this.entities;
        for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && value !== null) {
                results = results.filter(e => (e as any)[key] === value);
            }
        }
        return results;
    }

    protected filterByField<K extends keyof T>(field: K, value: T[K]): T[] {
        return this.entities.filter(e => e[field] === value);
    }
}