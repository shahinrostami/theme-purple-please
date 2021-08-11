import { CustomError } from './custom-error';
export declare class FailedToRunTestError extends CustomError {
    private static ERROR_MESSAGE;
    constructor(userMessage: any, errorCode?: any);
}
