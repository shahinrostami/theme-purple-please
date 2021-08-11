import { CustomError } from './custom-error';
export declare class UnsupportedOptionCombinationError extends CustomError {
    private static ERROR_MESSAGE;
    code: number;
    userMessage: string;
    constructor(options: string[]);
}
