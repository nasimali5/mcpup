import { McpUnity } from '../unity/mcpUnity.js';
import { Logger } from '../utils/logger.js';
import { ResourceDefinition } from './resourceRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export function createGetPackagesResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition {
  const resourceName = 'get_packages';
  const resourceUri = `unity://${resourceName}`;
  const resourceMimeType = 'application/json';
  
  return {
    name: resourceName,
    uri: resourceUri,
    metadata: {
      description: 'Retrieve all packages from the Unity Package Manager',
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
          response.message || 'Failed to fetch packages from Unity Package Manager'
        );
      }
      
      // Transform the data into a structured format
      const projectPackages = response.projectPackages || [];
      const registryPackages = response.registryPackages || [];
      
      const packagesData = {
        projectPackages: projectPackages.map((pkg: any) => ({
          name: pkg.name,
          displayName: pkg.displayName,
          version: pkg.version,
          description: pkg.description,
          category: pkg.category,
          source: pkg.source,
          state: pkg.state,
          author: pkg.author
        })),
        registryPackages: registryPackages.map((pkg: any) => ({
          name: pkg.name,
          displayName: pkg.displayName,
          version: pkg.version,
          description: pkg.description,
          category: pkg.category,
          source: pkg.source,
          state: pkg.state,
          author: pkg.author
        }))
      };
      
      return {
        contents: [
          {
            uri: resourceUri,
            text: JSON.stringify(packagesData, null, 2),
            mimeType: resourceMimeType
          }
        ]
      };
    }
  };
}
