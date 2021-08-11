import { legacyPlugin as pluginApi } from '@snyk/cli-interface';
import { TestOptions, Options, MonitorOptions } from '../types';
export declare function getSinglePluginResult(root: string, options: Options & (TestOptions | MonitorOptions), targetFile?: string): Promise<pluginApi.InspectResult>;
