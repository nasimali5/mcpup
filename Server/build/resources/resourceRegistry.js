import { handleError } from '../utils/errors.js';
export class ResourceRegistry {
    resources = new Map();
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    add(resource) {
        this.resources.set(resource.name, resource);
    }
    getAll() {
        return Array.from(this.resources.values());
    }
    registerWithServer(server) {
        for (const resource of this.getAll()) {
            this.logger.info(`Registering resource with MCP server: ${resource.name}`);
            // Register the resource with the MCP server
            server.resource(resource.name, resource.uri, resource.metadata || {}, async (params) => {
                try {
                    this.logger.info(`Fetching resource: ${resource.name}`, params);
                    const result = await resource.handler(params);
                    this.logger.info(`Resource fetch successful: ${resource.name}`);
                    return result;
                }
                catch (error) {
                    this.logger.error(`Resource fetch failed: ${resource.name}`, error);
                    throw handleError(error, `Resource ${resource.name}`);
                }
            });
        }
    }
}
