"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.Handle = exports.ProtectedStream = exports.makeBuiltin = exports.makeProcess = exports.Pipe = void 0;
const tslib_1 = require("tslib");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
const stream_1 = require("stream");
var Pipe;
(function (Pipe) {
    Pipe[Pipe["STDIN"] = 0] = "STDIN";
    Pipe[Pipe["STDOUT"] = 1] = "STDOUT";
    Pipe[Pipe["STDERR"] = 2] = "STDERR";
})(Pipe = exports.Pipe || (exports.Pipe = {}));
function sigintHandler() {
    // We don't want SIGINT to kill our process; we want it to kill the
    // innermost process, whose end will cause our own to exit.
}
// Rather than attaching one SIGINT handler for each process, we
// attach a single one and use a refcount to detect once it's no
// longer needed.
let sigintRefCount = 0;
function makeProcess(name, args, opts, spawnOpts) {
    return (stdio) => {
        const stdin = stdio[0] instanceof stream_1.Transform
            ? `pipe`
            : stdio[0];
        const stdout = stdio[1] instanceof stream_1.Transform
            ? `pipe`
            : stdio[1];
        const stderr = stdio[2] instanceof stream_1.Transform
            ? `pipe`
            : stdio[2];
        const child = cross_spawn_1.default(name, args, { ...spawnOpts, stdio: [
                stdin,
                stdout,
                stderr,
            ] });
        if (sigintRefCount++ === 0)
            process.on(`SIGINT`, sigintHandler);
        if (stdio[0] instanceof stream_1.Transform)
            stdio[0].pipe(child.stdin);
        if (stdio[1] instanceof stream_1.Transform)
            child.stdout.pipe(stdio[1], { end: false });
        if (stdio[2] instanceof stream_1.Transform)
            child.stderr.pipe(stdio[2], { end: false });
        return {
            stdin: child.stdin,
            promise: new Promise(resolve => {
                child.on(`error`, error => {
                    if (--sigintRefCount === 0)
                        process.off(`SIGINT`, sigintHandler);
                    // @ts-expect-error
                    switch (error.code) {
                        case `ENOENT`:
                            {
                                stdio[2].write(`command not found: ${name}\n`);
                                resolve(127);
                            }
                            break;
                        case `EACCES`:
                            {
                                stdio[2].write(`permission denied: ${name}\n`);
                                resolve(128);
                            }
                            break;
                        default:
                            {
                                stdio[2].write(`uncaught error: ${error.message}\n`);
                                resolve(1);
                            }
                            break;
                    }
                });
                child.on(`exit`, code => {
                    if (--sigintRefCount === 0)
                        process.off(`SIGINT`, sigintHandler);
                    if (code !== null) {
                        resolve(code);
                    }
                    else {
                        resolve(129);
                    }
                });
            }),
        };
    };
}
exports.makeProcess = makeProcess;
function makeBuiltin(builtin) {
    return (stdio) => {
        const stdin = stdio[0] === `pipe`
            ? new stream_1.PassThrough()
            : stdio[0];
        return {
            stdin,
            promise: Promise.resolve().then(() => builtin({
                stdin,
                stdout: stdio[1],
                stderr: stdio[2],
            })),
        };
    };
}
exports.makeBuiltin = makeBuiltin;
class ProtectedStream {
    constructor(stream) {
        this.stream = stream;
    }
    close() {
        // Ignore close request
    }
    get() {
        return this.stream;
    }
}
exports.ProtectedStream = ProtectedStream;
class PipeStream {
    constructor() {
        this.stream = null;
    }
    close() {
        if (this.stream === null) {
            throw new Error(`Assertion failed: No stream attached`);
        }
        else {
            this.stream.end();
        }
    }
    attach(stream) {
        this.stream = stream;
    }
    get() {
        if (this.stream === null) {
            throw new Error(`Assertion failed: No stream attached`);
        }
        else {
            return this.stream;
        }
    }
}
class Handle {
    constructor(ancestor, implementation) {
        this.stdin = null;
        this.stdout = null;
        this.stderr = null;
        this.pipe = null;
        this.ancestor = ancestor;
        this.implementation = implementation;
    }
    static start(implementation, { stdin, stdout, stderr }) {
        const chain = new Handle(null, implementation);
        chain.stdin = stdin;
        chain.stdout = stdout;
        chain.stderr = stderr;
        return chain;
    }
    pipeTo(implementation, source = Pipe.STDOUT) {
        const next = new Handle(this, implementation);
        const pipe = new PipeStream();
        next.pipe = pipe;
        next.stdout = this.stdout;
        next.stderr = this.stderr;
        if ((source & Pipe.STDOUT) === Pipe.STDOUT)
            this.stdout = pipe;
        else if (this.ancestor !== null)
            this.stderr = this.ancestor.stdout;
        if ((source & Pipe.STDERR) === Pipe.STDERR)
            this.stderr = pipe;
        else if (this.ancestor !== null)
            this.stderr = this.ancestor.stderr;
        return next;
    }
    async exec() {
        const stdio = [
            `ignore`,
            `ignore`,
            `ignore`,
        ];
        if (this.pipe) {
            stdio[0] = `pipe`;
        }
        else {
            if (this.stdin === null) {
                throw new Error(`Assertion failed: No input stream registered`);
            }
            else {
                stdio[0] = this.stdin.get();
            }
        }
        let stdoutLock;
        if (this.stdout === null) {
            throw new Error(`Assertion failed: No output stream registered`);
        }
        else {
            stdoutLock = this.stdout;
            stdio[1] = stdoutLock.get();
        }
        let stderrLock;
        if (this.stderr === null) {
            throw new Error(`Assertion failed: No error stream registered`);
        }
        else {
            stderrLock = this.stderr;
            stdio[2] = stderrLock.get();
        }
        const child = this.implementation(stdio);
        if (this.pipe)
            this.pipe.attach(child.stdin);
        return await child.promise.then(code => {
            stdoutLock.close();
            stderrLock.close();
            return code;
        });
    }
    async run() {
        const promises = [];
        for (let handle = this; handle; handle = handle.ancestor)
            promises.push(handle.exec());
        const exitCodes = await Promise.all(promises);
        return exitCodes[0];
    }
}
exports.Handle = Handle;
function start(p, opts) {
    return Handle.start(p, opts);
}
exports.start = start;
