import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeout: NodeJS.Timeout;
}

interface UnityRequest {
  id?: string;
  method: string;
  params: any;
}

interface UnityResponse {
  jsonrpc: string;
  id: string;
  result?: any;
  error?: {
    message: string;
    type: string;
    details?: any;
  };
}

export class McpUnity {
  private logger: Logger;
  private port: number;
  private ws: WebSocket | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map<string, PendingRequest>();
  private readonly REQUEST_TIMEOUT = 10000;
  
  constructor(logger: Logger) {
    this.logger = logger;
    
    // Initialize port from environment variable or use default
    const envPort = process.env.UNITY_PORT;
    this.port = envPort ? parseInt(envPort, 10) : 8090;
    
    this.logger.info(`Using port: ${this.port} for Unity WebSocket connection`);
  }
  
  /**
   * Start the Unity connection
   */
  public async start(): Promise<void> {
    try {
      this.logger.info('Attempting to connect to Unity WebSocket...');
      await this.connect();
      this.logger.info('Successfully connected to Unity WebSocket');
    } catch (error) {
      this.logger.warn(`Could not connect to Unity WebSocket: ${error instanceof Error ? error.message : String(error)}`);
      this.logger.warn('Will retry connection on next request');

      // Disconnect to clean up for the next request attempt
      this.disconnect();
    }
    
    return Promise.resolve();
  }
  
  /**
   * Connect to the Unity WebSocket
   */
  private async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.debug('Already connected to Unity WebSocket');
      return Promise.resolve();
    }
    
    // First, properly close any existing WebSocket connection
    this.disconnect();
    
    return new Promise<void>((resolve, reject) => {
      const wsUrl = `ws://localhost:${this.port}/McpUnity`;
      this.logger.debug(`Connecting to ${wsUrl}...`);
      
      // Create a new WebSocket
      this.ws = new WebSocket(wsUrl);
      
      const connectionTimeout = setTimeout(() => {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING)) {
          this.logger.warn('Connection timeout, terminating WebSocket');
          this.disconnect();
          reject(new McpUnityError(ErrorType.CONNECTION, 'Connection timeout'));
        }
      }, this.REQUEST_TIMEOUT);
        
      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.logger.debug('WebSocket connected');
        resolve();
      };
        
      this.ws.onerror = (err) => {
        clearTimeout(connectionTimeout);
        this.logger.error(`WebSocket error: ${err.message || 'Unknown error'}`);
        reject(new McpUnityError(ErrorType.CONNECTION, `Connection failed: ${err.message || 'Unknown error'}`));
        this.disconnect();
      };
        
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data.toString());
      };
        
      this.ws.onclose = () => {
        this.logger.debug('WebSocket closed');
        this.disconnect();
      };
    });
  }
  
  /**
   * Handle messages received from Unity
   */
  private handleMessage(data: string): void {
    try {
      const response = JSON.parse(data) as UnityResponse;
      
      if (response.id && this.pendingRequests.has(response.id)) {
        const request = this.pendingRequests.get(response.id)!;
        clearTimeout(request.timeout);
        this.pendingRequests.delete(response.id);
        
        if (response.error) {
          request.reject(new McpUnityError(
            ErrorType.TOOL_EXECUTION,
            response.error.message || 'Unknown error',
            response.error.details
          ));
        } else {
          request.resolve(response.result);
        }
      }
    } catch (e) {
      this.logger.error(`Error parsing WebSocket message: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  
  /**
   * Disconnect from Unity
   */
  private disconnect(): void {
    if (this.ws) {
      this.logger.debug(`Disconnecting WebSocket in state: ${this.ws.readyState}`);
      
      // First remove all event handlers to prevent callbacks during close
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      // Different handling based on WebSocket state
      try {
        if (this.ws.readyState === WebSocket.CONNECTING) {
          // For sockets still connecting, use terminate() to force immediate close
          this.ws.terminate();
        } else if (this.ws.readyState === WebSocket.OPEN) {
          // For open sockets, use close() for clean shutdown
          this.ws.close();
        }
      } catch (err) {
        this.logger.error(`Error closing WebSocket: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      // Clear the reference
      this.ws = null;
      
      // Reject all pending requests
      for (const [id, request] of this.pendingRequests.entries()) {
        clearTimeout(request.timeout);
        request.reject(new McpUnityError(ErrorType.CONNECTION, 'Connection closed'));
        this.pendingRequests.delete(id);
      }
    }
  }

  /**
   * Tries to reconnect to Unity
   */
  private reconnect(): void {
    this.disconnect();
    this.connect();
  }

  /**
   * Stop the Unity connection
   */
  public async stop(): Promise<void> {
    this.disconnect();
    this.logger.info('Unity WebSocket client stopped');
    return Promise.resolve();
  }
  
  /**
   * Send a request to the Unity server
   */
  public async sendRequest(request: UnityRequest): Promise<any> {
    // Ensure we're connected first
    if (!this.isConnected) {
      this.logger.info('Not connected to Unity, connecting first...');
      await this.connect();
    }
    
    // Use given id or generate a new one
    const requestId = request.id as string || uuidv4();
    const message: UnityRequest = {
      ...request,
      id: requestId
    };
    
    return new Promise((resolve, reject) => {
      // Double check isConnected again after await
      if (!this.ws || !this.isConnected) {
        reject(new McpUnityError(ErrorType.CONNECTION, 'Not connected to Unity'));
        return;
      }
      
      // Create timeout for the request
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.logger.error(`Request ${requestId} timed out after ${this.REQUEST_TIMEOUT}ms`);
          this.pendingRequests.delete(requestId);
          reject(new McpUnityError(ErrorType.TIMEOUT, 'Request timed out'));
        }
        this.reconnect();
      }, this.REQUEST_TIMEOUT);
      
      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });
      
      try {
        this.ws.send(JSON.stringify(message));
        this.logger.debug(`Request sent: ${requestId}`);
      } catch (err) {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);
        reject(new McpUnityError(ErrorType.CONNECTION, `Send failed: ${err instanceof Error ? err.message : String(err)}`));
      }
    });
  }
  
  /**
   * Check if connected to Unity
   * Only returns true if the connection is guaranteed to be active
   */
  public get isConnected(): boolean {
    // Basic WebSocket connection check
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
