import { Logger } from '../utils/logger.js';
import { McpServer, ResourceMetadata } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
export interface ResourceDefinition {
    name: string;
    description?: string;
    uri: string;
    metadata?: ResourceMetadata;
    handler: (params: any) => Promise<ReadResourceResult>;
}
export declare class ResourceRegistry {
    private resources;
    private logger;
    constructor(logger: Logger);
    add(resource: ResourceDefinition): void;
    getAll(): ResourceDefinition[];
    registerWithServer(server: McpServer): void;
}
