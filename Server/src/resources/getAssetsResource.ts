import { McpUnity } from '../unity/mcpUnity.js';
import { Logger } from '../utils/logger.js';
import { ResourceDefinition } from './resourceRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export function createGetAssetsResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition {
  const resourceName = 'get_assets';
  const resourceUri = `unity://${resourceName}`;
  const resourceMimeType = 'application/json';
  
  return {
    name: resourceName,
    uri: resourceUri,
    metadata: {
      description: 'Retrieve assets from the Unity Asset Database',
      mimeType: resourceMimeType
    },
    handler: async (params: any): Promise<ReadResourceResult> => {
      const assetType = params?.assetType;
      const searchPattern = params?.searchPattern;
      
      const response = await mcpUnity.sendRequest({
        method: resourceName,
        params: {
          assetType,
          searchPattern
        }
      });
      
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.RESOURCE_FETCH,
          response.message || 'Failed to fetch assets from Unity Asset Database'
        );
      }
      
      // Transform the data into a structured format
      const assets = response.assets || [];
      
      const assetsData = {
        assets: assets.map((asset: any) => ({
          name: asset.name,
          filename: asset.filename,
          path: asset.path,
          type: asset.type,
          extension: asset.extension,
          guid: asset.guid,
          size: asset.size
        }))
      };
      
      return {
        contents: [
          {
            uri: resourceUri,
            text: JSON.stringify(assetsData, null, 2),
            mimeType: resourceMimeType
          }
        ]
      };
    }
  };
}
