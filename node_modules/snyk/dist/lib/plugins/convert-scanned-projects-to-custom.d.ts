import * as cliInterface from '@snyk/cli-interface';
import { ScannedProjectCustom } from './get-multi-plugin-result';
import { SupportedPackageManagers } from '../package-managers';
import { PluginMetadata } from '@snyk/cli-interface/legacy/plugin';
export declare function convertScannedProjectsToCustom(scannedProjects: cliInterface.legacyCommon.ScannedProject[], pluginMeta: PluginMetadata, packageManager?: SupportedPackageManagers, targetFile?: string): ScannedProjectCustom[];
