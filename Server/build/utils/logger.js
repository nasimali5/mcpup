import { appendFileSync } from 'fs';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
// Check environment variable for logging
const isLoggingEnabled = process.env.LOGGING === 'true';
// Check environment variable for logging in a file
const isLoggingFileEnabled = process.env.LOGGING_FILE === 'true';
export class Logger {
    level;
    prefix;
    constructor(prefix, level = LogLevel.INFO) {
        this.prefix = prefix;
        this.level = level;
    }
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    error(message, error) {
        this.log(LogLevel.ERROR, message, error);
    }
    isLoggingEnabled() {
        return isLoggingEnabled;
    }
    isLoggingFileEnabled() {
        return isLoggingFileEnabled;
    }
    log(level, message, data) {
        if (level < this.level)
            return;
        const timestamp = new Date().toISOString();
        const levelStr = LogLevel[level];
        const logMessage = `[${timestamp}] [${levelStr}] [${this.prefix}] ${message}`;
        // Write to file if file logging is enabled
        if (this.isLoggingFileEnabled()) {
            try {
                appendFileSync('log.txt', logMessage + '\n');
                if (data) {
                    appendFileSync('log.txt', JSON.stringify(data, null, 2) + '\n');
                }
            }
            catch (error) {
                console.error('Failed to write to log file:', error);
            }
        }
        // Write to console if logging is enabled
        if (this.isLoggingEnabled()) {
            if (data) {
                console.log(logMessage, data);
            }
            else {
                console.log(logMessage);
            }
        }
    }
}
