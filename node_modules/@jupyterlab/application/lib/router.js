"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const coreutils_2 = require("@phosphor/coreutils");
const disposable_1 = require("@phosphor/disposable");
const signaling_1 = require("@phosphor/signaling");
/* tslint:disable */
/**
 * The URL Router token.
 */
exports.IRouter = new coreutils_2.Token('@jupyterlab/application:IRouter');
/**
 * A static class that routes URLs within the application.
 */
class Router {
    /**
     * Create a URL router.
     */
    constructor(options) {
        /**
         * If a matching rule's command resolves with the `stop` token during routing,
         * no further matches will execute.
         */
        this.stop = new coreutils_2.Token('@jupyterlab/application:Router#stop');
        this._routed = new signaling_1.Signal(this);
        this._rules = new Map();
        this.base = options.base;
        this.commands = options.commands;
    }
    /**
     * Returns the parsed current URL of the application.
     */
    get current() {
        const { base } = this;
        const parsed = coreutils_1.URLExt.parse(window.location.href);
        const { search, hash } = parsed;
        const path = parsed.pathname.replace(base, '/');
        const request = path + search + hash;
        return { hash, path, request, search };
    }
    /**
     * A signal emitted when the router routes a route.
     */
    get routed() {
        return this._routed;
    }
    /**
     * Navigate to a new path within the application.
     *
     * @param path - The new path or empty string if redirecting to root.
     *
     * @param options - The navigation options.
     */
    navigate(path, options = {}) {
        const { base } = this;
        const { history } = window;
        const { hard, silent } = options;
        const url = path && path.indexOf(base) === 0 ? path : coreutils_1.URLExt.join(base, path);
        if (silent) {
            history.replaceState({}, '', url);
        }
        else {
            history.pushState({}, '', url);
        }
        if (hard) {
            return this.reload();
        }
        // Because a `route()` call may still be in the stack after having received
        // a `stop` token, wait for the next stack frame before calling `route()`.
        requestAnimationFrame(() => {
            this.route();
        });
    }
    /**
     * Register to route a path pattern to a command.
     *
     * @param options - The route registration options.
     *
     * @returns A disposable that removes the registered rule from the router.
     */
    register(options) {
        const { command, pattern } = options;
        const rank = 'rank' in options ? options.rank : 100;
        const rules = this._rules;
        rules.set(pattern, { command, rank });
        return new disposable_1.DisposableDelegate(() => {
            rules.delete(pattern);
        });
    }
    /**
     * Cause a hard reload of the document.
     */
    reload() {
        window.location.reload();
    }
    /**
     * Route a specific path to an action.
     *
     * #### Notes
     * If a pattern is matched, its command will be invoked with arguments that
     * match the `IRouter.ILocation` interface.
     */
    route() {
        const { commands, current, stop } = this;
        const { request } = current;
        const routed = this._routed;
        const rules = this._rules;
        const matches = [];
        // Collect all rules that match the URL.
        rules.forEach((rule, pattern) => {
            if (request.match(pattern)) {
                matches.push(rule);
            }
        });
        // Order the matching rules by rank and enqueue them.
        const queue = matches.sort((a, b) => b.rank - a.rank);
        // Process each enqueued command sequentially and short-circuit if a promise
        // resolves with the `stop` token.
        (function next() {
            if (!queue.length) {
                routed.emit(current);
                return;
            }
            const { command } = queue.pop();
            commands
                .execute(command, current)
                .then(result => {
                if (result === stop) {
                    queue.length = 0;
                    console.log(`Routing ${request} was short-circuited by ${command}`);
                }
                next();
            })
                .catch(reason => {
                console.warn(`Routing ${request} to ${command} failed`, reason);
                next();
            });
        })();
    }
}
exports.Router = Router;
