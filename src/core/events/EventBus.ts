// src/core/events/EventBus.ts

import { Event, EventType } from "./EventTypes";

export interface IEventBus {
  emit(event: Event): Promise<void>;

  publish(event: Event): Promise<void>;

  subscribe(
    eventType: EventType,
    handler: (event: Event) => void
  ): void;

  unsubscribe(
    eventType: EventType,
    handler: (event: Event) => void
  ): void;
}

export class EventBus implements IEventBus {
  private static instance: EventBus;

  private readonly subscribers = new Map<
    EventType,
    Array<(event: Event) => void>
  >();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }

    return EventBus.instance;
  }

  async emit(event: Event): Promise<void> {
    const handlers = this.subscribers.get(event.type) ?? [];

    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(
          `Error handling event ${event.type}:`,
          error
        );
      }
    }
  }

  async publish(event: Event): Promise<void> {
    await this.emit(event);
  }

  subscribe(
    eventType: EventType,
    handler: (event: Event) => void
  ): void {
    const handlers = this.subscribers.get(eventType) ?? [];

    handlers.push(handler);

    this.subscribers.set(eventType, handlers);
  }

  unsubscribe(
    eventType: EventType,
    handler: (event: Event) => void
  ): void {
    const handlers = this.subscribers.get(eventType);

    if (!handlers) {
      return;
    }

    this.subscribers.set(
      eventType,
      handlers.filter((item) => item !== handler)
    );
  }
}