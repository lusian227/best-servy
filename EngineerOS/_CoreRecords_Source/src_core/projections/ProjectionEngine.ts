// src/core/projections/ProjectionEngine.ts
import { Event, EventType } from '../events/EventTypes';
import { EventStore } from '../events/EventStore';
import { Logger } from '../observability/Logger';
import { Metrics } from '../observability/Metrics';

export interface Projection {
  name: string;
  entityType: string;
  handle(event: Event): Promise<void>;
  rebuild(): Promise<void>;
  getLastProcessedEventId(): Promise<string | null>;
  markProcessed(eventId: string): Promise<void>;
}

export interface ProjectionHandler {
  canHandle(eventType: EventType): boolean;
  handle(event: Event): Promise<void>;
}

export class ProjectionEngine {
  private static instance: ProjectionEngine;
  private projections: Map<string, Projection> = new Map();
  private handlers: Map<EventType, ProjectionHandler[]> = new Map();
  private eventStore = EventStore.getInstance();
  private logger = Logger.getInstance();
  private metrics = Metrics.getInstance();
  private isProcessing = false;
  private interval: number | null = null;

  static getInstance(): ProjectionEngine {
    if (!ProjectionEngine.instance) {
      ProjectionEngine.instance = new ProjectionEngine();
    }
    return ProjectionEngine.instance;
  }

  registerProjection(projection: Projection): void {
    this.projections.set(projection.name, projection);
    this.logger.info(`Projection registered: ${projection.name}`);
  }

  registerHandler(eventType: EventType, handler: ProjectionHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    this.logger.debug(`Handler registered for ${eventType}`);
  }

  startProcessing(intervalMs: number = 5000): void {
    if (this.interval) return;

    this.logger.info(
      `Starting projection engine (interval: ${intervalMs}ms)`
    );
    this.interval = window.setInterval(() => {
      this.processEvents();
    }, intervalMs);

    // Process immediately
    this.processEvents();
  }

  stopProcessing(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isProcessing = false;
    this.logger.info('Projection engine stopped');
  }

  private async processEvents(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // Get all projections and their last processed event
      const projectionStates = await Promise.all(
        Array.from(this.projections.values()).map(async (p) => {
          const lastEventId = await p.getLastProcessedEventId();
          return { projection: p, lastEventId };
        })
      );

      // Find the minimum last processed event (the earliest unprocessed)
      let minLastEventId: string | null = null;
      for (const state of projectionStates) {
        if (state.lastEventId) {
          if (!minLastEventId || state.lastEventId < minLastEventId) {
            minLastEventId = state.lastEventId;
          }
        }
      }

      // Get unprocessed events
      const unprocessedEvents = await this.getUnprocessedEvents(minLastEventId);

      if (unprocessedEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(
        `Processing ${unprocessedEvents.length} events`
      );

      // Process each event through all projections
      for (const event of unprocessedEvents) {
        await this.processEvent(event);
      }

      const duration = Date.now() - startTime;
      this.metrics.record('projection.engine.processing.duration', duration);
      this.metrics.record('projection.engine.events.processed', unprocessedEvents.length);

    } catch (error) {
      this.logger.error('Error processing projections', error as Error);
      this.metrics.record('projection.engine.errors', 1);
    } finally {
      this.isProcessing = false;
    }
  }

  private async getUnprocessedEvents(afterEventId: string | null): Promise<Event[]> {
    // Get events from event store that haven't been processed by all projections
    // This is simplified - in production you'd track per-projection progress
    const events = await this.eventStore.getUnprocessedEvents(100);
    return events;
  }

  private async processEvent(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type as EventType) || [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        this.logger.error(
          `Handler failed for event ${event.type}`,
          error as Error,
          { event }
        );
      }
    }

    // Mark as processed in event store
    await this.eventStore.markProcessed(event.id as string);
  }

  async rebuildAllProjections(): Promise<void> {
    this.logger.info('Rebuilding all projections...');
    const startTime = Date.now();

    for (const [name, projection] of this.projections) {
      try {
        await projection.rebuild();
        this.logger.info(`Projection rebuilt: ${name}`);
      } catch (error) {
        this.logger.error(
          `Failed to rebuild projection: ${name}`,
          error as Error
        );
      }
    }

    const duration = Date.now() - startTime;
    this.metrics.record('projection.engine.rebuild.duration', duration);
    this.logger.info(
      `All projections rebuilt in ${duration}ms`
    );
  }
}
