export type LogLevel =
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'fatal';

export class Logger {
    private static instance: Logger;

    private level: LogLevel = 'info';

    private constructor() { }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }

        return Logger.instance;
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    debug(message: string, data?: unknown): void {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, data ?? '');
        }
    }

    info(message: string, data?: unknown): void {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${message}`, data ?? '');
        }
    }

    warn(message: string, data?: unknown): void {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, data ?? '');
        }
    }

    error(message: string, error?: Error | unknown): void {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${message}`, error ?? '');
        }
    }

    fatal(message: string, error?: Error | unknown): void {
        if (this.shouldLog('fatal')) {
            console.error(`[FATAL] ${message}`, error ?? '');
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = [
            'debug',
            'info',
            'warn',
            'error',
            'fatal',
        ];

        return (
            levels.indexOf(level) >=
            levels.indexOf(this.level)
        );
    }
}