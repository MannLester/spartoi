import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
// Initialize the standalone protocol server container instance
const server = new Server({
    name: 'backend-shadcn-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {}, // Advertise tool-calling capabilities to connected models
    },
});
// Helper method to execute cryptographic checks
function calculateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}
// 1. Tool Discovery Layer: Map available tools for AI processing engines
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'init_project',
                description: 'Initialize the backend-shadcn tracking configuration file (components.json) inside the root directory workspace.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'inject_component',
                description: 'Fetch, customize, and write a standalone, zero-dependency backend module directly into the codebase directories.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        moduleId: {
                            type: 'string',
                            description: 'The identification token tag string of the component (e.g., "nextjs-native-rate-limiter").',
                        },
                    },
                    required: ['moduleId'],
                },
            },
        ],
    };
});
// 2. Tool Execution Layer: Intercept incoming JSON-RPC calls and run system engines
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const cwd = process.cwd();
    // ROUTE A: Project Initialization tool mapping
    if (name === 'init_project') {
        let detectedAlias = '@/*';
        const tsconfigPath = path.join(cwd, 'tsconfig.json');
        if (fs.existsSync(tsconfigPath)) {
            try {
                const rawTsConfig = fs.readFileSync(tsconfigPath, 'utf-8');
                const cleanJsonString = rawTsConfig.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
                const tsconfig = JSON.parse(cleanJsonString);
                const paths = tsconfig.compilerOptions?.paths;
                if (paths && Object.keys(paths).length > 0) {
                    detectedAlias = Object.keys(paths)[0];
                }
            }
            catch (e) {
                // Fallback silently if tsconfig cannot be parsed
            }
        }
        const configPayload = {
            language: 'typescript',
            framework: 'nextjs',
            targetDirectory: './lib/backend',
            importAlias: detectedAlias,
            installedModules: {}
        };
        fs.writeFileSync(path.join(cwd, 'components.json'), JSON.stringify(configPayload, null, 2), 'utf-8');
        return {
            content: [{ type: 'text', text: '✅ Project successfully initialized with tracking state anchor.' }],
        };
    }
    // ROUTE B: Component Injection tool mapping
    if (name === 'inject_component') {
        const moduleId = args?.moduleId;
        const configPath = path.join(cwd, 'components.json');
        if (!fs.existsSync(configPath)) {
            return {
                isError: true,
                content: [{ type: 'text', text: '❌ Error: Project configuration tracking file not found. Call init_project first.' }],
            };
        }
        const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const destinationFolder = path.join(cwd, localConfig.targetDirectory);
        const targetFileDestination = path.join(destinationFolder, 'rate-limiter.ts');
        // Run safety verification checks inside the protocol context execution
        if (fs.existsSync(targetFileDestination)) {
            const existingRecord = localConfig.installedModules[moduleId];
            if (existingRecord && existingRecord.fileHash) {
                const currentDiskContent = fs.readFileSync(targetFileDestination, 'utf-8');
                const currentDiskHash = calculateHash(currentDiskContent);
                if (currentDiskHash !== existingRecord.fileHash) {
                    return {
                        isError: true,
                        content: [{ type: 'text', text: '❌ Overwrite Blocked: Local modifications detected. Tool execution aborted safely.' }],
                    };
                }
            }
        }
        const registryManifestPath = path.join(cwd, 'packages', 'registry', 'storage', 'rate-limiter.json');
        const registryTemplatePath = path.join(cwd, 'packages', 'registry', 'storage', 'rate-limiter.template.txt');
        if (!fs.existsSync(registryManifestPath) || !fs.existsSync(registryTemplatePath)) {
            return {
                isError: true,
                content: [{ type: 'text', text: '❌ Error: Target module payload does not exist inside central storage mappings.' }],
            };
        }
        fs.mkdirSync(destinationFolder, { recursive: true });
        const rawTemplateContent = fs.readFileSync(registryTemplatePath, 'utf-8');
        const trackingFingerprint = calculateHash(rawTemplateContent);
        fs.writeFileSync(targetFileDestination, rawTemplateContent, 'utf-8');
        const manifestMetadata = JSON.parse(fs.readFileSync(registryManifestPath, 'utf-8'));
        const readmeContent = [
            '# Local Backend Module: ' + manifestMetadata.name,
            'Generated by Backend-Shadcn Framework tooling mechanisms via MCP.',
            '',
            '## Component Specifications Summary',
            '* Description: ' + manifestMetadata.description,
            '## AI Standard Usage Code Snippet Hook',
            '```typescript',
            manifestMetadata.integration.snippet,
            '```'
        ].join('\n');
        fs.writeFileSync(path.join(destinationFolder, 'README.md'), readmeContent, 'utf-8');
        localConfig.installedModules[moduleId] = {
            version: manifestMetadata.version,
            installedAt: new Date().toISOString(),
            fileHash: trackingFingerprint
        };
        fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2), 'utf-8');
        return {
            content: [{ type: 'text', text: '✅ Component [' + moduleId + '] safely injected into local workspace paths.' }],
        };
    }
    throw new Error('Requested tool function route not mapped.');
});
// Bind transport channel listeners to native stdio communication channels
const transport = new StdioServerTransport();
await server.connect(transport);
// We log status statements to standard error (stderr) because standard output (stdout)
// is strictly reserved for pure JSON-RPC message packets.
console.error('🚀 Backend-Shadcn Protocol Server actively listening over stdio stream...');
