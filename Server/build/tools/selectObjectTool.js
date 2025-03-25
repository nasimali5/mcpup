import { z } from 'zod';
import { McpUnityError, ErrorType } from '../utils/errors.js';
export function createSelectObjectTool(mcpUnity, logger) {
    const toolName = 'select_object';
    return {
        name: toolName,
        description: 'Sets the selected object in the Unity editor by path or ID',
        paramsSchema: z.object({
            objectPath: z.string().describe('The path or ID of the object to select (e.g. "Main Camera" or a Unity object ID)')
        }),
        handler: async ({ objectPath }) => {
            const response = await mcpUnity.sendRequest({
                method: toolName,
                params: { objectPath }
            });
            if (!response.success) {
                throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to select object: ${objectPath}`);
            }
            return {
                success: true,
                message: response.message,
                content: [{
                        type: response.type,
                        text: response.message || `Successfully selected object: ${objectPath}`
                    }]
            };
        }
    };
}
