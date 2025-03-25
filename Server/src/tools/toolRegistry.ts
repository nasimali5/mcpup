import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { handleError } from '../utils/errors.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export interface ToolDefinition {
  name: string;
  description: string;
  paramsSchema: z.ZodObject<any>;
  handler: (params: any) => Promise<CallToolResult>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  add(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }
  
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  registerWithServer(server: McpServer): void {
    for (const tool of this.getAll()) {
      this.logger.info(`Registering tool with MCP server: ${tool.name}`);
      
      // Use the pattern from the restructuring plan
      server.tool(
        tool.name,
        tool.description,
        tool.paramsSchema.shape,
        async (params: any) => {
          try {
            this.logger.info(`Executing tool: ${tool.name}`, params);
            const result = await tool.handler(params);
            this.logger.info(`Tool execution successful: ${tool.name}`);
            return result;
          } catch (error: any) {
            this.logger.error(`Tool execution failed: ${tool.name}`, error);
            throw handleError(error, `Tool ${tool.name}`);
          }
        }
      );
    }
  }
}
