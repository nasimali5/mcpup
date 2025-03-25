import { Logger } from '../utils/logger.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { ResourceDefinition } from './resourceRegistry.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export interface TestItem {
  name: string;
  fullName: string;
  path: string;
  testMode: string;
}

export interface TestsResponse {
  tests: TestItem[];
  count: number;
  editModeCount: number;
  playModeCount: number;
}

export function createGetTestsResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition {
  const resourceName = 'get_tests';
  
  return {
    name: resourceName,
    description: "Gets the list of available tests from Unity's Test Runner",
    uri: `unity://${resourceName}`,
    
    handler: async (params: { testMode?: string; nameFilter?: string }): Promise<ReadResourceResult> => {
      const { testMode, nameFilter } = params;
      const response = await mcpUnity.sendRequest({
        method: resourceName,
        params: {
          testMode,
          nameFilter
        }
      });
      
      if (!response.success && response.error) {
        throw new McpUnityError(
          ErrorType.RESOURCE_FETCH,
          response.error.message || 'Failed to fetch tests from Unity'
        );
      }
      
      const testsResponse: TestsResponse = {
        tests: response.tests || [],
        count: response.count || 0,
        editModeCount: response.editModeCount || 0,
        playModeCount: response.playModeCount || 0
      };
      
      // Format the test data as JSON
      const testDataJson = JSON.stringify(testsResponse, null, 2);
      
      // Create a summary message
      const summaryMessage = `Found ${testsResponse.count} tests (${testsResponse.editModeCount} EditMode, ${testsResponse.playModeCount} PlayMode)`;
      
      return {
        _meta: {
          test_count: testsResponse.count,
          edit_mode_count: testsResponse.editModeCount,
          play_mode_count: testsResponse.playModeCount
        },
        contents: [
          {
            uri: 'data:text/plain',
            text: summaryMessage
          },
          {
            uri: 'data:application/json',
            text: testDataJson,
            mimeType: 'application/json'
          }
        ]
      };
    }
  };
}
