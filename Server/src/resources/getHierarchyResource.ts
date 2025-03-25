import { McpUnity } from '../unity/mcpUnity.js';
import { Logger } from '../utils/logger.js';
import { ResourceDefinition } from './resourceRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export function createGetHierarchyResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition {
  const resourceName = 'get_hierarchy';
  const resourceUri = `unity://${resourceName}`;
  const resourceMimeType = 'application/json';
  
  return {
    name: resourceName,
    uri: resourceUri,
    metadata: {
      description: 'Retrieve all game objects in the Unity loaded scenes with their active state',
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
          response.message || 'Failed to fetch hierarchy from Unity'
        );
      }
      
      return {
        contents: [{ 
          uri: resourceUri,
          mimeType: resourceMimeType,
          text: response.hierarchy
        }]
      };
    }
  };
}
