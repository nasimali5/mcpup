import { Logger } from '../utils/logger.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { ResourceDefinition } from './resourceRegistry.js';
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
export declare function createGetTestsResource(mcpUnity: McpUnity, logger: Logger): ResourceDefinition;
