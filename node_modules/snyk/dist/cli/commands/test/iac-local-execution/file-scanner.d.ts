import { IacFileParsed, IacFileScanResult } from './types';
import { CustomError } from '../../../../lib/errors';
export declare function scanFiles(parsedFiles: Array<IacFileParsed>): Promise<IacFileScanResult[]>;
export declare function clearPolicyEngineCache(): void;
export declare class FailedToBuildPolicyEngine extends CustomError {
    constructor(message?: string);
}
export declare class FailedToExecutePolicyEngine extends CustomError {
    constructor(message?: string);
}
