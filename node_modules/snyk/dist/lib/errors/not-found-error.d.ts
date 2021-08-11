import { CustomError } from './custom-error';
export declare class NotFoundError extends CustomError {
    private static ERROR_CODE;
    private static ERROR_MESSAGE;
    constructor(userMessage: any);
}
