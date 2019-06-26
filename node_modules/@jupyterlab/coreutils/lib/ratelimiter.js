"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const poll_1 = require("./poll");
/**
 * A base class to implement rate limiters with different invocation strategies.
 *
 * @typeparam T - The resolved type of the underlying function.
 *
 * @typeparam U - The rejected type of the underlying function.
 */
class RateLimiter {
    /**
     * Instantiate a rate limiter.
     *
     * @param fn - The function to rate limit.
     *
     * @param limit - The rate limit; defaults to 500ms.
     */
    constructor(fn, limit = 500) {
        /**
         * A promise that resolves on each successful invocation.
         */
        this.payload = null;
        this.limit = limit;
        this.poll = new poll_1.Poll({
            auto: false,
            factory: async () => await fn(),
            frequency: { backoff: false, interval: poll_1.Poll.NEVER, max: poll_1.Poll.NEVER },
            standby: 'never'
        });
        this.payload = new coreutils_1.PromiseDelegate();
        this.poll.ticked.connect((_, state) => {
            const { payload } = this;
            if (state.phase === 'resolved') {
                this.payload = new coreutils_1.PromiseDelegate();
                payload.resolve(state.payload || undefined);
                return;
            }
            if (state.phase === 'rejected' || state.phase === 'stopped') {
                this.payload = new coreutils_1.PromiseDelegate();
                payload.promise.catch(_ => undefined);
                payload.reject(state.payload);
                return;
            }
        }, this);
    }
    /**
     * Whether the rate limiter is disposed.
     */
    get isDisposed() {
        return this.payload === null;
    }
    /**
     * Disposes the rate limiter.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.payload = null;
        this.poll.dispose();
    }
    /**
     * Stop the function if it is mid-flight.
     */
    async stop() {
        return this.poll.stop();
    }
}
exports.RateLimiter = RateLimiter;
/**
 * Wraps and debounces a function that can be called multiple times and only
 * executes the underlying function one `interval` after the last invocation.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 */
class Debouncer extends RateLimiter {
    /**
     * Invokes the function and only executes after rate limit has elapsed.
     * Each invocation resets the timer.
     */
    async invoke() {
        void this.poll.schedule({ interval: this.limit, phase: 'invoked' });
        return this.payload.promise;
    }
}
exports.Debouncer = Debouncer;
/**
 * Wraps and throttles a function that can be called multiple times and only
 * executes the underlying function once per `interval`.
 *
 * @typeparam T - The resolved type of the underlying function. Defaults to any.
 *
 * @typeparam U - The rejected type of the underlying function. Defaults to any.
 */
class Throttler extends RateLimiter {
    /**
     * Throttles function invocations if one is currently in flight.
     */
    async invoke() {
        if (this.poll.state.phase !== 'invoked') {
            void this.poll.schedule({ interval: this.limit, phase: 'invoked' });
        }
        return this.payload.promise;
    }
}
exports.Throttler = Throttler;
//# sourceMappingURL=ratelimiter.js.map