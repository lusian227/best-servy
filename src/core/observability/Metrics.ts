// src/core/observability/Metrics.ts

export class Metrics {
    private static instance: Metrics;

    private counters = new Map<string, number>();

    private constructor() { }

    static getInstance(): Metrics {
        if (!Metrics.instance) {
            Metrics.instance = new Metrics();
        }

        return Metrics.instance;
    }

    record(name: string, value: number = 1): void {
        const current = this.counters.get(name) ?? 0;

        this.counters.set(name, current + value);
    }

    increment(name: string, value: number = 1): void {
        this.record(name, value);
    }

    get(name: string): number {
        return this.counters.get(name) ?? 0;
    }

    getAll(): Record<string, number> {
        return Object.fromEntries(this.counters);
    }

    reset(name?: string): void {
        if (name) {
            this.counters.delete(name);
            return;
        }

        this.counters.clear();
    }
}