import * as depGraphLib from '@snyk/dep-graph';
import { Options, MonitorOptions } from './types';
import { legacyCommon as legacyApi } from '@snyk/cli-interface';
export declare function maybePrintDepGraph(options: Options | MonitorOptions, depGraph: depGraphLib.DepGraph): Promise<void>;
export declare function maybePrintDepTree(options: Options | MonitorOptions, rootPackage: legacyApi.DepTree): void;
