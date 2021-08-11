import { CustomError } from './custom-error';
export declare class UnsupportedPackageManagerError extends CustomError {
    private static ERROR_MESSAGE;
    constructor(packageManager: any);
}
