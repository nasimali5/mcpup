import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export interface ToolDefinition {
    name: string;
    description: string;
    paramsSchema: z.ZodObject<any>;
    handler: (params: any) => Promise<CallToolResult>;
}
export declare class ToolRegistry {
    private tools;
    private logger;
    constructor(logger: Logger);
    add(tool: ToolDefinition): void;
    getAll(): ToolDefinition[];
    registerWithServer(server: McpServer): void;
}
