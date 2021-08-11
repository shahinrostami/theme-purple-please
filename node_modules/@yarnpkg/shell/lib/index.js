"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.ShellError = exports.globUtils = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const parsers_1 = require("@yarnpkg/parsers");
const os_1 = require("os");
const stream_1 = require("stream");
const errors_1 = require("./errors");
Object.defineProperty(exports, "ShellError", { enumerable: true, get: function () { return errors_1.ShellError; } });
const globUtils = tslib_1.__importStar(require("./globUtils"));
exports.globUtils = globUtils;
const pipe_1 = require("./pipe");
const pipe_2 = require("./pipe");
var StreamType;
(function (StreamType) {
    StreamType[StreamType["Readable"] = 1] = "Readable";
    StreamType[StreamType["Writable"] = 2] = "Writable";
})(StreamType || (StreamType = {}));
function getFileDescriptorStream(fd, type, state) {
    const stream = new stream_1.PassThrough({ autoDestroy: true });
    switch (fd) {
        case pipe_2.Pipe.STDIN:
            {
                if ((type & StreamType.Readable) === StreamType.Readable)
                    state.stdin.pipe(stream, { end: false });
                if ((type & StreamType.Writable) === StreamType.Writable && state.stdin instanceof stream_1.Writable) {
                    stream.pipe(state.stdin, { end: false });
                }
            }
            break;
        case pipe_2.Pipe.STDOUT:
            {
                if ((type & StreamType.Readable) === StreamType.Readable)
                    state.stdout.pipe(stream, { end: false });
                if ((type & StreamType.Writable) === StreamType.Writable) {
                    stream.pipe(state.stdout, { end: false });
                }
            }
            break;
        case pipe_2.Pipe.STDERR:
            {
                if ((type & StreamType.Readable) === StreamType.Readable)
                    state.stderr.pipe(stream, { end: false });
                if ((type & StreamType.Writable) === StreamType.Writable) {
                    stream.pipe(state.stderr, { end: false });
                }
            }
            break;
        default: {
            throw new errors_1.ShellError(`Bad file descriptor: "${fd}"`);
        }
    }
    return stream;
}
function cloneState(state, mergeWith = {}) {
    const newState = { ...state, ...mergeWith };
    newState.environment = { ...state.environment, ...mergeWith.environment };
    newState.variables = { ...state.variables, ...mergeWith.variables };
    return newState;
}
const BUILTINS = new Map([
    [`cd`, async ([target = os_1.homedir(), ...rest], opts, state) => {
            const resolvedTarget = fslib_1.ppath.resolve(state.cwd, fslib_1.npath.toPortablePath(target));
            const stat = await opts.baseFs.statPromise(resolvedTarget);
            if (!stat.isDirectory()) {
                state.stderr.write(`cd: not a directory\n`);
                return 1;
            }
            else {
                state.cwd = resolvedTarget;
                return 0;
            }
        }],
    [`pwd`, async (args, opts, state) => {
            state.stdout.write(`${fslib_1.npath.fromPortablePath(state.cwd)}\n`);
            return 0;
        }],
    [`:`, async (args, opts, state) => {
            return 0;
        }],
    [`true`, async (args, opts, state) => {
            return 0;
        }],
    [`false`, async (args, opts, state) => {
            return 1;
        }],
    [`exit`, async ([code, ...rest], opts, state) => {
            return state.exitCode = parseInt(code !== null && code !== void 0 ? code : state.variables[`?`], 10);
        }],
    [`echo`, async (args, opts, state) => {
            state.stdout.write(`${args.join(` `)}\n`);
            return 0;
        }],
    [`__ysh_run_procedure`, async (args, opts, state) => {
            const procedure = state.procedures[args[0]];
            const exitCode = await pipe_2.start(procedure, {
                stdin: new pipe_2.ProtectedStream(state.stdin),
                stdout: new pipe_2.ProtectedStream(state.stdout),
                stderr: new pipe_2.ProtectedStream(state.stderr),
            }).run();
            return exitCode;
        }],
    [`__ysh_set_redirects`, async (args, opts, state) => {
            let stdin = state.stdin;
            let stdout = state.stdout;
            const stderr = state.stderr;
            const inputs = [];
            const outputs = [];
            let t = 0;
            while (args[t] !== `--`) {
                const type = args[t++];
                const count = Number(args[t++]);
                const last = t + count;
                for (let u = t; u < last; ++t, ++u) {
                    switch (type) {
                        case `<`:
                            {
                                inputs.push(() => {
                                    return opts.baseFs.createReadStream(fslib_1.ppath.resolve(state.cwd, fslib_1.npath.toPortablePath(args[u])));
                                });
                            }
                            break;
                        case `<<<`:
                            {
                                inputs.push(() => {
                                    const input = new stream_1.PassThrough();
                                    process.nextTick(() => {
                                        input.write(`${args[u]}\n`);
                                        input.end();
                                    });
                                    return input;
                                });
                            }
                            break;
                        case `<&`:
                            {
                                inputs.push(() => getFileDescriptorStream(Number(args[u]), StreamType.Readable, state));
                            }
                            break;
                        case `>`:
                        case `>>`:
                            {
                                const outputPath = fslib_1.ppath.resolve(state.cwd, fslib_1.npath.toPortablePath(args[u]));
                                if (outputPath === `/dev/null`) {
                                    outputs.push(new stream_1.Writable({
                                        autoDestroy: true,
                                        emitClose: true,
                                        write(chunk, encoding, callback) {
                                            setImmediate(callback);
                                        },
                                    }));
                                }
                                else {
                                    outputs.push(opts.baseFs.createWriteStream(outputPath, type === `>>` ? { flags: `a` } : undefined));
                                }
                            }
                            break;
                        case `>&`:
                            {
                                outputs.push(getFileDescriptorStream(Number(args[u]), StreamType.Writable, state));
                            }
                            break;
                        default: {
                            throw new Error(`Assertion failed: Unsupported redirection type: "${type}"`);
                        }
                    }
                }
            }
            if (inputs.length > 0) {
                const pipe = new stream_1.PassThrough();
                stdin = pipe;
                const bindInput = (n) => {
                    if (n === inputs.length) {
                        pipe.end();
                    }
                    else {
                        const input = inputs[n]();
                        input.pipe(pipe, { end: false });
                        input.on(`end`, () => {
                            bindInput(n + 1);
                        });
                    }
                };
                bindInput(0);
            }
            if (outputs.length > 0) {
                const pipe = new stream_1.PassThrough();
                stdout = pipe;
                for (const output of outputs) {
                    pipe.pipe(output);
                }
            }
            const exitCode = await pipe_2.start(makeCommandAction(args.slice(t + 1), opts, state), {
                stdin: new pipe_2.ProtectedStream(stdin),
                stdout: new pipe_2.ProtectedStream(stdout),
                stderr: new pipe_2.ProtectedStream(stderr),
            }).run();
            // Close all the outputs (since the shell never closes the output stream)
            await Promise.all(outputs.map(output => {
                // Wait until the output got flushed to the disk
                return new Promise(resolve => {
                    output.on(`close`, () => {
                        resolve();
                    });
                    output.end();
                });
            }));
            return exitCode;
        }],
]);
async function executeBufferedSubshell(ast, opts, state) {
    const chunks = [];
    const stdout = new stream_1.PassThrough();
    stdout.on(`data`, chunk => chunks.push(chunk));
    await executeShellLine(ast, opts, cloneState(state, { stdout }));
    return Buffer.concat(chunks).toString().replace(/[\r\n]+$/, ``);
}
async function applyEnvVariables(environmentSegments, opts, state) {
    const envPromises = environmentSegments.map(async (envSegment) => {
        const interpolatedArgs = await interpolateArguments(envSegment.args, opts, state);
        return {
            name: envSegment.name,
            value: interpolatedArgs.join(` `),
        };
    });
    const interpolatedEnvs = await Promise.all(envPromises);
    return interpolatedEnvs.reduce((envs, env) => {
        envs[env.name] = env.value;
        return envs;
    }, {});
}
function split(raw) {
    return raw.match(/[^ \r\n\t]+/g) || [];
}
async function evaluateVariable(segment, opts, state, push, pushAndClose = push) {
    switch (segment.name) {
        case `$`:
            {
                push(String(process.pid));
            }
            break;
        case `#`:
            {
                push(String(opts.args.length));
            }
            break;
        case `@`:
            {
                if (segment.quoted) {
                    for (const raw of opts.args) {
                        pushAndClose(raw);
                    }
                }
                else {
                    for (const raw of opts.args) {
                        const parts = split(raw);
                        for (let t = 0; t < parts.length - 1; ++t)
                            pushAndClose(parts[t]);
                        push(parts[parts.length - 1]);
                    }
                }
            }
            break;
        case `*`:
            {
                const raw = opts.args.join(` `);
                if (segment.quoted) {
                    push(raw);
                }
                else {
                    for (const part of split(raw)) {
                        pushAndClose(part);
                    }
                }
            }
            break;
        case `PPID`:
            {
                push(String(process.ppid));
            }
            break;
        case `RANDOM`:
            {
                push(String(Math.floor(Math.random() * 32768)));
            }
            break;
        default:
            {
                const argIndex = parseInt(segment.name, 10);
                if (Number.isFinite(argIndex)) {
                    if (argIndex >= 0 && argIndex < opts.args.length) {
                        push(opts.args[argIndex]);
                    }
                    else if (segment.defaultValue) {
                        push((await interpolateArguments(segment.defaultValue, opts, state)).join(` `));
                    }
                    else {
                        throw new errors_1.ShellError(`Unbound argument #${argIndex}`);
                    }
                }
                else {
                    if (Object.prototype.hasOwnProperty.call(state.variables, segment.name)) {
                        push(state.variables[segment.name]);
                    }
                    else if (Object.prototype.hasOwnProperty.call(state.environment, segment.name)) {
                        push(state.environment[segment.name]);
                    }
                    else if (segment.defaultValue) {
                        push((await interpolateArguments(segment.defaultValue, opts, state)).join(` `));
                    }
                    else {
                        throw new errors_1.ShellError(`Unbound variable "${segment.name}"`);
                    }
                }
            }
            break;
    }
}
const operators = {
    addition: (left, right) => left + right,
    subtraction: (left, right) => left - right,
    multiplication: (left, right) => left * right,
    division: (left, right) => Math.trunc(left / right),
};
async function evaluateArithmetic(arithmetic, opts, state) {
    if (arithmetic.type === `number`) {
        if (!Number.isInteger(arithmetic.value)) {
            // ZSH allows non-integers, while bash throws at the parser level (unrecoverable)
            throw new Error(`Invalid number: "${arithmetic.value}", only integers are allowed`);
        }
        else {
            return arithmetic.value;
        }
    }
    else if (arithmetic.type === `variable`) {
        const parts = [];
        await evaluateVariable({ ...arithmetic, quoted: true }, opts, state, result => parts.push(result));
        const number = Number(parts.join(` `));
        if (Number.isNaN(number)) {
            return evaluateArithmetic({ type: `variable`, name: parts.join(` `) }, opts, state);
        }
        else {
            return evaluateArithmetic({ type: `number`, value: number }, opts, state);
        }
    }
    else {
        return operators[arithmetic.type](await evaluateArithmetic(arithmetic.left, opts, state), await evaluateArithmetic(arithmetic.right, opts, state));
    }
}
async function interpolateArguments(commandArgs, opts, state) {
    const redirections = new Map();
    const interpolated = [];
    let interpolatedSegments = [];
    const push = (segment) => {
        interpolatedSegments.push(segment);
    };
    const close = () => {
        if (interpolatedSegments.length > 0)
            interpolated.push(interpolatedSegments.join(``));
        interpolatedSegments = [];
    };
    const pushAndClose = (segment) => {
        push(segment);
        close();
    };
    const redirect = (type, target) => {
        let targets = redirections.get(type);
        if (typeof targets === `undefined`)
            redirections.set(type, targets = []);
        targets.push(target);
    };
    for (const commandArg of commandArgs) {
        let isGlob = false;
        switch (commandArg.type) {
            case `redirection`:
                {
                    const interpolatedArgs = await interpolateArguments(commandArg.args, opts, state);
                    for (const interpolatedArg of interpolatedArgs) {
                        redirect(commandArg.subtype, interpolatedArg);
                    }
                }
                break;
            case `argument`:
                {
                    for (const segment of commandArg.segments) {
                        switch (segment.type) {
                            case `text`:
                                {
                                    push(segment.text);
                                }
                                break;
                            case `glob`:
                                {
                                    push(segment.pattern);
                                    isGlob = true;
                                }
                                break;
                            case `shell`:
                                {
                                    const raw = await executeBufferedSubshell(segment.shell, opts, state);
                                    if (segment.quoted) {
                                        push(raw);
                                    }
                                    else {
                                        const parts = split(raw);
                                        for (let t = 0; t < parts.length - 1; ++t)
                                            pushAndClose(parts[t]);
                                        push(parts[parts.length - 1]);
                                    }
                                }
                                break;
                            case `variable`:
                                {
                                    await evaluateVariable(segment, opts, state, push, pushAndClose);
                                }
                                break;
                            case `arithmetic`:
                                {
                                    push(String(await evaluateArithmetic(segment.arithmetic, opts, state)));
                                }
                                break;
                        }
                    }
                }
                break;
        }
        close();
        if (isGlob) {
            const pattern = interpolated.pop();
            if (typeof pattern === `undefined`)
                throw new Error(`Assertion failed: Expected a glob pattern to have been set`);
            const matches = await opts.glob.match(pattern, { cwd: state.cwd, baseFs: opts.baseFs });
            if (matches.length === 0) {
                const braceExpansionNotice = globUtils.isBraceExpansion(pattern)
                    ? `. Note: Brace expansion of arbitrary strings isn't currently supported. For more details, please read this issue: https://github.com/yarnpkg/berry/issues/22`
                    : ``;
                throw new errors_1.ShellError(`No matches found: "${pattern}"${braceExpansionNotice}`);
            }
            for (const match of matches.sort()) {
                pushAndClose(match);
            }
        }
    }
    if (redirections.size > 0) {
        const redirectionArgs = [];
        for (const [subtype, targets] of redirections.entries())
            redirectionArgs.splice(redirectionArgs.length, 0, subtype, String(targets.length), ...targets);
        interpolated.splice(0, 0, `__ysh_set_redirects`, ...redirectionArgs, `--`);
    }
    return interpolated;
}
/**
 * Executes a command chain. A command chain is a list of commands linked
 * together thanks to the use of either of the `|` or `|&` operators:
 *
 * $ cat hello | grep world | grep -v foobar
 */
