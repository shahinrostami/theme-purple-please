import { CustomError } from './custom-error';
export declare class FailedToGetVulnerabilitiesError extends CustomError {
    private static ERROR_CODE;
    private static ERROR_STRING_CODE;
    private static ERROR_MESSAGE;
    constructor(userMessage: any, statusCode: any);
}
