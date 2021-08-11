import { CallGraph } from '@snyk/cli-interface/legacy/common';
import { SupportedPackageManagers } from './package-managers';
import { MonitorOptions, Options, TestOptions } from './types';
export declare function serializeCallGraphWithMetrics(callGraph: CallGraph): {
    callGraph: any;
    nodeCount: number;
    edgeCount: number;
};
export declare function validatePayload(org: any, options: (Options & TestOptions) | (Options & MonitorOptions), packageManager?: SupportedPackageManagers): Promise<boolean>;