function makeCommandAction(args, opts, state) {
    if (!opts.builtins.has(args[0]))
        args = [`command`, ...args];
    const nativeCwd = fslib_1.npath.fromPortablePath(state.cwd);
    let env = state.environment;
    if (typeof env.PWD !== `undefined`)
        env = { ...env, PWD: nativeCwd };
    const [name, ...rest] = args;
    if (name === `command`) {
        return pipe_1.makeProcess(rest[0], rest.slice(1), opts, {
            cwd: nativeCwd,
            env,
        });
    }
    const builtin = opts.builtins.get(name);
    if (typeof builtin === `undefined`)
        throw new Error(`Assertion failed: A builtin should exist for "${name}"`);
    return pipe_1.makeBuiltin(async ({ stdin, stdout, stderr }) => {
        state.stdin = stdin;
        state.stdout = stdout;
        state.stderr = stderr;
        return await builtin(rest, opts, state);
    });
}
function makeSubshellAction(ast, opts, state) {
    return (stdio) => {
        const stdin = new stream_1.PassThrough();
        const promise = executeShellLine(ast, opts, cloneState(state, { stdin }));
        return { stdin, promise };
    };
}
function makeGroupAction(ast, opts, state) {
    return (stdio) => {
        const stdin = new stream_1.PassThrough();
        const promise = executeShellLine(ast, opts, state);
        return { stdin, promise };
    };
}
function makeActionFromProcedure(procedure, args, opts, activeState) {
    if (args.length === 0) {
        return procedure;
    }
    else {
        let key;
        do {
            key = String(Math.random());
        } while (Object.prototype.hasOwnProperty.call(activeState.procedures, key));
        activeState.procedures = { ...activeState.procedures };
        activeState.procedures[key] = procedure;
        return makeCommandAction([...args, `__ysh_run_procedure`, key], opts, activeState);
    }
}
async function executeCommandChain(node, opts, state) {
    let current = node;
    let pipeType = null;
    let execution = null;
    while (current) {
        // Only the final segment is allowed to modify the shell state; all the
        // other ones are isolated
        const activeState = current.then
            ? { ...state }
            : state;
        let action;
        switch (current.type) {
            case `command`:
                {
                    const args = await interpolateArguments(current.args, opts, state);
                    const environment = await applyEnvVariables(current.envs, opts, state);
                    action = current.envs.length
                        ? makeCommandAction(args, opts, cloneState(activeState, { environment }))
                        : makeCommandAction(args, opts, activeState);
                }
                break;
            case `subshell`:
                {
                    const args = await interpolateArguments(current.args, opts, state);
                    // We don't interpolate the subshell because it will be recursively
                    // interpolated within its own context
                    const procedure = makeSubshellAction(current.subshell, opts, activeState);
                    action = makeActionFromProcedure(procedure, args, opts, activeState);
                }
                break;
            case `group`:
                {
                    const args = await interpolateArguments(current.args, opts, state);
                    const procedure = makeGroupAction(current.group, opts, activeState);
                    action = makeActionFromProcedure(procedure, args, opts, activeState);
                }
                break;
            case `envs`:
                {
                    const environment = await applyEnvVariables(current.envs, opts, state);
                    activeState.environment = { ...activeState.environment, ...environment };
                    action = makeCommandAction([`true`], opts, activeState);
                }
                break;
        }
        if (typeof action === `undefined`)
            throw new Error(`Assertion failed: An action should have been generated`);
        if (pipeType === null) {
            // If we're processing the left-most segment of the command, we start a
            // new execution pipeline
            execution = pipe_2.start(action, {
                stdin: new pipe_2.ProtectedStream(activeState.stdin),
                stdout: new pipe_2.ProtectedStream(activeState.stdout),
                stderr: new pipe_2.ProtectedStream(activeState.stderr),
            });
        }
        else {
            if (execution === null)
                throw new Error(`Assertion failed: The execution pipeline should have been setup`);
            // Otherwise, depending on the exaxct pipe type, we either pipe stdout
            // only or stdout and stderr
            switch (pipeType) {
                case `|`:
                    {
                        execution = execution.pipeTo(action, pipe_2.Pipe.STDOUT);
                    }
                    break;
                case `|&`:
                    {
                        execution = execution.pipeTo(action, pipe_2.Pipe.STDOUT | pipe_2.Pipe.STDERR);
                    }
                    break;
            }
        }
        if (current.then) {
            pipeType = current.then.type;
            current = current.then.chain;
        }
        else {
            current = null;
        }
    }
    if (execution === null)
        throw new Error(`Assertion failed: The execution pipeline should have been setup`);
    return await execution.run();
}
/**
 * Execute a command line. A command line is a list of command shells linked
 * together thanks to the use of either of the `||` or `&&` operators.
 */
