/// <reference types="node" />
import { PortablePath } from '@yarnpkg/fslib';
import { CommandClass } from 'clipanion';
import { Writable, Readable } from 'stream';
import { PluginConfiguration, Configuration, ConfigurationDefinitionMap, PackageExtensionData } from './Configuration';
import { Fetcher } from './Fetcher';
import { Linker } from './Linker';
import { MessageName } from './MessageName';
import { Project, InstallOptions } from './Project';
import { Resolver, ResolveOptions } from './Resolver';
import { Workspace } from './Workspace';
import { Locator, Descriptor } from './types';
declare type ProcessEnvironment = {
    [key: string]: string;
};
export declare type CommandContext = {
    cwd: PortablePath;
    plugins: PluginConfiguration;
    quiet: boolean;
    stdin: Readable;
    stdout: Writable;
    stderr: Writable;
};
export interface FetcherPlugin {
    new (): Fetcher;
}
export interface LinkerPlugin {
    new (): Linker;
}
export interface ResolverPlugin {
    new (): Resolver;
}
export declare type Hooks = {
    registerPackageExtensions?: (configuration: Configuration, registerPackageExtension: (descriptor: Descriptor, extensionData: PackageExtensionData) => void) => Promise<void>;
    setupScriptEnvironment?: (project: Project, env: ProcessEnvironment, makePathWrapper: (name: string, argv0: string, args: Array<string>) => Promise<void>) => Promise<void>;
    wrapScriptExecution?: (executor: () => Promise<number>, project: Project, locator: Locator, scriptName: string, extra: {
        script: string;
        args: Array<string>;
        cwd: PortablePath;
        env: ProcessEnvironment;
        stdin: Readable | null;
        stdout: Writable;
        stderr: Writable;
    }) => Promise<() => Promise<number>>;
    globalHashGeneration?: (project: Project, contributeHash: (data: string | Buffer) => void) => Promise<void>;
    reduceDependency?: (dependency: Descriptor, project: Project, locator: Locator, initialDependency: Descriptor, extra: {
        resolver: Resolver;
        resolveOptions: ResolveOptions;
    }) => Promise<Descriptor>;
    afterAllInstalled?: (project: Project, options: InstallOptions) => void;
    validateProject?: (project: Project, report: {
        reportWarning: (name: MessageName, text: string) => void;
        reportError: (name: MessageName, text: string) => void;
    }) => void;
    validateWorkspace?: (workspace: Workspace, report: {
        reportWarning: (name: MessageName, text: string) => void;
        reportError: (name: MessageName, text: string) => void;
    }) => void;
    populateYarnPaths?: (project: Project, definePath: (path: PortablePath | null) => void) => Promise<void>;
};
export declare type Plugin<PluginHooks = any> = {
    configuration?: Partial<ConfigurationDefinitionMap>;
    commands?: Array<CommandClass<CommandContext>>;
    fetchers?: Array<FetcherPlugin>;
    linkers?: Array<LinkerPlugin>;
    resolvers?: Array<ResolverPlugin>;
    hooks?: PluginHooks;
};
export {};
