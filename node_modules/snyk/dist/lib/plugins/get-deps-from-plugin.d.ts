import { legacyPlugin as pluginApi } from '@snyk/cli-interface';
import { Options, TestOptions, MonitorOptions } from '../types';
import { MultiProjectResultCustom } from './get-multi-plugin-result';
import { ScannedProject } from '@snyk/cli-interface/legacy/common';
export declare function getDepsFromPlugin(root: string, options: Options & (TestOptions | MonitorOptions)): Promise<pluginApi.MultiProjectResult | MultiProjectResultCustom>;
export declare function warnSomeGradleManifestsNotScanned(scannedProjects: ScannedProject[], allFilesFound: string[], root: string): string | null;
