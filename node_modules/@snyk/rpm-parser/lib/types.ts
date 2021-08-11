export interface IParserResponse {
  response: string;
  rpmMetadata?: IRpmMetadata;
  error?: ParserError;
}

export interface IRpmMetadata {
  packagesProcessed: number;
  packagesSkipped: number;
}

export class ParserError extends Error {
  readonly context: unknown | undefined;

  constructor(message: string, context?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.context = context;
  }
}
