import { DepGraph } from '@snyk/dep-graph';
import { ArgsOptions, MethodArgs } from '../cli/args';
export declare function countPathsToGraphRoot(graph: DepGraph): number;
export declare function obfuscateArgs(args: ArgsOptions | MethodArgs): ArgsOptions | MethodArgs;
