/// <reference types="node" />
import { Writable } from 'stream';
import { Configuration } from './Configuration';
import { MessageName } from './MessageName';
import { Report, TimerOptions } from './Report';
import { Locator } from './types';
export declare type StreamReportOptions = {
    configuration: Configuration;
    forgettableBufferSize?: number;
    forgettableNames?: Set<MessageName | null>;
    includeFooter?: boolean;
    includeInfos?: boolean;
    includeLogs?: boolean;
    includeWarnings?: boolean;
    json?: boolean;
    stdout: Writable;
};
export declare function formatName(name: MessageName | null, { configuration, json }: {
    configuration: Configuration;
    json: boolean;
}): string;
export declare function formatNameWithHyperlink(name: MessageName | null, { configuration, json }: {
    configuration: Configuration;
    json: boolean;
}): string;
export declare class StreamReport extends Report {
    static start(opts: StreamReportOptions, cb: (report: StreamReport) => Promise<void>): Promise<StreamReport>;
    private configuration;
    private includeFooter;
    private includeInfos;
    private includeWarnings;
    private json;
    private stdout;
    private uncommitted;
    private cacheHitCount;
    private cacheMissCount;
    private warningCount;
    private errorCount;
    private startTime;
    private indent;
    private progress;
    private progressTime;
    private progressFrame;
    private progressTimeout;
    private progressStyle;
    private progressMaxScaledSize;
    private forgettableBufferSize;
    private forgettableNames;
    private forgettableLines;
    constructor({ configuration, stdout, json, includeFooter, includeLogs, includeInfos, includeWarnings, forgettableBufferSize, forgettableNames, }: StreamReportOptions);
    hasErrors(): boolean;
    exitCode(): 0 | 1;
    reportCacheHit(locator: Locator): void;
    reportCacheMiss(locator: Locator, message?: string): void;
    startTimerSync<T>(what: string, opts: TimerOptions, cb: () => T): void;
    startTimerSync<T>(what: string, cb: () => T): void;
    startTimerPromise<T>(what: string, opts: TimerOptions, cb: () => Promise<T>): Promise<void>;
    startTimerPromise<T>(what: string, cb: () => Promise<T>): Promise<void>;
    startCacheReport<T>(cb: () => Promise<T>): Promise<T>;
    reportSeparator(): void;
    reportInfo(name: MessageName | null, text: string): void;
    reportWarning(name: MessageName, text: string): void;
    reportError(name: MessageName, text: string): void;
    reportProgress(progressIt: AsyncIterable<{
        progress: number;
        title?: string;
    }>): {
        stop: () => void;
        then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<void | TResult>;
        [Symbol.toStringTag]: string;
        finally(onfinally?: (() => void) | null | undefined): Promise<void>;
    };
    reportJson(data: any): void;
    finalize(): Promise<void>;
    private writeLine;
    private writeLineWithForgettableReset;
    private writeLines;
    private reportCacheChanges;
    private commit;
    private clearProgress;
    private writeProgress;
    private refreshProgress;
    private truncate;
    private formatName;
    private formatNameWithHyperlink;
    private formatIndent;
}