async function executeCommandLine(node, opts, state) {
    let code;
    const setCode = (newCode) => {
        code = newCode;
        // We must update $?, which always contains the exit code from
        // the right-most command
        state.variables[`?`] = String(newCode);
    };
    const executeChain = async (chain) => {
        try {
            return await executeCommandChain(chain, opts, state);
        }
        catch (error) {
            if (!(error instanceof errors_1.ShellError))
                throw error;
            state.stderr.write(`${error.message}\n`);
            return 1;
        }
    };
    setCode(await executeChain(node.chain));
    // We use a loop because we must make sure that we respect
    // the left associativity of lists, as per the bash spec.
    // (e.g. `inexistent && echo yes || echo no` must be
    // the same as `{inexistent && echo yes} || echo no`)
    while (node.then) {
        // If the execution aborted (usually through "exit"), we must bailout
        if (state.exitCode !== null)
            return state.exitCode;
        switch (node.then.type) {
            case `&&`:
                {
                    if (code === 0) {
                        setCode(await executeChain(node.then.line.chain));
                    }
                }
                break;
            case `||`:
                {
                    if (code !== 0) {
                        setCode(await executeChain(node.then.line.chain));
                    }
                }
                break;
            default:
                {
                    throw new Error(`Assertion failed: Unsupported command type: "${node.then.type}"`);
                }
                break;
        }
        node = node.then.line;
    }
    return code;
}
async function executeShellLine(node, opts, state) {
    let rightMostExitCode = 0;
    for (const command of node) {
        rightMostExitCode = await executeCommandLine(command, opts, state);
        // If the execution aborted (usually through "exit"), we must bailout
        if (state.exitCode !== null)
            return state.exitCode;
        // We must update $?, which always contains the exit code from
        // the right-most command
        state.variables[`?`] = String(rightMostExitCode);
    }
    return rightMostExitCode;
}
function locateArgsVariableInSegment(segment) {
    switch (segment.type) {
        case `variable`:
            {
                return segment.name === `@` || segment.name === `#` || segment.name === `*` || Number.isFinite(parseInt(segment.name, 10)) || (`defaultValue` in segment && !!segment.defaultValue && segment.defaultValue.some(arg => locateArgsVariableInArgument(arg)));
            }
            break;
        case `arithmetic`:
            {
                return locateArgsVariableInArithmetic(segment.arithmetic);
            }
            break;
        case `shell`:
            {
                return locateArgsVariable(segment.shell);
            }
            break;
        default:
            {
                return false;
            }
            break;
    }
}
function locateArgsVariableInArgument(arg) {
    switch (arg.type) {
        case `redirection`:
            {
                return arg.args.some(arg => locateArgsVariableInArgument(arg));
            }
            break;
        case `argument`:
            {
                return arg.segments.some(segment => locateArgsVariableInSegment(segment));
            }
            break;
        default:
            throw new Error(`Assertion failed: Unsupported argument type: "${arg.type}"`);
    }
}
function locateArgsVariableInArithmetic(arg) {
    switch (arg.type) {
        case `variable`:
            {
                return locateArgsVariableInSegment(arg);
            }
            break;
        case `number`:
            {
                return false;
            }
            break;
        default:
            return locateArgsVariableInArithmetic(arg.left) || locateArgsVariableInArithmetic(arg.right);
    }
}
function locateArgsVariable(node) {
    return node.some(command => {
        while (command) {
            let chain = command.chain;
            while (chain) {
                let hasArgs;
                switch (chain.type) {
                    case `subshell`:
                        {
                            hasArgs = locateArgsVariable(chain.subshell);
                        }
                        break;
                    case `command`:
                        {
                            hasArgs = chain.envs.some(env => env.args.some(arg => {
                                return locateArgsVariableInArgument(arg);
                            })) || chain.args.some(arg => {
                                return locateArgsVariableInArgument(arg);
                            });
                        }
                        break;
                }
                if (hasArgs)
                    return true;
                if (!chain.then)
                    break;
                chain = chain.then.chain;
            }
            if (!command.then)
                break;
            command = command.then.line;
        }
        return false;
    });
}
async function execute(command, args = [], { baseFs = new fslib_1.NodeFS(), builtins = {}, cwd = fslib_1.npath.toPortablePath(process.cwd()), env = process.env, stdin = process.stdin, stdout = process.stdout, stderr = process.stderr, variables = {}, glob = globUtils, } = {}) {
    const normalizedEnv = {};
    for (const [key, value] of Object.entries(env))
        if (typeof value !== `undefined`)
            normalizedEnv[key] = value;
    const normalizedBuiltins = new Map(BUILTINS);
    for (const [key, builtin] of Object.entries(builtins))
        normalizedBuiltins.set(key, builtin);
    // This is meant to be the equivalent of /dev/null
    if (stdin === null) {
        stdin = new stream_1.PassThrough();
        stdin.end();
    }
    const ast = parsers_1.parseShell(command, glob);
    // If the shell line doesn't use the args, inject it at the end of the
    // right-most command
    if (!locateArgsVariable(ast) && ast.length > 0 && args.length > 0) {
        let command = ast[ast.length - 1];
        while (command.then)
            command = command.then.line;
        let chain = command.chain;
        while (chain.then)
            chain = chain.then.chain;
        if (chain.type === `command`) {
            chain.args = chain.args.concat(args.map(arg => {
                return {
                    type: `argument`,
                    segments: [{
                            type: `text`,
                            text: arg,
                        }],
                };
            }));
        }
    }
    return await executeShellLine(ast, {
        args,
        baseFs,
        builtins: normalizedBuiltins,
        initialStdin: stdin,
        initialStdout: stdout,
        initialStderr: stderr,
        glob,
    }, {
        cwd,
        environment: normalizedEnv,
        exitCode: null,
        procedures: {},
        stdin,
        stdout,
        stderr,
        variables: Object.assign({}, variables, {
            [`?`]: 0,
        }),
    });
}
exports.execute = execute;
