// src/core/projections/ProjectionEngine.ts

import {
  Event,
  EventType,
} from "../events/EventTypes";

import {
  EventStore,
} from "../events/EventStore";

import {
  Logger,
} from "../observability/Logger";

import {
  Metrics,
} from "../observability/Metrics";

export interface Projection {
  name: string;
  entityType: string;

  handle(event: Event): Promise<void>;

  rebuild(): Promise<void>;

  getLastProcessedEventId(): Promise<string | null>;

  markProcessed(eventId: string): Promise<void>;
}

export interface ProjectionHandler {
  handle(event: Event): Promise<void>;
}

export class ProjectionEngine {
  private static instance: ProjectionEngine;

  private readonly projections =
    new Map<string, Projection>();

  private readonly handlers =
    new Map<EventType, ProjectionHandler[]>();

  private readonly eventStore =
    EventStore.getInstance();

  private readonly logger =
    Logger.getInstance();

  private readonly metrics =
    Metrics.getInstance();

  private isProcessing = false;

  private interval:
    ReturnType<typeof setInterval> | null = null;

  private constructor() { }

  static getInstance(): ProjectionEngine {
    if (!ProjectionEngine.instance) {
      ProjectionEngine.instance =
        new ProjectionEngine();
    }

    return ProjectionEngine.instance;
  }

  registerProjection(
    projection: Projection
  ): void {
    this.projections.set(
      projection.name,
      projection
    );

    this.logger.info(
      `Projection registered: ${projection.name}`
    );
  }

  registerHandler(
    eventType: EventType,
    handler: ProjectionHandler
  ): void {
    const handlers =
      this.handlers.get(eventType) ?? [];

    handlers.push(handler);

    this.handlers.set(
      eventType,
      handlers
    );

    this.logger.debug(
      `Handler registered for ${eventType}`
    );
  }

  startProcessing(
    intervalMs = 5000
  ): void {
    if (this.interval) {
      return;
    }

    this.logger.info(
      `Starting projection engine (interval: ${intervalMs}ms)`
    );

    this.interval = setInterval(() => {
      void this.processEvents();
    }, intervalMs);

    void this.processEvents();
  }

  stopProcessing(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isProcessing = false;

    this.logger.info(
      "Projection engine stopped"
    );
  }

  private async processEvents(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const startTime = Date.now();

    try {
      const projectionStates =
        await Promise.all(
          Array.from(
            this.projections.values()
          ).map(async (projection) => ({
            projection,
            lastEventId:
              await projection.getLastProcessedEventId(),
          }))
        );

      for (const state of projectionStates) {
        const events =
          await this.eventStore.getEventsAfter(
            state.lastEventId,
            100
          );

        for (const event of events) {
          await state.projection.handle(event);

          if (event.id) {
            await state.projection.markProcessed(
              event.id
            );
          }
        }
      }

      const duration =
        Date.now() - startTime;

      this.metrics.record(
        "projection.engine.processing.duration",
        duration
      );
    } catch (error) {
      this.logger.error(
        "Error processing projections",
        error instanceof Error
          ? error
          : new Error(String(error))
      );

      this.metrics.increment(
        "projection.engine.errors"
      );
    } finally {
      this.isProcessing = false;
    }
  }

  async rebuildAllProjections(): Promise<void> {
    this.logger.info(
      "Rebuilding all projections..."
    );

    const startTime = Date.now();

    for (
      const [name, projection]
      of this.projections
    ) {
      try {
        await projection.rebuild();

        this.logger.info(
          `Projection rebuilt: ${name}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to rebuild projection: ${name}`,
          error instanceof Error
            ? error
            : new Error(String(error))
        );
      }
    }

    const duration =
      Date.now() - startTime;

    this.metrics.record(
      "projection.engine.rebuild.duration",
      duration
    );

    this.logger.info(
      `All projections rebuilt in ${duration}ms`
    );
  }
}