import { AnnotatedIssue, CallPath, REACHABILITY } from '../../lib/snyk-test/legacy';
import { SampleReachablePaths } from './types';
export declare function formatReachability(reachability?: REACHABILITY): string;
export declare function getReachabilityText(reachability?: REACHABILITY): string;
export declare function getReachabilityJson(reachability?: REACHABILITY): string;
export declare function summariseReachableVulns(vulnerabilities: AnnotatedIssue[]): string;
export declare function formatReachablePaths(sampleReachablePaths: SampleReachablePaths | undefined, maxPathCount: number, template: (samplePaths: string[], extraPathsCount: number) => string): string;
export declare function formatReachablePath(path: CallPath): string;
