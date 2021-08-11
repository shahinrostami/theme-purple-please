import { GitTarget, ContainerTarget } from './types';
import { DepTree } from '../types';
import { ScannedProject } from '@snyk/cli-interface/legacy/common';
interface Options {
    'remote-repo-url'?: string;
    docker?: boolean;
    isDocker?: boolean;
}
export declare function getInfo(scannedProject: ScannedProject, options: Options, packageInfo?: DepTree): Promise<GitTarget | ContainerTarget | null>;
export {};
