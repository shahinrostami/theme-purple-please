import { PortablePath } from '@yarnpkg/fslib';
import { Manifest } from './Manifest';
import { Project } from './Project';
import { IdentHash } from './types';
import { Descriptor, Locator } from './types';
export declare class Workspace {
    readonly project: Project;
    readonly cwd: PortablePath;
    readonly relativeCwd: PortablePath;
    readonly anchoredDescriptor: Descriptor;
    readonly anchoredLocator: Locator;
    readonly locator: Locator;
    readonly manifest: Manifest;
    readonly workspacesCwds: Set<PortablePath>;
    dependencies: Map<IdentHash, Descriptor>;
    constructor(workspaceCwd: PortablePath, { project }: {
        project: Project;
    });
    setup(): Promise<void>;
    accepts(range: string): boolean;
    computeCandidateName(): string;
    persistManifest(): Promise<void>;
}
