import { legacyPlugin as pluginApi } from '@snyk/cli-interface';
import { MultiProjectResultCustom } from './get-multi-plugin-result';
import { SupportedPackageManagers } from '../package-managers';
export declare function convertSingleResultToMultiCustom(inspectRes: pluginApi.SinglePackageResult, packageManager?: SupportedPackageManagers): MultiProjectResultCustom;
