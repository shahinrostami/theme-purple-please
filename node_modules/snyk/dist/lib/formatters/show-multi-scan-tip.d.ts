import { SupportedPackageManagers } from '../package-managers';
import { Options, SupportedProjectTypes, TestOptions } from '../types';
export declare function showMultiScanTip(projectType: SupportedProjectTypes | SupportedPackageManagers, options: Options & TestOptions, foundProjectCount?: number): string;
