import { CustomError } from '../../../errors/custom-error';
export declare class FeatureNotSupportedBySnykCodeError extends CustomError {
    readonly feature: string;
    constructor(feature: string, additionalUserHelp?: string);
}
