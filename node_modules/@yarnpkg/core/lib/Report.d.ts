/// <reference types="node" />
import { PassThrough } from 'stream';
import { MessageName } from './MessageName';
import { Locator } from './types';
export declare class ReportError extends Error {
    reportExtra?: ((report: Report) => void) | undefined;
    reportCode: MessageName;
    constructor(code: MessageName, message: string, reportExtra?: ((report: Report) => void) | undefined);
}
export declare function isReportError(error: Error): error is ReportError;
export declare type ProgressDefinition = {
    progress: number;
    title?: string;
};
export declare type TimerOptions = {
    skipIfEmpty?: boolean;
};
export declare abstract class Report {
    private reportedInfos;
    private reportedWarnings;
    private reportedErrors;
    abstract reportCacheHit(locator: Locator): void;
    abstract reportCacheMiss(locator: Locator, message?: string): void;
    abstract startTimerPromise<T>(what: string, opts: TimerOptions, cb: () => Promise<T>): Promise<T>;
    abstract startTimerPromise<T>(what: string, cb: () => Promise<T>): Promise<T>;
    abstract startTimerSync<T>(what: string, opts: TimerOptions, cb: () => T): T;
    abstract startTimerSync<T>(what: string, cb: () => T): T;
    abstract startCacheReport<T>(cb: () => Promise<T>): Promise<T>;
    abstract reportSeparator(): void;
    abstract reportInfo(name: MessageName | null, text: string): void;
    abstract reportWarning(name: MessageName, text: string): void;
    abstract reportError(name: MessageName, text: string): void;
    abstract reportProgress(progress: AsyncIterable<ProgressDefinition>): Promise<void> & {
        stop: () => void;
    };
    abstract reportJson(data: any): void;
    abstract finalize(): void;
    static progressViaCounter(max: number): {
        [Symbol.asyncIterator](): AsyncGenerator<{
            progress: number;
        }, void, unknown>;
        set: (n: number) => void;
        tick: (n?: number) => void;
    };
    reportInfoOnce(name: MessageName, text: string, opts?: {
        key?: any;
    }): void;
    reportWarningOnce(name: MessageName, text: string, opts?: {
        key?: any;
    }): void;
    reportErrorOnce(name: MessageName, text: string, opts?: {
        key?: any;
        reportExtra?: (report: Report) => void;
    }): void;
    reportExceptionOnce(error: Error | ReportError): void;
    createStreamReporter(prefix?: string | null): PassThrough;
}
