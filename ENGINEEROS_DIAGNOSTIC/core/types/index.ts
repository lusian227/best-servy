// src/core/types/index.ts

export interface IEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

export interface IFile {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
    checksum?: string;
}

export interface IDomainEvent {
    id: string;
    type: string;
    occurredAt: Date;
    payload: Record<string, any>;
}

export interface IEventBus {
    publish(event: IDomainEvent): void;
    subscribe(eventType: string, handler: (event: IDomainEvent) => void): void;
}