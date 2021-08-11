import { CustomError } from './custom-error';
export declare class InternalServerError extends CustomError {
    private static ERROR_CODE;
    private static ERROR_STRING_CODE;
    private static ERROR_MESSAGE;
    constructor(userMessage: any);
}
