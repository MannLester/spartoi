import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ComponentManifest } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function validateManifest(filePath: string) {
    console.log(`Auditing schema profile: ${path.basename(filePath)}`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const manifest = JSON.parse(rawData) as ComponentManifest;

    const requiredKeys: Array<keyof ComponentManifest> = [
        'id','name', 'version', 'description', 'ecosystem', 'dependencies', 'environmentVariables', 'files', 'integration'
    ];

    for (const key of requiredKeys) {
        if (manifest[key] === undefined) {
            throw new Error(`Validation Error: Missing required key '${key}' in manifest ${filePath}`);
        }
    }

    const minifiedLength = JSON.stringify(manifest).length;
    const estimatedTokens = Math.ceil(minifiedLength / 4);

    console.log(`-> Minified character footprint: ${minifiedLength} chars`);
    console.log(`-> Estimated token footprint: ${estimatedTokens} tokens`);

    if (estimatedTokens > 300) {
        throw new Error('Budget Violation: Component metadat payload exceeds strict 300 token limit!');
    }

    console.log('Validation successful: Manifest is well-formed and within token budget.');
}

const targetPayload = path.resolve(__dirname, '../storage/rate-limiter.json');
validateManifest(targetPayload);