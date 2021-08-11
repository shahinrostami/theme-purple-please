import { CustomError } from './custom-error';
export declare class FeatureNotSupportedForOrgError extends CustomError {
    readonly org: string;
    constructor(org: string, feature?: string, additionalUserHelp?: string);
}
