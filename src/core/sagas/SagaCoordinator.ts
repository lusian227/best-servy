// src/core/sagas/SagaCoordinator.ts

import {
  Saga,
  SagaState,
  SagaCoordinator,
} from './Saga.interface';

import { EventBus } from '../events/EventBus';
import { EventType } from '../events/EventTypes';
import { Logger } from '../observability/Logger';
import { Metrics } from '../observability/Metrics';

export class SagaCoordinatorImpl implements SagaCoordinator {
  private static instance: SagaCoordinatorImpl;

  private sagas: Map<string, Saga> = new Map();

  private eventBus = EventBus.getInstance();
  private logger = Logger.getInstance();
  private metrics = Metrics.getInstance();

  private constructor() { }

  static getInstance(): SagaCoordinatorImpl {
    if (!SagaCoordinatorImpl.instance) {
      SagaCoordinatorImpl.instance = new SagaCoordinatorImpl();
    }

    return SagaCoordinatorImpl.instance;
  }

  async start(saga: Saga): Promise<void> {
    this.logger.info(
      `Starting saga: ${saga.name} (${saga.id})`
    );

    this.sagas.set(saga.id, saga);

    try {
      await this.executeSaga(saga);
    } catch (error) {
      saga.state.status = 'failed';

      saga.state.error =
        error instanceof Error
          ? error.message
          : String(error);

      this.logger.error(
        `Saga ${saga.name} failed`,
        error instanceof Error
          ? error
          : new Error(String(error))
      );
    }
  }

  private async executeSaga(saga: Saga): Promise<void> {
    saga.state.status = 'running';

    for (let i = 0; i < saga.state.steps.length; i++) {
      const step = saga.state.steps[i];

      saga.state.currentStep = i;
      step.status = 'running';
      step.startTime = new Date();

      try {
        this.logger.debug(
          `Executing step: ${step.name}`
        );

        const result = await step.action(saga.data);

        step.status = 'completed';
        step.result = result;
        step.endTime = new Date();

        // ✅ FIXED: Corrected EventType.SAGA_STEP_COMPLETED syntax
        await this.eventBus.emit({
          type: EventType.SAGA_STEP_COMPLETED,
          payload: {
            sagaId: saga.id,
            step: step.name,
            result,
          },
          timestamp: Date.now(),
        });

        // ✅ FIXED: Removed third argument
        this.metrics.record('saga.step.completed', 1);
      } catch (error) {
        step.status = 'failed';

        step.error =
          error instanceof Error
            ? error.message
            : String(error);

        step.endTime = new Date();

        this.logger.error(
          `Step ${step.name} failed`,
          error instanceof Error
            ? error
            : new Error(String(error))
        );

        // ✅ FIXED: Removed third argument
        this.metrics.record('saga.step.failed', 1);

        saga.state.status = 'failed';
        saga.state.error = step.error;

        throw error;
      }
    }

    saga.state.status = 'completed';

    // ✅ FIXED: Removed third argument
    this.metrics.record('saga.completed', 1);

    this.logger.info(
      `Saga ${saga.name} completed successfully`
    );
  }

  async compensate(sagaId: string): Promise<void> {
    const saga = this.sagas.get(sagaId);

    if (!saga) {
      throw new Error(
        `Saga ${sagaId} not found`
      );
    }

    this.logger.info(
      `Compensating saga: ${saga.name}`
    );

    saga.state.status = 'compensating';

    const steps = saga.state.steps;

    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];

      if (
        step.status === 'completed' &&
        step.compensation
      ) {
        try {
          this.logger.debug(
            `Compensating step: ${step.name}`
          );

          await step.compensation(
            step.result
          );

          this.logger.debug(
            `Step ${step.name} compensated`
          );
        } catch (error) {
          this.logger.error(
            `Compensation failed for step ${step.name}`,
            error instanceof Error
              ? error
              : new Error(String(error))
          );
        }
      }
    }

    saga.state.status = 'compensated';

    // ✅ FIXED: Removed third argument
    this.metrics.record('saga.compensated', 1);

    this.logger.info(
      `Saga ${saga.name} compensated`
    );
  }

  async getStatus(
    sagaId: string
  ): Promise<SagaState | null> {
    const saga = this.sagas.get(sagaId);

    return saga
      ? saga.state
      : null;
  }

  getSaga(
    sagaId: string
  ): Saga | undefined {
    return this.sagas.get(sagaId);
  }
}