import { handleError } from '../utils/errors.js';
export class ToolRegistry {
    tools = new Map();
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    add(tool) {
        this.tools.set(tool.name, tool);
    }
    getAll() {
        return Array.from(this.tools.values());
    }
    registerWithServer(server) {
        for (const tool of this.getAll()) {
            this.logger.info(`Registering tool with MCP server: ${tool.name}`);
            // Use the pattern from the restructuring plan
            server.tool(tool.name, tool.description, tool.paramsSchema.shape, async (params) => {
                try {
                    this.logger.info(`Executing tool: ${tool.name}`, params);
                    const result = await tool.handler(params);
                    this.logger.info(`Tool execution successful: ${tool.name}`);
                    return result;
                }
                catch (error) {
                    this.logger.error(`Tool execution failed: ${tool.name}`, error);
                    throw handleError(error, `Tool ${tool.name}`);
                }
            });
        }
    }
}
