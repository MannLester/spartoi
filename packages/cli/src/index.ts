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

    const targetConfigPath = path.join(cwd, 'spartoi.json');
    fs.writeFileSync(targetConfigPath, JSON.stringify(configPayload, null, 2), 'utf-8');
    console.log('✅ Successfully generated root tracking anchor state: spartoi.json');
  });

// --- CHUNK 3 & 4: INJECTION TRANSPORT & VERIFICATION CORE ---
// --- CHUNK 3 & 4: INJECTION TRANSPORT & VERIFICATION CORE ---
program
  .command('add')
  .description('Inject a standalone backend feature component from the cloud registry')
  .argument('<module-id>', 'The identification key token string of the target module')
  .option('-f, --force', 'Force overwrite modifications if code drift exists')
  .action(async (moduleId, options) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, 'spartoi.json');

    if (!fs.existsSync(configPath)) {
      console.error('❌ Error: Project configuration tracking file not found. Run "init" command first.');
      process.exit(1);
    }

    const normalizedModuleId = moduleId.trim();
    
    // Dynamic filename mapper to support our expanding catalog seamlessly
    const fileMapping: Record<string, string> = {
      'nextjs-native-rate-limiter': 'rate-limiter',
      'native-jwt-auth': 'jwt-auth',
      'error-sanitizer': 'error-sanitizer'
    };
    const fileNameKey = fileMapping[normalizedModuleId] || normalizedModuleId;

    const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const destinationFolder = path.join(cwd, localConfig.targetDirectory);
    const targetFileDestination = path.join(destinationFolder, `${fileNameKey}.ts`);

    let isStagedRun = false;
    let stagedPath = '';

    // 1. Drift Protection Check
    if (fs.existsSync(targetFileDestination)) {
      console.log('🔍 Existing module file detected. Analyzing code drift configurations...');
      const existingRecord = localConfig.installedModules[normalizedModuleId];
      
      if (existingRecord && existingRecord.fileHash) {
        const currentDiskContent = fs.readFileSync(targetFileDestination, 'utf-8');
        const currentDiskHash = calculateHash(currentDiskContent);

        if (currentDiskHash !== existingRecord.fileHash) {
          console.warn(`⚠️ WARNING: Local modifications detected inside: ${localConfig.targetDirectory}/${fileNameKey}.ts`);
          
          if (!options.force) {
            console.warn('✨ Code drift detected! Diverting target to local staging buffer...');
            
            const sandboxDir = path.join(cwd, '.spartoi', 'tmp');
            fs.mkdirSync(sandboxDir, { recursive: true });
            
            stagedPath = path.join(sandboxDir, `${fileNameKey}.ts`);
            isStagedRun = true;
            
            console.log(` -> Staging incoming template structure into sandbox: .spartoi/tmp/${fileNameKey}.ts`);
          } else {
            console.log('   "--force" flag detected. Overriding safety blocks to execute package payload refresh...');
          }
        } else {
          console.log('   No file mutations discovered. Proceeding with clean configuration updates.');
        }
      }
    }

    console.log('🌐 Fetching component registry profile from cloud distribution channel...');

    // Fully dynamic cloud vectors matching your GitHub workspace
    const baseUrl = 'https://raw.githubusercontent.com/MannLester/spartoi/main/packages/registry/storage/';
    const manifestUrl = `${baseUrl}${fileNameKey}.json`;
    const templateUrl = `${baseUrl}${fileNameKey}.template.txt`;

    try {
      const networkHeaders = { 'User-Agent': 'Spartoi-CLI-Engine' };

      // Stream Manifest Metadata from GitHub
      const manifestResponse = await fetch(manifestUrl, { headers: networkHeaders });
      if (!manifestResponse.ok) {
        throw new Error(`Cloud Registry returned HTTP status ${manifestResponse.status} for ${fileNameKey}.json`);
      }
      const manifestMetadata = await manifestResponse.json() as any;

      // Stream Code Template from GitHub
      const templateResponse = await fetch(templateUrl, { headers: networkHeaders });
      if (!templateResponse.ok) {
        throw new Error(`Cloud Registry returned HTTP status ${templateResponse.status} for ${fileNameKey}.template.txt`);
      }
      const rawTemplateContent = await templateResponse.text();

      console.log(`📦 Extracting component feature module: [${moduleId}]...`);
      fs.mkdirSync(destinationFolder, { recursive: true });

      const trackingFingerprint = calculateHash(rawTemplateContent);
      
      // 2. Determine exact write destination based on staging status
      const actualWriteDestination = isStagedRun ? stagedPath : targetFileDestination;
      fs.writeFileSync(actualWriteDestination, rawTemplateContent, 'utf-8');

      if (isStagedRun) {
        console.log(`💾 Incoming cloud source safely staged at: .spartoi/tmp/${fileNameKey}.ts`);
        console.warn('⚠️ Action Required: Resolve the logic differences manually or run with --force to overwrite your changes.');
        process.exit(0); 
      }

      console.log(` -> Generated standalone component source: ${localConfig.targetDirectory}/${fileNameKey}.ts`);

      // Inject Documentation
      const readmeContent = [
        `# Local Backend Module: ${manifestMetadata.name}`,
        'Generated by Spartoi Core Framework remote cloud engines.',
        '',
        '## Component Specifications Summary',
        `* Description: ${manifestMetadata.description}`,
        `* Framework Target Environment: ${manifestMetadata.ecosystem.framework}`,
        '',
        '## AI Standard Usage Code Snippet Hook',
        '```typescript',
        manifestMetadata.integration.snippet,
        '```'
      ].join('\n');

      fs.writeFileSync(path.join(destinationFolder, 'README.md'), readmeContent, 'utf-8');
      console.log(` -> Injected semantic AI documentation file: ${localConfig.targetDirectory}/README.md`);

      // Sync local state tracking
      localConfig.installedModules[moduleId] = {
        version: manifestMetadata.version,
        installedAt: new Date().toISOString(),
        fileHash: trackingFingerprint
      };
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2), 'utf-8');
      console.log('✅ Component deployment from cloud execution completed successfully.');

    } catch (networkError: any) {
      console.error('❌ Network Connection Failure: Unable to fetch assets from the live cloud registry.');
      console.error(`   Diagnostic Reason: ${networkError.message}`);
      process.exit(1);
    }
  });

program.parse();