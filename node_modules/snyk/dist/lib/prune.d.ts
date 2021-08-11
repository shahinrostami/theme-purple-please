import { DepGraph } from '@snyk/dep-graph';
import { SupportedPackageManagers } from './package-managers';
export declare function pruneGraph(depGraph: DepGraph, packageManager: SupportedPackageManagers, pruneIsRequired?: boolean): Promise<DepGraph>;
