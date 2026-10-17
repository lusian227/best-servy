import { EventBus } from './EventBus';
import { Event } from './EventTypes';
import { EventStore } from './EventStore';

export class OutboxService {
    private initialized = false;

    private processing = false;

    private interval:
        ReturnType<typeof setInterval> | null = null;

    constructor(
        private readonly eventStore: EventStore,
        private readonly eventBus: EventBus
    ) { }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.log('OutboxService initialized');
    }

    async publish(event: Event): Promise<void> {
        await this.eventStore.append(event);
        await this.eventBus.publish(event);
    }

    startProcessing(
        intervalMs = 5000
    ): void {
        if (this.interval) {
            return;
        }

        this.processing = true;

        this.interval = setInterval(() => {
            void this.process();
        }, intervalMs);

        void this.process();
    }

    stopProcessing(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.processing = false;
    }

    private async process(): Promise<void> {
        if (!this.processing) {
            return;
        }

        // The current in-memory implementation does not
        // require a separate persistent outbox table.
        // Events are already published through EventBus.
    }

    isProcessing(): boolean {
        return this.processing;
    }
}