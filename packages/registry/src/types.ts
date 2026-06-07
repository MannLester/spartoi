export interface EnvironmentEcosystem {
    language: string;
    framework: string;
    runtime: string;
}

export interface DependencyMap {
    npm?: string[];
    pip?: string[];
}

export interface EnvVariableRequirement {
    key: string;
    required: boolean;
    description: string;
}

export interface TargetFileMapping {
    targetPath: string;
    templateUrl: string;
}

export interface IntegrationSpec {
    snippet: string;
    parameters: Array<{
        name: string;
        type: string;
        description: string;
    }>;
}

export interface ComponentManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    ecosystem: EnvironmentEcosystem;
    dependencies: DependencyMap;
    environmentVariables: EnvVariableRequirement[];
    files: TargetFileMapping[];
    integration: IntegrationSpec[];
}