import { Logger } from '../utils/logger.js';
import { handleError } from '../utils/errors.js';
import { McpServer, ResourceMetadata,  } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

export interface ResourceDefinition {
  name: string;
  description?: string;
  uri: string;
  metadata?: ResourceMetadata;
  handler: (params: any) => Promise<ReadResourceResult>;
}

export class ResourceRegistry {
  private resources: Map<string, ResourceDefinition> = new Map();
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  add(resource: ResourceDefinition): void {
    this.resources.set(resource.name, resource);
  }
  
  getAll(): ResourceDefinition[] {
    return Array.from(this.resources.values());
  }
  
  registerWithServer(server: McpServer): void {
    for (const resource of this.getAll()) {
      this.logger.info(`Registering resource with MCP server: ${resource.name}`);
      
      // Register the resource with the MCP server
      server.resource(
        resource.name,
        resource.uri,
        resource.metadata || {},
        async (params: any) => {
          try {
            this.logger.info(`Fetching resource: ${resource.name}`, params);
            const result = await resource.handler(params);
            this.logger.info(`Resource fetch successful: ${resource.name}`);
            return result;
          } catch (error: any) {
            this.logger.error(`Resource fetch failed: ${resource.name}`, error);
            throw handleError(error, `Resource ${resource.name}`);
          }
        }
      );
    }
  }
}
