import { legacyPlugin as pluginApi } from '@snyk/cli-interface';
import { Options } from '../types';
export declare function getExtraProjectCount(root: string, options: Options, inspectResult: pluginApi.InspectResult): Promise<number | undefined>;
