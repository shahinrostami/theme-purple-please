import { CustomError } from './custom-error';
export declare class MonitorError extends CustomError {
    private static ERROR_MESSAGE;
    constructor(errorCode: any, message: any);
}
