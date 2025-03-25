export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export declare class Logger {
    private level;
    private prefix;
    constructor(prefix: string, level?: LogLevel);
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    isLoggingEnabled(): boolean;
    isLoggingFileEnabled(): boolean;
    private log;
}
