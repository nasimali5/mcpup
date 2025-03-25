import { McpUnity } from '../unity/mcpUnity.js';
import { Logger } from '../utils/logger.js';
import { ResourceDefinition } from './resourceRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export function createGetMenuItemsResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition {
  const resourceName = 'get_menu_items';
  const resourceUri = `unity://${resourceName}`;
  const resourceMimeType = 'application/json';
  
  return {
    name: resourceName,
    uri: resourceUri,
    metadata: {
      description: 'List of available menu items in Unity to execute',
      mimeType: resourceMimeType
    },
    handler: async (params: any): Promise<ReadResourceResult> => {
      const response = await mcpUnity.sendRequest({
        method: resourceName,
        params: {}
      });
      
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.RESOURCE_FETCH,
          response.message || 'Failed to fetch menu items from Unity'
        );
      }
      logger.info(`Fetching resource:`, response.menuItems);
      
      return {
        contents: [{ 
          uri: resourceUri,
          mimeType: resourceMimeType,
          text: response.menuItems
        }]
      };
    }
  };
}
