import { PromiseDelegate } from '@phosphor/coreutils';
import { IRateLimiter } from './interfaces';
import { Poll } from './poll';
/**
 * A base class to implement rate limiters with different invocation strategies.
 *
 * @typeparam T - The resolved type of the underlying function.
 *
 * @typeparam U - The rejected type of the underlying function.
 */
export declare abstract class RateLimiter<T, U> implements IRateLimiter<T, U> {
    /**
     * Instantiate a rate limiter.
     *
     * @param fn - The function to rate limit.
     *
     * @param limit - The rate limit; defaults to 500ms.
     */
    constructor(fn: () => T | Promise<T>, limit?: number);
    /**
     * Whether the rate limiter is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Disposes the rate limiter.
     */
    dispose(): void;
    /**
     * The rate limit in milliseconds.
     */
    readonly limit: number;
    /**
     * Invoke the rate limited function.
     */
    abstract invoke(): Promise<T>;
    /**
     * Stop the function if it is mid-flight.
     */
    stop(): Promise<void>;
    /**
     * A promise that resolves on each successful invocation.
     */
    protected payload: PromiseDelegate<T> | null;
    /**
     * The underlying poll instance used by the rate limiter.
     */
    protected poll: Poll<T, U, 'invoked'>;
}
/**
 * Wraps and debounces a function that can be called multiple times and only
 * executes the underlying function one `interval` after the last invocation.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 */
export declare class Debouncer<T = any, U = any> extends RateLimiter<T, U> {
    /**
     * Invokes the function and only executes after rate limit has elapsed.
     * Each invocation resets the timer.
     */
    invoke(): Promise<T>;
}
/**
 * Wraps and throttles a function that can be called multiple times and only
 * executes the underlying function once per `interval`.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 */
export declare class Throttler<T = any, U = any> extends RateLimiter<T, U> {
    /**
     * Throttles function invocations if one is currently in flight.
     */
    invoke(): Promise<T>;
}
