import { z } from 'zod';
import { McpUnityError, ErrorType } from '../utils/errors.js';
export function createPackageManagerTool(mcpUnity, logger) {
    const toolName = 'package_manager';
    return {
        name: toolName,
        description: 'Manages packages in the Unity Package Manager',
        paramsSchema: z.object({
            methodSource: z.string().describe('The method source to use (registry, github, or disk) to add the package'),
            packageName: z.string().optional().describe('The package name to add from Unity registry (e.g. com.unity.textmeshpro)'),
            version: z.string().optional().describe('The version to use for registry packages (optional)'),
            repositoryUrl: z.string().optional().describe('The GitHub repository URL (e.g. https://github.com/username/repo.git)'),
            branch: z.string().optional().describe('The branch to use for GitHub packages (optional)'),
            path: z.string().optional().describe('The path to use (folder path for disk method or subfolder for GitHub)')
        }),
        handler: async (params) => {
            const { methodSource, packageName, version, repositoryUrl, branch, path } = params;
            // Validate required parameters based on method
            if (methodSource === 'registry' && !packageName) {
                throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "packageName" not provided for registry method');
            }
            else if (methodSource === 'github' && !repositoryUrl) {
                throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "repositoryUrl" not provided for github method');
            }
            else if (methodSource === 'disk' && !path) {
                throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "path" not provided for disk method');
            }
            // Send to Unity
            const response = await mcpUnity.sendRequest({
                method: toolName,
                params
            });
            if (!response.success) {
                throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to manage package with method: ${methodSource}`);
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
