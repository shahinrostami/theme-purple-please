import { CustomError } from './custom-error';
import { SupportedPackageManagers } from '../package-managers';
import { Ecosystem } from '../ecosystems/types';
export declare class FeatureNotSupportedByEcosystemError extends CustomError {
    readonly feature: string;
    constructor(feature: string, ecosystem: SupportedPackageManagers | Ecosystem);
}
