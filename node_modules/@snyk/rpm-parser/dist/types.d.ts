export interface IParserResponse {
    response: string;
    rpmMetadata?: IRpmMetadata;
    error?: ParserError;
}
export interface IRpmMetadata {
    packagesProcessed: number;
    packagesSkipped: number;
}
export declare class ParserError extends Error {
    readonly context: unknown | undefined;
    constructor(message: string, context?: unknown);
}
