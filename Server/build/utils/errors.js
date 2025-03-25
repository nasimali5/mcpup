export var ErrorType;
(function (ErrorType) {
    ErrorType["CONNECTION"] = "connection_error";
    ErrorType["TOOL_EXECUTION"] = "tool_execution_error";
    ErrorType["RESOURCE_FETCH"] = "resource_fetch_error";
    ErrorType["VALIDATION"] = "validation_error";
    ErrorType["INTERNAL"] = "internal_error";
    ErrorType["TIMEOUT"] = "timeout_error";
})(ErrorType || (ErrorType = {}));
export class McpUnityError extends Error {
    type;
    details;
    constructor(type, message, details) {
        super(message);
        this.type = type;
        this.details = details;
        this.name = 'McpUnityError';
    }
    toJSON() {
        return {
            type: this.type,
            message: this.message,
            details: this.details
        };
    }
}
export function handleError(error, context) {
    if (error instanceof McpUnityError) {
        return error;
    }
    // Handle standard errors
    return new McpUnityError(ErrorType.INTERNAL, `${context} error: ${error.message || 'Unknown error'}`, error);
}
