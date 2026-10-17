import { Event } from './EventTypes';

export class EventStore {
    private static instance: EventStore;

    private readonly events: Event[] = [];

    private initialized = false;

    private constructor() { }

    static getInstance(): EventStore {
        if (!EventStore.instance) {
            EventStore.instance = new EventStore();
        }

        return EventStore.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.log('EventStore initialized');
    }

    async append(event: Event): Promise<void> {
        if (!event.id) {
            event.id = this.createEventId();
        }

        this.events.push(event);
    }

    async appendMany(events: Event[]): Promise<void> {
        for (const event of events) {
            await this.append(event);
        }
    }

    async getAllEvents(): Promise<Event[]> {
        return [...this.events];
    }

    async getEventById(
        eventId: string
    ): Promise<Event | null> {
        return (
            this.events.find(
                (event) => event.id === eventId
            ) ?? null
        );
    }

    async getEventsAfter(
        lastEventId: string | null,
        limit = 100
    ): Promise<Event[]> {
        if (!lastEventId) {
            return this.events.slice(0, limit);
        }

        const index = this.events.findIndex(
            (event) => event.id === lastEventId
        );

        if (index === -1) {
            return this.events.slice(0, limit);
        }

        return this.events.slice(
            index + 1,
            index + 1 + limit
        );
    }

    async getEventsByType(
        eventType: Event['type']
    ): Promise<Event[]> {
        return this.events.filter(
            (event) => event.type === eventType
        );
    }

    get size(): number {
        return this.events.length;
    }

    clear(): void {
        this.events.length = 0;
    }

    private createEventId(): string {
        return `evt-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    }
}