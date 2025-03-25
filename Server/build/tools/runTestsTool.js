import { z } from 'zod';
import { McpUnityError, ErrorType } from '../utils/errors.js';
// Function to wait for a specified time
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export function createRunTestsTool(mcpUnity, logger) {
    const toolName = 'run_tests';
    return {
        name: toolName,
        description: 'Runs Unity\'s Test Runner tests',
        paramsSchema: z.object({
            testMode: z.string().optional().describe('The test mode to run (EditMode, PlayMode, or All)'),
            testFilter: z.string().optional().describe('Optional test filter (e.g. specific test name or namespace)')
        }),
        handler: async ({ testMode = 'All', testFilter }) => {
            try {
                // Create and wait for the test run
                const response = await mcpUnity.sendRequest({
                    method: toolName,
                    params: {
                        testMode,
                        testFilter
                    }
                });
                // Process the test results
                if (!response.success) {
                    throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to run tests: Mode=${testMode}, Filter=${testFilter || 'none'}`);
                }
                // Extract test results
                const testResults = response.results || [];
                const testCount = response.testCount || 0;
                const passCount = response.passCount || 0;
                // Format the result message
                let resultMessage = `${passCount}/${testCount} tests passed`;
                if (testCount > 0 && passCount < testCount) {
                    resultMessage += `. Failed tests: ${testResults
                        .filter((r) => r.result !== 'Passed')
                        .map((r) => r.name)
                        .join(', ')}`;
                }
                return {
                    success: response.success,
                    message: resultMessage,
                    content: [
                        {
                            type: 'text',
                            text: response.message || resultMessage
                        },
                        {
                            type: 'text',
                            text: JSON.stringify({
                                testCount,
                                passCount,
                                failCount: testCount - passCount,
                                results: testResults
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                // Handle errors during test execution
                logger.error(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
                if (error instanceof McpUnityError) {
                    throw error;
                }
                throw new McpUnityError(ErrorType.TOOL_EXECUTION, `Failed to run tests: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    };
}
