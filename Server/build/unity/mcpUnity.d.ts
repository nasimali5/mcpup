import { Logger } from '../utils/logger.js';
interface UnityRequest {
    id?: string;
    method: string;
    params: any;
}
export declare class McpUnity {
    private logger;
    private port;
    private ws;
    private pendingRequests;
    private readonly REQUEST_TIMEOUT;
    constructor(logger: Logger);
    /**
     * Start the Unity connection
     */
    start(): Promise<void>;
    /**
     * Connect to the Unity WebSocket
     */
    private connect;
    /**
     * Handle messages received from Unity
     */
    private handleMessage;
    /**
     * Disconnect from Unity
     */
    private disconnect;
    /**
     * Tries to reconnect to Unity
     */
    private reconnect;
    /**
     * Stop the Unity connection
     */
    stop(): Promise<void>;
    /**
     * Send a request to the Unity server
     */
    sendRequest(request: UnityRequest): Promise<any>;
    /**
     * Check if connected to Unity
     * Only returns true if the connection is guaranteed to be active
     */
    get isConnected(): boolean;
}
export {};
