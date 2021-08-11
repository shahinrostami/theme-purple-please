import { MessageName } from './MessageName';
import { Report, TimerOptions } from './Report';
import { Locator } from './types';
export declare class ThrowReport extends Report {
    reportCacheHit(locator: Locator): void;
    reportCacheMiss(locator: Locator): void;
    startTimerSync<T>(what: string, opts: TimerOptions, cb: () => T): void;
    startTimerSync<T>(what: string, cb: () => T): void;
    startTimerPromise<T>(what: string, opts: TimerOptions, cb: () => Promise<T>): Promise<void>;
    startTimerPromise<T>(what: string, cb: () => Promise<T>): Promise<void>;
    startCacheReport<T>(cb: () => Promise<T>): Promise<T>;
    reportSeparator(): void;
    reportInfo(name: MessageName | null, text: string): void;
    reportWarning(name: MessageName, text: string): void;
    reportError(name: MessageName, text: string): void;
    reportProgress(progress: AsyncIterable<{
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
}
