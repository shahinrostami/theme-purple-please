"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
/**
 * A function to defer an action immediately.
 */
const defer = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : setImmediate;
/**
 * A function to cancel a deferred action.
 */
const cancel = typeof cancelAnimationFrame === 'function'
    ? cancelAnimationFrame
    : clearImmediate;
/**
 * A class that wraps an asynchronous function to poll at a regular interval
 * with exponential increases to the interval length if the poll fails.
 *
 * @typeparam T - The resolved type of the factory's promises.
 * Defaults to `any`.
 *
 * @typeparam U - The rejected type of the factory's promises.
 * Defaults to `any`.
 *
 * @typeparam V - An optional type to extend the phases supported by a poll.
 * Defaults to `standby`, which already exists in the `Phase` type.
 */
class Poll {
    /**
     * Instantiate a new poll with exponential backoff in case of failure.
     *
     * @param options - The poll instantiation options.
     */
    constructor(options) {
        this._disposed = new signaling_1.Signal(this);
        this._tick = new coreutils_1.PromiseDelegate();
        this._ticked = new signaling_1.Signal(this);
        this._timeout = -1;
        this._factory = options.factory;
        this._standby = options.standby || Private.DEFAULT_STANDBY;
        this._state = Object.assign({}, Private.DEFAULT_STATE, { timestamp: new Date().getTime() });
        this.frequency = Object.assign({}, Private.DEFAULT_FREQUENCY, (options.frequency || {}));
        this.name = options.name || Private.DEFAULT_NAME;
        if ('auto' in options ? options.auto : true) {
            defer(() => void this.start());
        }
    }
    /**
     * A signal emitted when the poll is disposed.
     */
    get disposed() {
        return this._disposed;
    }
    /**
     * The polling frequency parameters.
     */
    get frequency() {
        return this._frequency;
    }
    set frequency(frequency) {
        if (this.isDisposed || coreutils_1.JSONExt.deepEqual(frequency, this.frequency || {})) {
            return;
        }
        let { backoff, interval, max } = frequency;
        interval = Math.round(interval);
        max = Math.round(max);
        if (typeof backoff === 'number' && backoff < 1) {
            throw new Error('Poll backoff growth factor must be at least 1');
        }
        if ((interval < 0 || interval > max) && interval !== Poll.NEVER) {
            throw new Error('Poll interval must be between 0 and max');
        }
        if (max > Poll.MAX_INTERVAL && max !== Poll.NEVER) {
            throw new Error(`Max interval must be less than ${Poll.MAX_INTERVAL}`);
        }
        this._frequency = { backoff, interval, max };
    }
    /**
     * Whether the poll is disposed.
     */
    get isDisposed() {
        return this.state.phase === 'disposed';
    }
    /**
     * Indicates when the poll switches to standby.
     */
    get standby() {
        return this._standby;
    }
    set standby(standby) {
        if (this.isDisposed || this.standby === standby) {
            return;
        }
        this._standby = standby;
    }
    /**
     * The poll state, which is the content of the current poll tick.
     */
    get state() {
        return this._state;
    }
    /**
     * A promise that resolves when the poll next ticks.
     */
    get tick() {
        return this._tick.promise;
    }
    /**
     * A signal emitted when the poll ticks and fires off a new request.
     */
    get ticked() {
        return this._ticked;
    }
    /**
     * Dispose the poll.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._state = Object.assign({}, Private.DISPOSED_STATE, { timestamp: new Date().getTime() });
        this._tick.promise.catch(_ => undefined);
        this._tick.reject(new Error(`Poll (${this.name}) is disposed.`));
        this._disposed.emit();
        signaling_1.Signal.clearData(this);
    }
    /**
     * Refreshes the poll. Schedules `refreshed` tick if necessary.
     *
     * @returns A promise that resolves after tick is scheduled and never rejects.
     *
     * #### Notes
     * The returned promise resolves after the tick is scheduled, but before
     * the polling action is run. To wait until after the poll action executes,
     * await the `poll.tick` promise: `await poll.refresh(); await poll.tick;`
     */
    refresh() {
        return this.schedule({
            cancel: ({ phase }) => phase === 'refreshed',
            interval: Poll.IMMEDIATE,
            phase: 'refreshed'
        });
    }
    /**
     * Schedule the next poll tick.
     *
     * @param next - The next poll state data to schedule. Defaults to standby.
     *
     * @param next.cancel - Cancels state transition if function returns `true`.
     *
     * @returns A promise that resolves when the next poll state is active.
     *
     * #### Notes
     * This method is not meant to be invoked by user code typically. It is public
     * to allow poll instances to be composed into classes that schedule ticks.
     */
    async schedule(next = {}) {
        if (this.isDisposed) {
            return;
        }
        // Check if the phase transition should be canceled.
        if (next.cancel && next.cancel(this.state)) {
            return;
        }
        // Update poll state.
        const last = this.state;
        const pending = this._tick;
        const scheduled = new coreutils_1.PromiseDelegate();
        const state = Object.assign({ interval: this.frequency.interval, payload: null, phase: 'standby', timestamp: new Date().getTime() }, next);
        this._state = state;
        this._tick = scheduled;
        // Clear the schedule if possible.
        if (last.interval === Poll.IMMEDIATE) {
            cancel(this._timeout);
        }
        else {
            clearTimeout(this._timeout);
        }
        // Emit ticked signal, resolve pending promise, and await its settlement.
        this._ticked.emit(this.state);
        pending.resolve(this);
        await pending.promise;
        // Schedule next execution and cache its timeout handle.
        const execute = () => {
            if (this.isDisposed || this.tick !== scheduled.promise) {
                return;
            }
            this._execute();
        };
        this._timeout =
            state.interval === Poll.IMMEDIATE
                ? defer(execute)
                : state.interval === Poll.NEVER
                    ? -1
                    : setTimeout(execute, state.interval);
    }
    /**
     * Starts the poll. Schedules `started` tick if necessary.
     *
     * @returns A promise that resolves after tick is scheduled and never rejects.
     */
    start() {
        return this.schedule({
            cancel: ({ phase }) => phase !== 'constructed' && phase !== 'standby' && phase !== 'stopped',
            interval: Poll.IMMEDIATE,
            phase: 'started'
        });
    }
    /**
     * Stops the poll. Schedules `stopped` tick if necessary.
     *
     * @returns A promise that resolves after tick is scheduled and never rejects.
     */
    stop() {
        return this.schedule({
            cancel: ({ phase }) => phase === 'stopped',
            interval: Poll.NEVER,
            phase: 'stopped'
        });
    }
    /**
     * Execute a new poll factory promise or stand by if necessary.
     */
    _execute() {
        let standby = typeof this.standby === 'function' ? this.standby() : this.standby;
        standby =
            standby === 'never'
                ? false
                : standby === 'when-hidden'
                    ? !!(typeof document !== 'undefined' && document && document.hidden)
                    : true;
        // If in standby mode schedule next tick without calling the factory.
        if (standby) {
            void this.schedule();
            return;
        }
        const pending = this.tick;
        this._factory(this.state)
            .then((resolved) => {
            if (this.isDisposed || this.tick !== pending) {
                return;
            }
            void this.schedule({
                payload: resolved,
                phase: this.state.phase === 'rejected' ? 'reconnected' : 'resolved'
            });
        })
            .catch((rejected) => {
            if (this.isDisposed || this.tick !== pending) {
                return;
            }
            void this.schedule({
                interval: Private.sleep(this.frequency, this.state),
                payload: rejected,
                phase: 'rejected'
            });
        });
    }
}
exports.Poll = Poll;
/**
 * A namespace for `Poll` types, interfaces, and statics.
 */
