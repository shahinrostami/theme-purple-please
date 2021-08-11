"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execvp = exports.pipevp = exports.EndStrategy = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const cross_spawn_1 = tslib_1.__importDefault(require("cross-spawn"));
var EndStrategy;
(function (EndStrategy) {
    EndStrategy[EndStrategy["Never"] = 0] = "Never";
    EndStrategy[EndStrategy["ErrorCode"] = 1] = "ErrorCode";
    EndStrategy[EndStrategy["Always"] = 2] = "Always";
})(EndStrategy = exports.EndStrategy || (exports.EndStrategy = {}));
function hasFd(stream) {
    // @ts-expect-error: Not sure how to typecheck this field
    return stream !== null && typeof stream.fd === `number`;
}
function sigintHandler() {
    // We don't want SIGINT to kill our process; we want it to kill the
    // innermost process, whose end will cause our own to exit.
}
// Rather than attaching one SIGINT handler for each process, we
// attach a single one and use a refcount to detect once it's no
// longer needed.
let sigintRefCount = 0;
async function pipevp(fileName, args, { cwd, env = process.env, strict = false, stdin = null, stdout, stderr, end = EndStrategy.Always }) {
    const stdio = [`pipe`, `pipe`, `pipe`];
    if (stdin === null)
        stdio[0] = `ignore`;
    else if (hasFd(stdin))
        stdio[0] = stdin;
    if (hasFd(stdout))
        stdio[1] = stdout;
    if (hasFd(stderr))
        stdio[2] = stderr;
    if (sigintRefCount++ === 0)
        process.on(`SIGINT`, sigintHandler);
    const child = cross_spawn_1.default(fileName, args, {
        cwd: fslib_1.npath.fromPortablePath(cwd),
        env: {
            ...env,
            PWD: fslib_1.npath.fromPortablePath(cwd),
        },
        stdio,
    });
    if (!hasFd(stdin) && stdin !== null)
        stdin.pipe(child.stdin);
    if (!hasFd(stdout))
        child.stdout.pipe(stdout, { end: false });
    if (!hasFd(stderr))
        child.stderr.pipe(stderr, { end: false });
    const closeStreams = () => {
        for (const stream of new Set([stdout, stderr])) {
            if (!hasFd(stream)) {
                stream.end();
            }
        }
    };
    return new Promise((resolve, reject) => {
        child.on(`error`, error => {
            if (--sigintRefCount === 0)
                process.off(`SIGINT`, sigintHandler);
            if (end === EndStrategy.Always || end === EndStrategy.ErrorCode)
                closeStreams();
            reject(error);
        });
        child.on(`close`, (code, sig) => {
            if (--sigintRefCount === 0)
                process.off(`SIGINT`, sigintHandler);
            if (end === EndStrategy.Always || (end === EndStrategy.ErrorCode && code > 0))
                closeStreams();
            if (code === 0 || !strict) {
                resolve({ code: getExitCode(code, sig) });
            }
            else if (code !== null) {
                reject(new Error(`Child "${fileName}" exited with exit code ${code}`));
            }
            else {
                reject(new Error(`Child "${fileName}" exited with signal ${sig}`));
            }
        });
    });
}
exports.pipevp = pipevp;
async function execvp(fileName, args, { cwd, env = process.env, encoding = `utf8`, strict = false }) {
    const stdio = [`ignore`, `pipe`, `pipe`];
    const stdoutChunks = [];
    const stderrChunks = [];
    const nativeCwd = fslib_1.npath.fromPortablePath(cwd);
    if (typeof env.PWD !== `undefined`)
        env = { ...env, PWD: nativeCwd };
    const subprocess = cross_spawn_1.default(fileName, args, {
        cwd: nativeCwd,
        env,
        stdio,
    });
    subprocess.stdout.on(`data`, (chunk) => {
        stdoutChunks.push(chunk);
    });
    subprocess.stderr.on(`data`, (chunk) => {
        stderrChunks.push(chunk);
    });
    return await new Promise((resolve, reject) => {
        subprocess.on(`error`, reject);
        subprocess.on(`close`, (code, signal) => {
            const stdout = encoding === `buffer`
                ? Buffer.concat(stdoutChunks)
                : Buffer.concat(stdoutChunks).toString(encoding);
            const stderr = encoding === `buffer`
                ? Buffer.concat(stderrChunks)
                : Buffer.concat(stderrChunks).toString(encoding);
            if (code === 0 || !strict) {
                resolve({
                    code: getExitCode(code, signal), stdout, stderr,
                });
            }
            else {
                reject(Object.assign(new Error(`Child "${fileName}" exited with exit code ${code}\n\n${stderr}`), {
                    code: getExitCode(code, signal), stdout, stderr,
                }));
            }
        });
    });
}
exports.execvp = execvp;
const signalToCodeMap = new Map([
    [`SIGINT`, 2],
    [`SIGQUIT`, 3],
    [`SIGKILL`, 9],
    [`SIGTERM`, 15],
]);
function getExitCode(code, signal) {
    const signalCode = signalToCodeMap.get(signal);
    if (typeof signalCode !== `undefined`) {
        return 128 + signalCode;
    }
    else {
        return code !== null && code !== void 0 ? code : 1;
    }
}
