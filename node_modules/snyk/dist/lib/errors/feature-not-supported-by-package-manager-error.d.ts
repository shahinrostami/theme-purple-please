import { CustomError } from './custom-error';
import { SupportedPackageManagers } from '../package-managers';
export declare class FeatureNotSupportedByPackageManagerError extends CustomError {
    readonly feature: string;
    constructor(feature: string, packageManager: SupportedPackageManagers, additionalUserHelp?: string);
}
