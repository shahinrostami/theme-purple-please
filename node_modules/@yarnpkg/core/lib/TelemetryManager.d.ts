import { PortablePath } from '@yarnpkg/fslib';
import { Configuration } from './Configuration';
export declare enum MetricName {
    VERSION = "version",
    COMMAND_NAME = "commandName",
    PLUGIN_NAME = "pluginName",
    INSTALL_COUNT = "installCount",
    PROJECT_COUNT = "projectCount",
    WORKSPACE_COUNT = "workspaceCount",
    DEPENDENCY_COUNT = "dependencyCount",
    EXTENSION = "packageExtension"
}
export declare type RegistryBlock = {
    values?: {
        [key in MetricName]?: Array<string>;
    };
    hits?: {
        [key in MetricName]?: {
            [extra: string]: number;
        };
    };
    enumerators?: {
        [key in MetricName]?: Array<string>;
    };
};
export declare type RegistryFile = {
    lastUpdate?: number;
    blocks?: {
        [userId: string]: RegistryBlock;
    };
};
export declare class TelemetryManager {
    private configuration;
    private values;
    private hits;
    private enumerators;
    isNew: boolean;
    constructor(configuration: Configuration, accountId: string);
    reportVersion(value: string): void;
    reportCommandName(value: string): void;
    reportPluginName(value: string): void;
    reportProject(cwd: PortablePath): void;
    reportInstall(nodeLinker: string): void;
    reportPackageExtension(value: string): void;
    reportWorkspaceCount(count: number): void;
    reportDependencyCount(count: number): void;
    private reportValue;
    private reportEnumerator;
    private reportHit;
    private getRegistryPath;
    private sendReport;
    private applyChanges;
    private startBuffer;
}
