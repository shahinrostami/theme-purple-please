import { MonitorOptions, Options, TestOptions } from './types';
import { SupportedPackageManagers } from './package-managers';
export declare function validateOptions(options: (Options & TestOptions) | (Options & MonitorOptions), packageManager?: SupportedPackageManagers): Promise<void>;
