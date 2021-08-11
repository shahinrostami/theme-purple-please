import { CustomError } from './custom-error';
export declare class DockerImageNotFoundError extends CustomError {
    private static ERROR_CODE;
    constructor(image: string);
}
