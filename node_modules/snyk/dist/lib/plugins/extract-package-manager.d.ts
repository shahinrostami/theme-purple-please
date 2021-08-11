import * as cliInterface from '@snyk/cli-interface';
import { ScannedProjectCustom } from './get-multi-plugin-result';
import { SupportedPackageManagers } from '../package-managers';
export declare function extractPackageManager(scannedProject: ScannedProjectCustom, pluginRes: cliInterface.legacyPlugin.MultiProjectResult, options: {
    packageManager?: SupportedPackageManagers;
}): SupportedPackageManagers | undefined;
