import { CustomError } from './custom-error';
export declare class MissingOptionError extends CustomError {
    constructor(option: string, required: string[]);
}