(function (Poll) {
    /**
     * An interval value that indicates the poll should tick immediately.
     */
    Poll.IMMEDIATE = 0;
    /**
     * Delays are 32-bit integers in many browsers so intervals need to be capped.
     *
     * #### Notes
     * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#Maximum_delay_value
     */
    Poll.MAX_INTERVAL = 2147483647;
    /**
     * An interval value that indicates the poll should never tick.
     */
    Poll.NEVER = Infinity;
})(Poll = exports.Poll || (exports.Poll = {}));
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * The default backoff growth rate if `backoff` is `true`.
     */
    Private.DEFAULT_BACKOFF = 3;
    /**
     * The default polling frequency.
     */
    Private.DEFAULT_FREQUENCY = {
        backoff: true,
        interval: 1000,
        max: 30 * 1000
    };
    /**
     * The default poll name.
     */
    Private.DEFAULT_NAME = 'unknown';
    /**
     * The default poll standby behavior.
     */
    Private.DEFAULT_STANDBY = 'when-hidden';
    /**
     * The first poll tick state's default values superseded in constructor.
     */
    Private.DEFAULT_STATE = {
        interval: Poll.NEVER,
        payload: null,
        phase: 'constructed',
        timestamp: new Date(0).getTime()
    };
    /**
     * The disposed tick state values.
     */
    Private.DISPOSED_STATE = {
        interval: Poll.NEVER,
        payload: null,
        phase: 'disposed',
        timestamp: new Date(0).getTime()
    };
    /**
     * Get a random integer between min and max, inclusive of both.
     *
     * #### Notes
     * From
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
     *
     * From the MDN page: It might be tempting to use Math.round() to accomplish
     * that, but doing so would cause your random numbers to follow a non-uniform
     * distribution, which may not be acceptable for your needs.
     */
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Returns the number of milliseconds to sleep before the next tick.
     *
     * @param frequency - The poll's base frequency.
     * @param last - The poll's last tick.
     */
    function sleep(frequency, last) {
        const { backoff, interval, max } = frequency;
        if (interval === Poll.NEVER) {
            return interval;
        }
        const growth = backoff === true ? Private.DEFAULT_BACKOFF : backoff === false ? 1 : backoff;
        const random = getRandomIntInclusive(interval, last.interval * growth);
        return Math.min(max, random);
    }
    Private.sleep = sleep;
})(Private || (Private = {}));
//# sourceMappingURL=poll.js.map