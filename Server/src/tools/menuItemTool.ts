import { z } from 'zod';
import { Logger } from '../utils/logger.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { ToolDefinition } from './toolRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function createMenuItemTool(mcpUnity: McpUnity, logger: Logger): ToolDefinition {
  const toolName = 'execute_menu_item';
  return {
    name: toolName,
    description: 'Executes a Unity menu item by path',
    paramsSchema: z.object({
      menuPath: z.string().describe('The path to the menu item to execute (e.g. "GameObject/Create Empty")')
    }),
    handler: async ({ menuPath }): Promise<CallToolResult> => {
      const response = await mcpUnity.sendRequest({
        method: toolName,
        params: { menuPath }
      });
      
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || `Failed to execute menu item: ${menuPath}`
        );
      }
      
      return {
        success: true,
        message: response.message,
        content: [{
          type: response.type,
          text: response.message || `Successfully executed menu item: ${menuPath}` 
        }]
      };
    }
  };
}
