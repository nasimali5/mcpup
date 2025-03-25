import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { ToolDefinition } from './toolRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function createNotifyMessageTool(mcpUnity: McpUnity, logger: Logger): ToolDefinition {
  const toolName = 'notify_message';
  return {
    name: toolName,
    description: 'Sends a message to the Unity console',
    paramsSchema: z.object({
      message: z.string().describe('The message to display in the Unity console'),
      type: z.string().optional().describe('The type of message (info, warning, error)')
    }),
    handler: async (params): Promise<CallToolResult> => {
      const { message, type = 'info' } = params;
      // Send to Unity
      const response = await mcpUnity.sendRequest({
        method: toolName,
        params: {
          message,
          type
        }
      });
      
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || `Failed to send message to Unity console`
        );
      }
      
      return {
        success: true,
        message: response.message,
        content: [{
          type: response.type,
          text: response.message
        }]
      };
    }
  };
}
