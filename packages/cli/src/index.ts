import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { Command } from 'commander';

const program = new Command();

program
  .name('spartoi')
  .description('Ejectable Backend Component Registry CLI')
  .version('1.0.0');

// Helper function to calculate SHA-256 hash of string content
function calculateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// --- CHUNK 2: INITIALIZATION COMMAND ---
program
  .command('init')
  .description('Initialize spartoi configuration inside your project')
  .action(() => {
    const cwd = process.cwd();
    console.log('🚀 Initializing spartoi environment...');

    let detectedAlias = '@/*'; 
    const tsconfigPath = path.join(cwd, 'tsconfig.json');

    if (fs.existsSync(tsconfigPath)) {
      try {
        const rawTsConfig = fs.readFileSync(tsconfigPath, 'utf-8');
        const cleanJsonString = rawTsConfig.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        const tsconfig = JSON.parse(cleanJsonString);

        const paths = tsconfig.compilerOptions?.paths;
        if (paths) {
          const keys = Object.keys(paths);
          if (keys.length > 0) {
            detectedAlias = keys[0]; 
            console.log('Detected existing path configuration mapping alias: "' + detectedAlias + '"');
          }
        }
      } catch (error) {
        console.log('⚠️ Unable to parse tsconfig.json fully. Reverting to default alias configurations.');
      }
    }

    const configPayload = {
      language: 'typescript',
      framework: 'nextjs',
      targetDirectory: './lib/backend',
      importAlias: detectedAlias,
      installedModules: {}
    };

    const targetConfigPath = path.join(cwd, 'components.json');
    fs.writeFileSync(targetConfigPath, JSON.stringify(configPayload, null, 2), 'utf-8');
    console.log('✅ Successfully generated root tracking anchor state: components.json');
  });

// --- CHUNK 3 & 4: INJECTION TRANSPORT & VERIFICATION CORE ---
program
  .command('add')
  .description('Inject a standalone backend feature component into your project')
  .argument('<module-id>', 'The identification key token string of the target module')
  .option('-f, --force', 'Force overwrite modifications if code drift exists')
  .action((moduleId, options) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, 'components.json');

    if (!fs.existsSync(configPath)) {
      console.error('❌ Error: Project configuration tracking file not found. Run "init" command first.');
      process.exit(1);
    }

    const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const destinationFolder = path.join(cwd, localConfig.targetDirectory);
    const targetFileDestination = path.join(destinationFolder, 'rate-limiter.ts');

    // CHUNK 4 DRIFT ASSESSMENT ANALYSIS: Check if file already exists locally
    if (fs.existsSync(targetFileDestination)) {
      console.log('🔍 Existing module file detected. Analyzing code drift configurations...');
      
      const existingRecord = localConfig.installedModules[moduleId];
      
      if (existingRecord && existingRecord.fileHash) {
        const currentDiskContent = fs.readFileSync(targetFileDestination, 'utf-8');
        const currentDiskHash = calculateHash(currentDiskContent);

        // Compare current disk snapshot to historical registration hash
        if (currentDiskHash !== existingRecord.fileHash) {
          console.warn('⚠️ WARNING: Local modifications detected inside: ' + localConfig.targetDirectory + '/rate-limiter.ts');
          
          if (!options.force) {
            console.error('❌ Overwrite Blocked: Your file has custom logic modifications.');
            console.error('   To safely bypass this safety valve protection block, append the "--force" flag.');
            process.exit(1);
          }
          console.log('   "--force" flag detected. Overriding safety blocks to execute package payload refresh...');
        } else {
          console.log('   No file mutations discovered. Proceeding with clean configuration updates.');
        }
      }
    }

    console.log('📦 Extracting component feature module: [' + moduleId + ']...');

    const registryManifestPath = path.join(cwd, 'packages', 'registry', 'storage', 'rate-limiter.json');
    const registryTemplatePath = path.join(cwd, 'packages', 'registry', 'storage', 'rate-limiter.template.txt');

    if (!fs.existsSync(registryManifestPath) || !fs.existsSync(registryTemplatePath)) {
      console.error('❌ Error: Core component not found inside registry database mappings.');
      process.exit(1);
    }

    fs.mkdirSync(destinationFolder, { recursive: true });

    const rawTemplateContent = fs.readFileSync(registryTemplatePath, 'utf-8');
    
    // Calculate fingerprint hash of the exact pristine code template being written
    const trackingFingerprint = calculateHash(rawTemplateContent);

    fs.writeFileSync(targetFileDestination, rawTemplateContent, 'utf-8');
    console.log('  -> Generated standalone component source: ' + localConfig.targetDirectory + '/rate-limiter.ts');

    const manifestMetadata = JSON.parse(fs.readFileSync(registryManifestPath, 'utf-8'));
    const readmeContent = [
      '# Local Backend Module: ' + manifestMetadata.name,
      'Generated by Spartoi Framework tooling mechanisms.',
      '',
      '## Component Specifications Summary',
      '* Description: ' + manifestMetadata.description,
      '* Framework Target Environment: ' + manifestMetadata.ecosystem.framework,
      '',
      '## AI Standard Usage Code Snippet Hook',
      '```typescript',
      manifestMetadata.integration.snippet,
      '```'
    ].join('\n');

    fs.writeFileSync(path.join(destinationFolder, 'README.md'), readmeContent, 'utf-8');
    console.log('  -> Injected semantic AI documentation file: ' + localConfig.targetDirectory + '/README.md');

    // Update root state tracking mapping with cryptographic fingerprint hash data
    localConfig.installedModules[moduleId] = {
      version: manifestMetadata.version,
      installedAt: new Date().toISOString(),
      fileHash: trackingFingerprint
    };
    fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2), 'utf-8');

    console.log('✅ Component deployment execution completed successfully.');
  });

program.parse();