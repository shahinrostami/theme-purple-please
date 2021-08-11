'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const NODE_INITIAL = 0;
const NODE_SUCCESS = 1;
const NODE_ERRORED = 2;
const START_OF_INPUT = `\u0001`;
const END_OF_INPUT = `\u0000`;
const HELP_COMMAND_INDEX = -1;
const HELP_REGEX = /^(-h|--help)(?:=([0-9]+))?$/;
const OPTION_REGEX = /^(--[a-z]+(?:-[a-z]+)*|-[a-zA-Z]+)$/;
const BATCH_REGEX = /^-[a-zA-Z]{2,}$/;
const BINDING_REGEX = /^([^=]+)=([\s\S]*)$/;
const DEBUG = process.env.DEBUG_CLI === `1`;

/**
 * A generic usage error with the name `UsageError`.
 *
 * It should be used over `Error` only when it's the user's fault.
 */
class UsageError extends Error {
    constructor(message) {
        super(message);
        this.clipanion = { type: `usage` };
        this.name = `UsageError`;
    }
}
class UnknownSyntaxError extends Error {
    constructor(input, candidates) {
        super();
        this.input = input;
        this.candidates = candidates;
        this.clipanion = { type: `none` };
        this.name = `UnknownSyntaxError`;
        if (this.candidates.length === 0) {
            this.message = `Command not found, but we're not sure what's the alternative.`;
        }
        else if (this.candidates.length === 1 && this.candidates[0].reason !== null) {
            const [{ usage, reason }] = this.candidates;
            this.message = `${reason}\n\n$ ${usage}`;
        }
        else if (this.candidates.length === 1) {
            const [{ usage }] = this.candidates;
            this.message = `Command not found; did you mean:\n\n$ ${usage}\n${whileRunning(input)}`;
        }
        else {
            this.message = `Command not found; did you mean one of:\n\n${this.candidates.map(({ usage }, index) => {
                return `${`${index}.`.padStart(4)} ${usage}`;
            }).join(`\n`)}\n\n${whileRunning(input)}`;
        }
    }
}
class AmbiguousSyntaxError extends Error {
    constructor(input, usages) {
        super();
        this.input = input;
        this.usages = usages;
        this.clipanion = { type: `none` };
        this.name = `AmbiguousSyntaxError`;
        this.message = `Cannot find who to pick amongst the following alternatives:\n\n${this.usages.map((usage, index) => {
            return `${`${index}.`.padStart(4)} ${usage}`;
        }).join(`\n`)}\n\n${whileRunning(input)}`;
    }
}
const whileRunning = (input) => `While running ${input.filter(token => {
    return token !== END_OF_INPUT;
}).map(token => {
    const json = JSON.stringify(token);
    if (token.match(/\s/) || token.length === 0 || json !== `"${token}"`) {
        return json;
    }
    else {
        return token;
    }
}).join(` `)}`;

// ------------------------------------------------------------------------
function debug(str) {
    if (DEBUG) {
        console.log(str);
    }
}
const basicHelpState = {
    candidateUsage: null,
    errorMessage: null,
    ignoreOptions: false,
    path: [],
    positionals: [],
    options: [],
    remainder: null,
    selectedIndex: HELP_COMMAND_INDEX
};
function makeStateMachine() {
    return {
        nodes: [makeNode(), makeNode(), makeNode()],
    };
}
function makeAnyOfMachine(inputs) {
    const output = makeStateMachine();
    const heads = [];
    let offset = output.nodes.length;
    for (const input of inputs) {
        heads.push(offset);
        for (let t = 0; t < input.nodes.length; ++t)
            if (!isTerminalNode(t))
                output.nodes.push(cloneNode(input.nodes[t], offset));
        offset += input.nodes.length - 2;
    }
    for (const head of heads)
        registerShortcut(output, NODE_INITIAL, head);
    return output;
}
function injectNode(machine, node) {
    machine.nodes.push(node);
    return machine.nodes.length - 1;
}
function simplifyMachine(input) {
    const visited = new Set();
    const process = (node) => {
        if (visited.has(node))
            return;
        visited.add(node);
        const nodeDef = input.nodes[node];
        for (const transitions of Object.values(nodeDef.statics))
            for (const { to } of transitions)
                process(to);
        for (const [, { to }] of nodeDef.dynamics)
            process(to);
        for (const { to } of nodeDef.shortcuts)
            process(to);
        const shortcuts = new Set(nodeDef.shortcuts.map(({ to }) => to));
        while (nodeDef.shortcuts.length > 0) {
            const { to } = nodeDef.shortcuts.shift();
            const toDef = input.nodes[to];
            for (const [segment, transitions] of Object.entries(toDef.statics)) {
                let store = !Object.prototype.hasOwnProperty.call(nodeDef.statics, segment)
                    ? nodeDef.statics[segment] = []
                    : nodeDef.statics[segment];
                for (const transition of transitions) {
                    if (!store.some(({ to }) => transition.to === to)) {
                        store.push(transition);
                    }
                }
            }
            for (const [test, transition] of toDef.dynamics)
                if (!nodeDef.dynamics.some(([otherTest, { to }]) => test === otherTest && transition.to === to))
                    nodeDef.dynamics.push([test, transition]);
            for (const transition of toDef.shortcuts) {
                if (!shortcuts.has(transition.to)) {
                    nodeDef.shortcuts.push(transition);
                    shortcuts.add(transition.to);
                }
            }
        }
    };
    process(NODE_INITIAL);
}
function debugMachine(machine, { prefix = `` } = {}) {
    debug(`${prefix}Nodes are:`);
    for (let t = 0; t < machine.nodes.length; ++t) {
        debug(`${prefix}  ${t}: ${JSON.stringify(machine.nodes[t])}`);
    }
}
function runMachineInternal(machine, input, partial = false) {
    debug(`Running a vm on ${JSON.stringify(input)}`);
    let branches = [{ node: NODE_INITIAL, state: {
                candidateUsage: null,
                errorMessage: null,
                ignoreOptions: false,
                options: [],
                path: [],
                positionals: [],
                remainder: null,
                selectedIndex: null,
            } }];
    debugMachine(machine, { prefix: `  ` });
    const tokens = [START_OF_INPUT, ...input];
    for (let t = 0; t < tokens.length; ++t) {
        const segment = tokens[t];
        debug(`  Processing ${JSON.stringify(segment)}`);
        const nextBranches = [];
        for (const { node, state } of branches) {
            debug(`    Current node is ${node}`);
            const nodeDef = machine.nodes[node];
            if (node === NODE_ERRORED) {
                nextBranches.push({ node, state });
                continue;
            }
            console.assert(nodeDef.shortcuts.length === 0, `Shortcuts should have been eliminated by now`);
            const hasExactMatch = Object.prototype.hasOwnProperty.call(nodeDef.statics, segment);
            if (!partial || t < tokens.length - 1 || hasExactMatch) {
                if (hasExactMatch) {
                    const transitions = nodeDef.statics[segment];
                    for (const { to, reducer } of transitions) {
                        nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment) : state });
                        debug(`      Static transition to ${to} found`);
                    }
                }
                else {
                    debug(`      No static transition found`);
                }
            }
            else {
                let hasMatches = false;
                for (const candidate of Object.keys(nodeDef.statics)) {
                    if (!candidate.startsWith(segment))
                        continue;
                    if (segment === candidate) {
                        for (const { to, reducer } of nodeDef.statics[candidate]) {
                            nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment) : state });
                            debug(`      Static transition to ${to} found`);
                        }
                    }
                    else {
                        for (const { to, reducer } of nodeDef.statics[candidate]) {
                            nextBranches.push({ node: to, state: Object.assign(Object.assign({}, state), { remainder: candidate.slice(segment.length) }) });
                            debug(`      Static transition to ${to} found (partial match)`);
                        }
                    }
                    hasMatches = true;
                }
                if (!hasMatches) {
                    debug(`      No partial static transition found`);
                }
            }
            if (segment !== END_OF_INPUT) {
                for (const [test, { to, reducer }] of nodeDef.dynamics) {
                    if (execute(tests, test, state, segment)) {
                        nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment) : state });
                        debug(`      Dynamic transition to ${to} found (via ${test})`);
                    }
                }
            }
        }
        if (nextBranches.length === 0 && segment === END_OF_INPUT && input.length === 1) {
            return [{
                    node: NODE_INITIAL,
                    state: basicHelpState,
                }];
        }
        if (nextBranches.length === 0) {
            throw new UnknownSyntaxError(input, branches.filter(({ node }) => {
                return node !== NODE_ERRORED;
            }).map(({ state }) => {
                return { usage: state.candidateUsage, reason: null };
            }));
        }
        if (nextBranches.every(({ node }) => node === NODE_ERRORED)) {
            throw new UnknownSyntaxError(input, nextBranches.map(({ state }) => {
                return { usage: state.candidateUsage, reason: state.errorMessage };
            }));
        }
        branches = trimSmallerBranches(nextBranches);
    }
    if (branches.length > 0) {
        debug(`  Results:`);
        for (const branch of branches) {
            debug(`    - ${branch.node} -> ${JSON.stringify(branch.state)}`);
        }
    }
    else {
        debug(`  No results`);
    }
    return branches;
}
function checkIfNodeIsFinished(node, state) {
    if (state.selectedIndex !== null)
        return true;
    if (Object.prototype.hasOwnProperty.call(node.statics, END_OF_INPUT))
        for (const { to } of node.statics[END_OF_INPUT])
            if (to === NODE_SUCCESS)
                return true;
    return false;
}
function suggestMachine(machine, input, partial) {
    // If we're accepting partial matches, then exact matches need to be
    // prefixed with an extra space.
    const prefix = partial && input.length > 0 ? [``] : [];
    const branches = runMachineInternal(machine, input, partial);
    const suggestions = [];
    const suggestionsJson = new Set();
    const traverseSuggestion = (suggestion, node, skipFirst = true) => {
        let nextNodes = [node];
        while (nextNodes.length > 0) {
            const currentNodes = nextNodes;
            nextNodes = [];
            for (const node of currentNodes) {
                const nodeDef = machine.nodes[node];
                const keys = Object.keys(nodeDef.statics);
                for (const key of Object.keys(nodeDef.statics)) {
                    const segment = keys[0];
                    for (const { to, reducer } of nodeDef.statics[segment]) {
                        if (reducer !== `pushPath`)
                            continue;
                        if (!skipFirst)
                            suggestion.push(segment);
                        nextNodes.push(to);
                    }
                }
            }
            skipFirst = false;
        }
        const json = JSON.stringify(suggestion);
        if (suggestionsJson.has(json))
            return;
        suggestions.push(suggestion);
        suggestionsJson.add(json);
    };
    for (const { node, state } of branches) {
        if (state.remainder !== null) {
            traverseSuggestion([state.remainder], node);
            continue;
        }
        const nodeDef = machine.nodes[node];
        const isFinished = checkIfNodeIsFinished(nodeDef, state);
        for (const [candidate, transitions] of Object.entries(nodeDef.statics))
            if ((isFinished && candidate !== END_OF_INPUT) || (!candidate.startsWith(`-`) && transitions.some(({ reducer }) => reducer === `pushPath`)))
                traverseSuggestion([...prefix, candidate], node);
        if (!isFinished)
            continue;
        for (const [test, { to }] of nodeDef.dynamics) {
            if (to === NODE_ERRORED)
                continue;
            const tokens = suggest(test, state);
            if (tokens === null)
                continue;
            for (const token of tokens) {
                traverseSuggestion([...prefix, token], node);
            }
        }
    }
    return [...suggestions].sort();
}
function runMachine(machine, input) {
    const branches = runMachineInternal(machine, [...input, END_OF_INPUT]);
    return selectBestState(input, branches.map(({ state }) => {
        return state;
    }));
}
function trimSmallerBranches(branches) {
    let maxPathSize = 0;
    for (const { state } of branches)
        if (state.path.length > maxPathSize)
            maxPathSize = state.path.length;
    return branches.filter(({ state }) => {
        return state.path.length === maxPathSize;
    });
}
function selectBestState(input, states) {
    const terminalStates = states.filter(state => {
        return state.selectedIndex !== null;
    });
    if (terminalStates.length === 0)
        throw new Error();
    let maxPathSize = 0;
    for (const state of terminalStates)
        if (state.path.length > maxPathSize)
            maxPathSize = state.path.length;
    const bestPathBranches = terminalStates.filter(state => {
        return state.path.length === maxPathSize;
    });
    const getPositionalCount = (state) => state.positionals.filter(({ extra }) => {
        return !extra;
    }).length + state.options.length;
    const statesWithPositionalCount = bestPathBranches.map(state => {
        return { state, positionalCount: getPositionalCount(state) };
    });
    let maxPositionalCount = 0;
    for (const { positionalCount } of statesWithPositionalCount)
        if (positionalCount > maxPositionalCount)
            maxPositionalCount = positionalCount;
    const bestPositionalStates = statesWithPositionalCount.filter(({ positionalCount }) => {
        return positionalCount === maxPositionalCount;
    }).map(({ state }) => {
        return state;
    });
    const fixedStates = aggregateHelpStates(bestPositionalStates);
    if (fixedStates.length > 1)
        throw new AmbiguousSyntaxError(input, fixedStates.map(state => state.candidateUsage));
    return fixedStates[0];
}
function aggregateHelpStates(states) {
    const notHelps = [];
    const helps = [];
    for (const state of states) {
        if (state.selectedIndex === HELP_COMMAND_INDEX) {
            helps.push(state);
        }
        else {
            notHelps.push(state);
        }
    }
    if (helps.length > 0) {
        notHelps.push(Object.assign(Object.assign({}, basicHelpState), { path: findCommonPrefix(...helps.map(state => state.path)), options: helps.reduce((options, state) => options.concat(state.options), []) }));
    }
    return notHelps;
}
function findCommonPrefix(firstPath, secondPath, ...rest) {
    if (secondPath === undefined)
        return Array.from(firstPath);
    return findCommonPrefix(firstPath.filter((segment, i) => segment === secondPath[i]), ...rest);
}
function makeNode() {
    return {
        dynamics: [],
        shortcuts: [],
        statics: {},
    };
}
function isTerminalNode(node) {
    return node === NODE_SUCCESS || node === NODE_ERRORED;
}
function cloneTransition(input, offset = 0) {
    return {
        to: !isTerminalNode(input.to) ? input.to > 2 ? input.to + offset - 2 : input.to + offset : input.to,
        reducer: input.reducer,
    };
}
function cloneNode(input, offset = 0) {
    const output = makeNode();
    for (const [test, transition] of input.dynamics)
        output.dynamics.push([test, cloneTransition(transition, offset)]);
    for (const transition of input.shortcuts)
        output.shortcuts.push(cloneTransition(transition, offset));
    for (const [segment, transitions] of Object.entries(input.statics))
        output.statics[segment] = transitions.map(transition => cloneTransition(transition, offset));
    return output;
}
function registerDynamic(machine, from, test, to, reducer) {
    machine.nodes[from].dynamics.push([
        test,
        { to, reducer: reducer }
    ]);
}
function registerShortcut(machine, from, to, reducer) {
    machine.nodes[from].shortcuts.push({ to, reducer: reducer });
}
function registerStatic(machine, from, test, to, reducer) {
    let store = !Object.prototype.hasOwnProperty.call(machine.nodes[from].statics, test)
        ? machine.nodes[from].statics[test] = []
        : machine.nodes[from].statics[test];
    store.push({ to, reducer: reducer });
}
function execute(store, callback, state, segment) {
    // TypeScript's control flow can't properly narrow
    // generic conditionals for some mysterious reason
    if (Array.isArray(callback)) {
        const [name, ...args] = callback;
        return store[name](state, segment, ...args);
    }
    else {
        return store[callback](state, segment);
    }
}
function suggest(callback, state) {
    const fn = Array.isArray(callback)
        ? tests[callback[0]]
        : tests[callback];
    // @ts-ignore
    if (typeof fn.suggest === `undefined`)
        return null;
    const args = Array.isArray(callback)
        ? callback.slice(1)
        : [];
    // @ts-ignore
    return fn.suggest(state, ...args);
}
const tests = {
    always: () => {
        return true;
    },
    isOptionLike: (state, segment) => {
        return !state.ignoreOptions && segment.startsWith(`-`);
    },
    isNotOptionLike: (state, segment) => {
        return state.ignoreOptions || !segment.startsWith(`-`);
    },
    isOption: (state, segment, name, hidden) => {
        return !state.ignoreOptions && segment === name;
    },
    isBatchOption: (state, segment, names) => {
        return !state.ignoreOptions && BATCH_REGEX.test(segment) && [...segment.slice(1)].every(name => names.includes(`-${name}`));
    },
    isBoundOption: (state, segment, names, options) => {
        const optionParsing = segment.match(BINDING_REGEX);
        return !state.ignoreOptions && !!optionParsing && OPTION_REGEX.test(optionParsing[1]) && names.includes(optionParsing[1])
            // Disallow bound options with no arguments (i.e. booleans)
            && options.filter(opt => opt.names.includes(optionParsing[1])).every(opt => opt.allowBinding);
    },
    isNegatedOption: (state, segment, name) => {
        return !state.ignoreOptions && segment === `--no-${name.slice(2)}`;
    },
    isHelp: (state, segment) => {
        return !state.ignoreOptions && HELP_REGEX.test(segment);
    },
    isUnsupportedOption: (state, segment, names) => {
        return !state.ignoreOptions && segment.startsWith(`-`) && OPTION_REGEX.test(segment) && !names.includes(segment);
    },
    isInvalidOption: (state, segment) => {
        return !state.ignoreOptions && segment.startsWith(`-`) && !OPTION_REGEX.test(segment);
    },
};
// @ts-ignore
tests.isOption.suggest = (state, name, hidden = true) => {
    return !hidden ? [name] : null;
};
const reducers = {
    setCandidateUsage: (state, segment, usage) => {
        return Object.assign(Object.assign({}, state), { candidateUsage: usage });
    },
    setSelectedIndex: (state, segment, index) => {
        return Object.assign(Object.assign({}, state), { selectedIndex: index });
    },
    pushBatch: (state, segment) => {
        return Object.assign(Object.assign({}, state), { options: state.options.concat([...segment.slice(1)].map(name => ({ name: `-${name}`, value: true }))) });
    },
    pushBound: (state, segment) => {
        const [, name, value] = segment.match(BINDING_REGEX);
        return Object.assign(Object.assign({}, state), { options: state.options.concat({ name, value }) });
    },
    pushPath: (state, segment) => {
        return Object.assign(Object.assign({}, state), { path: state.path.concat(segment) });
    },
    pushPositional: (state, segment) => {
        return Object.assign(Object.assign({}, state), { positionals: state.positionals.concat({ value: segment, extra: false }) });
    },
    pushExtra: (state, segment) => {
        return Object.assign(Object.assign({}, state), { positionals: state.positionals.concat({ value: segment, extra: true }) });
    },
    pushExtraNoLimits: (state, segment) => {
        return Object.assign(Object.assign({}, state), { positionals: state.positionals.concat({ value: segment, extra: NoLimits }) });
    },
    pushTrue: (state, segment, name = segment) => {
        return Object.assign(Object.assign({}, state), { options: state.options.concat({ name: segment, value: true }) });
    },
    pushFalse: (state, segment, name = segment) => {
        return Object.assign(Object.assign({}, state), { options: state.options.concat({ name, value: false }) });
    },
    pushUndefined: (state, segment) => {
        return Object.assign(Object.assign({}, state), { options: state.options.concat({ name: segment, value: undefined }) });
    },
    pushStringValue: (state, segment) => {
        var _a;
        const copy = Object.assign(Object.assign({}, state), { options: [...state.options] });
        const lastOption = state.options[state.options.length - 1];
        lastOption.value = ((_a = lastOption.value) !== null && _a !== void 0 ? _a : []).concat([segment]);
        return copy;
    },
    setStringValue: (state, segment) => {
        const copy = Object.assign(Object.assign({}, state), { options: [...state.options] });
        const lastOption = state.options[state.options.length - 1];
        lastOption.value = segment;
        return copy;
    },
    inhibateOptions: (state) => {
        return Object.assign(Object.assign({}, state), { ignoreOptions: true });
    },
    useHelp: (state, segment, command) => {
        const [, name, index] = segment.match(HELP_REGEX);
        if (typeof index !== `undefined`) {
            return Object.assign(Object.assign({}, state), { options: [{ name: `-c`, value: String(command) }, { name: `-i`, value: index }] });
        }
        else {
            return Object.assign(Object.assign({}, state), { options: [{ name: `-c`, value: String(command) }] });
        }
    },
    setError: (state, segment, errorMessage) => {
        if (segment === END_OF_INPUT) {
            return Object.assign(Object.assign({}, state), { errorMessage: `${errorMessage}.` });
        }
        else {
            return Object.assign(Object.assign({}, state), { errorMessage: `${errorMessage} ("${segment}").` });
        }
    },
    setOptionArityError: (state, segment) => {
        const lastOption = state.options[state.options.length - 1];
        return Object.assign(Object.assign({}, state), { errorMessage: `Not enough arguments to option ${lastOption.name}.` });
    },
};
// ------------------------------------------------------------------------
const NoLimits = Symbol();
class CommandBuilder {
    constructor(cliIndex, cliOpts) {
        this.allOptionNames = [];
        this.arity = { leading: [], trailing: [], extra: [], proxy: false };
        this.options = [];
        this.paths = [];
        this.cliIndex = cliIndex;
        this.cliOpts = cliOpts;
    }
    addPath(path) {
        this.paths.push(path);
    }
    setArity({ leading = this.arity.leading, trailing = this.arity.trailing, extra = this.arity.extra, proxy = this.arity.proxy }) {
        Object.assign(this.arity, { leading, trailing, extra, proxy });
    }
    addPositional({ name = 'arg', required = true } = {}) {
        if (!required && this.arity.extra === NoLimits)
            throw new Error(`Optional parameters cannot be declared when using .rest() or .proxy()`);
        if (!required && this.arity.trailing.length > 0)
            throw new Error(`Optional parameters cannot be declared after the required trailing positional arguments`);
        if (!required && this.arity.extra !== NoLimits) {
            this.arity.extra.push(name);
        }
        else if (this.arity.extra !== NoLimits && this.arity.extra.length === 0) {
            this.arity.leading.push(name);
        }
        else {
            this.arity.trailing.push(name);
        }
    }
    addRest({ name = 'arg', required = 0 } = {}) {
        if (this.arity.extra === NoLimits)
            throw new Error(`Infinite lists cannot be declared multiple times in the same command`);
        if (this.arity.trailing.length > 0)
            throw new Error(`Infinite lists cannot be declared after the required trailing positional arguments`);
        for (let t = 0; t < required; ++t)
            this.addPositional({ name });
        this.arity.extra = NoLimits;
    }
    addProxy({ required = 0 } = {}) {
        this.addRest({ required });
        this.arity.proxy = true;
    }
    addOption({ names, description, arity = 0, hidden = false, allowBinding = true }) {
        if (!allowBinding && arity > 1)
            throw new Error(`The arity cannot be higher than 1 when the option only supports the --arg=value syntax`);
        if (!Number.isInteger(arity))
            throw new Error(`The arity must be an integer, got ${arity}`);
        if (arity < 0)
            throw new Error(`The arity must be positive, got ${arity}`);
        this.allOptionNames.push(...names);
        this.options.push({ names, description, arity, hidden, allowBinding });
    }
    setContext(context) {
        this.context = context;
    }
    usage({ detailed = true, inlineOptions = true } = {}) {
        const segments = [this.cliOpts.binaryName];
        const detailedOptionList = [];
        if (this.paths.length > 0)
            segments.push(...this.paths[0]);
        if (detailed) {
            for (const { names, arity, hidden, description } of this.options) {
                if (hidden)
                    continue;
                const args = [];
                for (let t = 0; t < arity; ++t)
                    args.push(` #${t}`);
                const definition = `${names.join(`,`)}${args.join(``)}`;
                if (!inlineOptions && description) {
                    detailedOptionList.push({ definition, description });
                }
                else {
                    segments.push(`[${definition}]`);
                }
            }
            segments.push(...this.arity.leading.map(name => `<${name}>`));
            if (this.arity.extra === NoLimits)
                segments.push(`...`);
            else
                segments.push(...this.arity.extra.map(name => `[${name}]`));
            segments.push(...this.arity.trailing.map(name => `<${name}>`));
        }
        let usage = segments.join(` `);
        return { usage, options: detailedOptionList };
    }
    compile() {
        if (typeof this.context === `undefined`)
            throw new Error(`Assertion failed: No context attached`);
        const machine = makeStateMachine();
        let firstNode = NODE_INITIAL;
        firstNode = injectNode(machine, makeNode());
        registerStatic(machine, NODE_INITIAL, START_OF_INPUT, firstNode, [`setCandidateUsage`, this.usage().usage]);
        const positionalArgument = this.arity.proxy
            ? `always`
            : `isNotOptionLike`;
        const paths = this.paths.length > 0
            ? this.paths
            : [[]];
        for (const path of paths) {
            let lastPathNode = firstNode;
            // We allow options to be specified before the path. Note that we
            // only do this when there is a path, otherwise there would be
            // some redundancy with the options attached later.
            if (path.length > 0) {
                const optionPathNode = injectNode(machine, makeNode());
                registerShortcut(machine, lastPathNode, optionPathNode);
                this.registerOptions(machine, optionPathNode);
                lastPathNode = optionPathNode;
            }
            for (let t = 0; t < path.length; ++t) {
                const nextPathNode = injectNode(machine, makeNode());
                registerStatic(machine, lastPathNode, path[t], nextPathNode, `pushPath`);
                lastPathNode = nextPathNode;
            }
            if (this.arity.leading.length > 0 || !this.arity.proxy) {
                const helpNode = injectNode(machine, makeNode());
                registerDynamic(machine, lastPathNode, `isHelp`, helpNode, [`useHelp`, this.cliIndex]);
                registerStatic(machine, helpNode, END_OF_INPUT, NODE_SUCCESS, [`setSelectedIndex`, HELP_COMMAND_INDEX]);
                this.registerOptions(machine, lastPathNode);
            }
            if (this.arity.leading.length > 0)
                registerStatic(machine, lastPathNode, END_OF_INPUT, NODE_ERRORED, [`setError`, `Not enough positional arguments`]);
            let lastLeadingNode = lastPathNode;
            for (let t = 0; t < this.arity.leading.length; ++t) {
                const nextLeadingNode = injectNode(machine, makeNode());
                if (!this.arity.proxy)
                    this.registerOptions(machine, nextLeadingNode);
                if (this.arity.trailing.length > 0 || t + 1 !== this.arity.leading.length)
                    registerStatic(machine, nextLeadingNode, END_OF_INPUT, NODE_ERRORED, [`setError`, `Not enough positional arguments`]);
                registerDynamic(machine, lastLeadingNode, `isNotOptionLike`, nextLeadingNode, `pushPositional`);
                lastLeadingNode = nextLeadingNode;
            }
            let lastExtraNode = lastLeadingNode;
            if (this.arity.extra === NoLimits || this.arity.extra.length > 0) {
                const extraShortcutNode = injectNode(machine, makeNode());
                registerShortcut(machine, lastLeadingNode, extraShortcutNode);
                if (this.arity.extra === NoLimits) {
                    const extraNode = injectNode(machine, makeNode());
                    if (!this.arity.proxy)
                        this.registerOptions(machine, extraNode);
                    registerDynamic(machine, lastLeadingNode, positionalArgument, extraNode, `pushExtraNoLimits`);
                    registerDynamic(machine, extraNode, positionalArgument, extraNode, `pushExtraNoLimits`);
                    registerShortcut(machine, extraNode, extraShortcutNode);
                }
                else {
                    for (let t = 0; t < this.arity.extra.length; ++t) {
                        const nextExtraNode = injectNode(machine, makeNode());
                        if (!this.arity.proxy)
                            this.registerOptions(machine, nextExtraNode);
                        registerDynamic(machine, lastExtraNode, positionalArgument, nextExtraNode, `pushExtra`);
                        registerShortcut(machine, nextExtraNode, extraShortcutNode);
                        lastExtraNode = nextExtraNode;
                    }
                }
                lastExtraNode = extraShortcutNode;
            }
            if (this.arity.trailing.length > 0)
                registerStatic(machine, lastExtraNode, END_OF_INPUT, NODE_ERRORED, [`setError`, `Not enough positional arguments`]);
            let lastTrailingNode = lastExtraNode;
            for (let t = 0; t < this.arity.trailing.length; ++t) {
                const nextTrailingNode = injectNode(machine, makeNode());
                if (!this.arity.proxy)
                    this.registerOptions(machine, nextTrailingNode);
                if (t + 1 < this.arity.trailing.length)
                    registerStatic(machine, nextTrailingNode, END_OF_INPUT, NODE_ERRORED, [`setError`, `Not enough positional arguments`]);
                registerDynamic(machine, lastTrailingNode, `isNotOptionLike`, nextTrailingNode, `pushPositional`);
                lastTrailingNode = nextTrailingNode;
            }
            registerDynamic(machine, lastTrailingNode, positionalArgument, NODE_ERRORED, [`setError`, `Extraneous positional argument`]);
            registerStatic(machine, lastTrailingNode, END_OF_INPUT, NODE_SUCCESS, [`setSelectedIndex`, this.cliIndex]);
        }
        return {
            machine,
            context: this.context,
        };
    }
    registerOptions(machine, node) {
        registerDynamic(machine, node, [`isOption`, `--`], node, `inhibateOptions`);
        registerDynamic(machine, node, [`isBatchOption`, this.allOptionNames], node, `pushBatch`);
        registerDynamic(machine, node, [`isBoundOption`, this.allOptionNames, this.options], node, `pushBound`);
        registerDynamic(machine, node, [`isUnsupportedOption`, this.allOptionNames], NODE_ERRORED, [`setError`, `Unsupported option name`]);
        registerDynamic(machine, node, [`isInvalidOption`], NODE_ERRORED, [`setError`, `Invalid option name`]);
        for (const option of this.options) {
            const longestName = option.names.reduce((longestName, name) => {
                return name.length > longestName.length ? name : longestName;
            }, ``);
            if (option.arity === 0) {
                for (const name of option.names) {
                    registerDynamic(machine, node, [`isOption`, name, option.hidden || name !== longestName], node, `pushTrue`);
                    if (name.startsWith(`--`) && !name.startsWith(`--no-`)) {
                        registerDynamic(machine, node, [`isNegatedOption`, name], node, [`pushFalse`, name]);
                    }
                }
            }
            else {
                // We inject a new node at the end of the state machine
                let lastNode = injectNode(machine, makeNode());
                // We register transitions from the starting node to this new node
                for (const name of option.names) {
                    registerDynamic(machine, node, [`isOption`, name, option.hidden || name !== longestName], lastNode, `pushUndefined`);
                }
                // For each argument, we inject a new node at the end and we
                // register a transition from the current node to this new node
                for (let t = 0; t < option.arity; ++t) {
                    const nextNode = injectNode(machine, makeNode());
                    // We can provide better errors when another option or END_OF_INPUT is encountered
                    registerStatic(machine, lastNode, END_OF_INPUT, NODE_ERRORED, `setOptionArityError`);
                    registerDynamic(machine, lastNode, `isOptionLike`, NODE_ERRORED, `setOptionArityError`);
                    // If the option has a single argument, no need to store it in an array
                    const action = option.arity === 1
                        ? `setStringValue`
                        : `pushStringValue`;
                    registerDynamic(machine, lastNode, `isNotOptionLike`, nextNode, action);
                    lastNode = nextNode;
                }
                // In the end, we register a shortcut from
                // the last node back to the starting node
                registerShortcut(machine, lastNode, node);
            }
        }
    }
}
class CliBuilder {
    constructor({ binaryName = `...` } = {}) {
        this.builders = [];
        this.opts = { binaryName };
    }
    static build(cbs, opts = {}) {
        return new CliBuilder(opts).commands(cbs).compile();
    }
    getBuilderByIndex(n) {
        if (!(n >= 0 && n < this.builders.length))
            throw new Error(`Assertion failed: Out-of-bound command index (${n})`);
        return this.builders[n];
    }
    commands(cbs) {
        for (const cb of cbs)
            cb(this.command());
        return this;
    }
    command() {
        const builder = new CommandBuilder(this.builders.length, this.opts);
        this.builders.push(builder);
        return builder;
    }
    compile() {
        const machines = [];
        const contexts = [];
        for (const builder of this.builders) {
            const { machine, context } = builder.compile();
            machines.push(machine);
            contexts.push(context);
        }
        const machine = makeAnyOfMachine(machines);
        simplifyMachine(machine);
        return {
            machine,
            contexts,
            process: (input) => {
                return runMachine(machine, input);
            },
            suggest: (input, partial) => {
                return suggestMachine(machine, input, partial);
            },
        };
    }
}

class Command {
    constructor() {
        /**
         * Predefined that will be set to true if `-h,--help` has been used, in which case `Command#execute` shouldn't be called.
         */
        this.help = false;
    }
    static getMeta(prototype) {
        const base = prototype.constructor;
        return base.meta = Object.prototype.hasOwnProperty.call(base, `meta`) ? base.meta : {
            definitions: [],
            transformers: [
                (state, command) => {
                    for (const { name, value } of state.options) {
                        if (name === `-h` || name === `--help`) {
                            // @ts-ignore: The property is meant to have been defined by the child class
                            command.help = value;
                        }
                    }
                },
            ],
        };
    }
    static resolveMeta(prototype) {
        const definitions = [];
        const transformers = [];
        for (let proto = prototype; proto instanceof Command; proto = proto.__proto__) {
            const meta = this.getMeta(proto);
            for (const definition of meta.definitions)
                definitions.push(definition);
            for (const transformer of meta.transformers) {
                transformers.push(transformer);
            }
        }
        return {
            definitions,
            transformers,
        };
    }
    static registerDefinition(prototype, definition) {
        this.getMeta(prototype).definitions.push(definition);
    }
    static registerTransformer(prototype, transformer) {
        this.getMeta(prototype).transformers.push(transformer);
    }
    static addPath(...path) {
        this.Path(...path)(this.prototype, `execute`);
    }
    static addOption(name, builder) {
        builder(this.prototype, name);
    }
    /**
     * Wrap the specified command to be attached to the given path on the command line.
     * The first path thus attached will be considered the "main" one, and all others will be aliases.
     * @param path The command path.
     */
    static Path(...path) {
        return (prototype, propertyName) => {
            this.registerDefinition(prototype, command => {
                command.addPath(path);
            });
        };
    }
    /**
     * Register a boolean listener for the given option names. When Clipanion detects that this argument is present, the value will be set to false. The value won't be set unless the option is found, so you must remember to set it to an appropriate default value.
     * @param descriptor the option names.
     */
    static Boolean(descriptor, { hidden = false, description } = {}) {
        return (prototype, propertyName) => {
            const optNames = descriptor.split(`,`);
            this.registerDefinition(prototype, command => {
                command.addOption({ names: optNames, arity: 0, hidden, allowBinding: false, description });
            });
            this.registerTransformer(prototype, (state, command) => {
                for (const { name, value } of state.options) {
                    if (optNames.includes(name)) {
                        // @ts-ignore: The property is meant to have been defined by the child class
                        command[propertyName] = value;
                    }
                }
            });
        };
    }
    /**
     * Register a boolean listener for the given option names. Each time Clipanion detects that this argument is present, the counter will be incremented. Each time the argument is negated, the counter will be reset to `0`. The counter won't be set unless the option is found, so you must remember to set it to an appropriate default value.

     * @param descriptor A comma-separated list of option names.
     */
    static Counter(descriptor, { hidden = false, description } = {}) {
        return (prototype, propertyName) => {
            const optNames = descriptor.split(`,`);
            this.registerDefinition(prototype, command => {
                command.addOption({ names: optNames, arity: 0, hidden, allowBinding: false, description });
            });
            this.registerTransformer(prototype, (state, command) => {
                var _a;
                for (const { name, value } of state.options) {
                    if (optNames.includes(name)) {
                        // @ts-ignore: The property is meant to have been defined by the child class
                        (_a = command[propertyName]) !== null && _a !== void 0 ? _a : (command[propertyName] = 0);
                        // Negated options reset the counter
                        if (!value) {
                            // @ts-ignore: The property is meant to have been defined by the child class
                            command[propertyName] = 0;
                        }
                        else {
                            // @ts-ignore: The property is meant to have been defined by the child class
                            command[propertyName]++;
                        }
                    }
                }
            });
        };
    }
    static String(descriptor = {}, { arity = 1, tolerateBoolean = false, hidden = false, description } = {}) {
        return (prototype, propertyName) => {
            if (typeof descriptor === `string`) {
                const optNames = descriptor.split(`,`);
                this.registerDefinition(prototype, command => {
                    // If tolerateBoolean is specified, the command will only accept a string value
                    // using the bind syntax and will otherwise act like a boolean option
                    command.addOption({ names: optNames, arity: tolerateBoolean ? 0 : arity, hidden, description });
                });
                this.registerTransformer(prototype, (state, command) => {
                    for (const { name, value } of state.options) {
                        if (optNames.includes(name)) {
                            // @ts-ignore: The property is meant to have been defined by the child class
                            command[propertyName] = value;
                        }
                    }
                });
            }
            else {
                const { name = propertyName, required = true } = descriptor;
                this.registerDefinition(prototype, command => {
                    command.addPositional({ name, required });
                });
                this.registerTransformer(prototype, (state, command) => {
                    for (let i = 0; i < state.positionals.length; ++i) {
                        // We skip NoLimits extras. We only care about
                        // required and optional finite positionals.
                        if (state.positionals[i].extra === NoLimits)
                            continue;
                        // We skip optional positionals when we only
                        // care about required positionals.
                        if (required && state.positionals[i].extra === true)
                            continue;
                        // We skip required positionals when we only
                        // care about optional positionals.
                        if (!required && state.positionals[i].extra === false)
                            continue;
                        // We remove the positional from the list
                        const [positional] = state.positionals.splice(i, 1);
                        // We assign its value to the property.
                        // @ts-ignore: The property is meant to have been defined by the child class
                        command[propertyName] = positional.value;
                        // We stop after the first successful iteration.
                        break;
                    }
                });
            }
        };
    }
    /**
     * Register a listener that looks for an option and its followup argument. When Clipanion detects that this argument is present, the value will be pushed into the array represented in the property.
     */
    static Array(descriptor, { arity = 1, hidden = false, description } = {}) {
        return (prototype, propertyName) => {
            if (arity === 0)
                throw new Error(`Array options are expected to have at least an arity of 1`);
            const optNames = descriptor.split(`,`);
            this.registerDefinition(prototype, command => {
                command.addOption({ names: optNames, arity, hidden, description });
            });
            this.registerTransformer(prototype, (state, command) => {
                for (const { name, value } of state.options) {
                    if (optNames.includes(name)) {
                        // @ts-ignore: The property is meant to have been defined by the child class
                        command[propertyName] = command[propertyName] || [];
                        // @ts-ignore: The property is meant to have been defined by the child class
                        command[propertyName].push(value);
                    }
                }
            });
        };
    }
    static Rest({ required = 0 } = {}) {
        return (prototype, propertyName) => {
            this.registerDefinition(prototype, command => {
                command.addRest({ name: propertyName, required });
            });
            this.registerTransformer(prototype, (state, command, builder) => {
                // The builder's arity.extra will always be NoLimits,
                // because it is set when we call registerDefinition
                const isRestPositional = (index) => {
                    const positional = state.positionals[index];
                    // A NoLimits extra (i.e. an optional rest argument)
                    if (positional.extra === NoLimits)
                        return true;
                    // A leading positional (i.e. a required rest argument)
                    if (positional.extra === false && index < builder.arity.leading.length)
                        return true;
                    return false;
                };
                let count = 0;
                while (count < state.positionals.length && isRestPositional(count))
                    count += 1;
                // @ts-ignore: The property is meant to have been defined by the child class
                command[propertyName] = state.positionals
                    .splice(0, count)
                    .map(({ value }) => value);
            });
        };
    }
    /**
     * Register a listener that takes all the arguments remaining (including options and such) and store them into the selected property.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     */
    static Proxy({ required = 0 } = {}) {
        return (prototype, propertyName) => {
            this.registerDefinition(prototype, command => {
                command.addProxy({ required });
            });
            this.registerTransformer(prototype, (state, command) => {
                // No need to filter / splice any positionals for Command.Proxy.
                // Once inside a proxy, we've already reached the point of no return.
                // @ts-ignore: The property is meant to have been defined by the child class
                command[propertyName] = state.positionals.map(({ value }) => value);
            });
        };
    }
    /**
     * Defines the usage information for the given command.
     * @param usage
     */
    static Usage(usage) {
        return usage;
    }
    /**
     * Defines the schema for the given command.
     * @param schema
     */
    static Schema(schema) {
        return schema;
    }
    /**
     * Standard error handler which will simply rethrow the error. Can be used to add custom logic to handle errors
     * from the command or simply return the parent class error handling.
     * @param error
     */
    async catch(error) {
        throw error;
    }
    async validateAndExecute() {
        const commandClass = this.constructor;
        const schema = commandClass.schema;
        if (typeof schema !== `undefined`) {
            try {
                await schema.validate(this);
            }
            catch (error) {
                if (error.name === `ValidationError`)
                    error.clipanion = { type: `usage` };
                throw error;
            }
        }
        const exitCode = await this.execute();
        if (typeof exitCode !== `undefined`) {
            return exitCode;
        }
        else {
            return 0;
        }
    }
}
/**
 * A list of useful semi-opinionated command entries that have to be registered manually.
 *
 * They cover the basic needs of most CLIs (e.g. help command, version command).
 *
 * @example
 * cli.register(Command.Entries.Help);
 * cli.register(Command.Entries.Version);
 */
Command.Entries = {};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

class HelpCommand extends Command {
    async execute() {
        this.context.stdout.write(this.cli.usage(null));
    }
}
__decorate([
    Command.Path(`--help`),
    Command.Path(`-h`)
], HelpCommand.prototype, "execute", null);

class VersionCommand extends Command {
    async execute() {
        var _a;
        this.context.stdout.write(`${(_a = this.cli.binaryVersion) !== null && _a !== void 0 ? _a : `<unknown>`}\n`);
    }
}
__decorate([
    Command.Path(`--version`),
    Command.Path(`-v`)
], VersionCommand.prototype, "execute", null);

const richFormat = {
    bold: str => `\x1b[1m${str}\x1b[22m`,
    error: str => `\x1b[31m\x1b[1m${str}\x1b[22m\x1b[39m`,
    code: str => `\x1b[36m${str}\x1b[39m`,
};
const textFormat = {
    bold: str => str,
    error: str => str,
    code: str => str,
};
function formatMarkdownish(text, { format, paragraphs }) {
    // Enforce \n as newline character
    text = text.replace(/\r\n?/g, `\n`);
    // Remove the indentation, since it got messed up with the JS indentation
    text = text.replace(/^[\t ]+|[\t ]+$/gm, ``);
    // Remove surrounding newlines, since they got added for JS formatting
    text = text.replace(/^\n+|\n+$/g, ``);
    // List items always end with at least two newlines (in order to not be collapsed)
    text = text.replace(/^-([^\n]*?)\n+/gm, `-$1\n\n`);
    // Single newlines are removed; larger than that are collapsed into one
    text = text.replace(/\n(\n)?\n*/g, `$1`);
    if (paragraphs) {
        text = text.split(/\n/).map(function (paragraph) {
            // Does the paragraph starts with a list?
            let bulletMatch = paragraph.match(/^[*-][\t ]+(.*)/);
            if (!bulletMatch)
                // No, cut the paragraphs into segments of 80 characters
                return paragraph.match(/(.{1,80})(?: |$)/g).join('\n');
            // Yes, cut the paragraphs into segments of 78 characters (to account for the prefix)
            return bulletMatch[1].match(/(.{1,78})(?: |$)/g).map((line, index) => {
                return (index === 0 ? `- ` : `  `) + line;
            }).join(`\n`);
        }).join(`\n\n`);
    }
    // Highlight the code segments
    text = text.replace(/(`+)((?:.|[\n])*?)\1/g, function ($0, $1, $2) {
        return format.code($1 + $2 + $1);
    });
    return text ? text + `\n` : ``;
}

class HelpCommand$1 extends Command {
    constructor(contexts) {
        super();
        this.contexts = contexts;
        this.commands = [];
    }
    static from(state, contexts) {
        const command = new HelpCommand$1(contexts);
        command.path = state.path;
        for (const opt of state.options) {
            switch (opt.name) {
                case `-c`:
                    {
                        command.commands.push(Number(opt.value));
                    }
                    break;
                case `-i`:
                    {
                        command.index = Number(opt.value);
                    }
                    break;
            }
        }
        return command;
    }
    async execute() {
        let commands = this.commands;
        if (typeof this.index !== `undefined` && this.index >= 0 && this.index < commands.length)
            commands = [commands[this.index]];
        if (commands.length === 0) {
            this.context.stdout.write(this.cli.usage());
        }
        else if (commands.length === 1) {
            this.context.stdout.write(this.cli.usage(this.contexts[commands[0]].commandClass, { detailed: true }));
        }
        else if (commands.length > 1) {
            this.context.stdout.write(`Multiple commands match your selection:\n`);
            this.context.stdout.write(`\n`);
            let index = 0;
            for (const command of this.commands)
                this.context.stdout.write(this.cli.usage(this.contexts[command].commandClass, { prefix: `${index++}. `.padStart(5) }));
            this.context.stdout.write(`\n`);
            this.context.stdout.write(`Run again with -h=<index> to see the longer details of any of those commands.\n`);
        }
    }
}

function getDefaultColorSettings() {
    if (process.env.FORCE_COLOR === `0`)
        return false;
    if (process.env.FORCE_COLOR === `1`)
        return true;
    if (typeof process.stdout !== `undefined` && process.stdout.isTTY)
        return true;
    return false;
}
/**
 * @template Context The context shared by all commands. Contexts are a set of values, defined when calling the `run`/`runExit` functions from the CLI instance, that will be made available to the commands via `this.context`.
 */
class Cli {
    constructor({ binaryLabel, binaryName: binaryNameOpt = `...`, binaryVersion, enableColors = getDefaultColorSettings() } = {}) {
        this.registrations = new Map();
        this.builder = new CliBuilder({ binaryName: binaryNameOpt });
        this.binaryLabel = binaryLabel;
        this.binaryName = binaryNameOpt;
        this.binaryVersion = binaryVersion;
        this.enableColors = enableColors;
    }
    /**
     * Creates a new Cli and registers all commands passed as parameters.
     *
     * @param commandClasses The Commands to register
     * @returns The created `Cli` instance
     */
    static from(commandClasses, options = {}) {
        const cli = new Cli(options);
        for (const commandClass of commandClasses)
            cli.register(commandClass);
        return cli;
    }
    /**
     * Registers a command inside the CLI.
     */
    register(commandClass) {
        const commandBuilder = this.builder.command();
        this.registrations.set(commandClass, commandBuilder.cliIndex);
        const { definitions } = commandClass.resolveMeta(commandClass.prototype);
        for (const definition of definitions)
            definition(commandBuilder);
        commandBuilder.setContext({
            commandClass,
        });
    }
    process(input) {
        const { contexts, process } = this.builder.compile();
        const state = process(input);
        switch (state.selectedIndex) {
            case HELP_COMMAND_INDEX:
                {
                    return HelpCommand$1.from(state, contexts);
                }
            default:
                {
                    const { commandClass } = contexts[state.selectedIndex];
                    const index = this.registrations.get(commandClass);
                    if (typeof index === `undefined`)
                        throw new Error(`Assertion failed: Expected the command class to have been registered.`);
                    const commandBuilder = this.builder.getBuilderByIndex(index);
                    const command = new commandClass();
                    command.path = state.path;
                    const { transformers } = commandClass.resolveMeta(commandClass.prototype);
                    for (const transformer of transformers)
                        transformer(state, command, commandBuilder);
                    return command;
                }
        }
    }
    async run(input, context) {
        let command;
        if (!Array.isArray(input)) {
            command = input;
        }
        else {
            try {
                command = this.process(input);
            }
            catch (error) {
                context.stdout.write(this.error(error));
                return 1;
            }
        }
        if (command.help) {
            context.stdout.write(this.usage(command, { detailed: true }));
            return 0;
        }
        command.context = context;
        command.cli = {
            binaryLabel: this.binaryLabel,
            binaryName: this.binaryName,
            binaryVersion: this.binaryVersion,
            enableColors: this.enableColors,
            definitions: () => this.definitions(),
            error: (error, opts) => this.error(error, opts),
            process: input => this.process(input),
            run: (input, subContext) => this.run(input, Object.assign(Object.assign({}, context), subContext)),
            usage: (command, opts) => this.usage(command, opts),
        };
        let exitCode;
        try {
            exitCode = await command.validateAndExecute().catch(error => command.catch(error).then(() => 0));
        }
        catch (error) {
            context.stdout.write(this.error(error, { command }));
            return 1;
        }
        return exitCode;
    }
    /**
     * Runs a command and exits the current `process` with the exit code returned by the command.
     *
     * @param input An array containing the name of the command and its arguments.
     *
     * @example
     * cli.runExit(process.argv.slice(2), Cli.defaultContext)
     */
    async runExit(input, context) {
        process.exitCode = await this.run(input, context);
    }
    suggest(input, partial) {
        const { contexts, process, suggest } = this.builder.compile();
        return suggest(input, partial);
    }
    definitions({ colored = false } = {}) {
        const data = [];
        for (const [commandClass, number] of this.registrations) {
            if (typeof commandClass.usage === `undefined`)
                continue;
            const { usage: path } = this.getUsageByIndex(number, { detailed: false });
            const { usage, options } = this.getUsageByIndex(number, { detailed: true, inlineOptions: false });
            const category = typeof commandClass.usage.category !== `undefined`
                ? formatMarkdownish(commandClass.usage.category, { format: this.format(colored), paragraphs: false })
                : undefined;
            const description = typeof commandClass.usage.description !== `undefined`
                ? formatMarkdownish(commandClass.usage.description, { format: this.format(colored), paragraphs: false })
                : undefined;
            const details = typeof commandClass.usage.details !== `undefined`
                ? formatMarkdownish(commandClass.usage.details, { format: this.format(colored), paragraphs: true })
                : undefined;
            const examples = typeof commandClass.usage.examples !== `undefined`
                ? commandClass.usage.examples.map(([label, cli]) => [formatMarkdownish(label, { format: this.format(colored), paragraphs: false }), cli.replace(/\$0/g, this.binaryName)])
                : undefined;
            data.push({ path, usage, category, description, details, examples, options });
        }
        return data;
    }
    usage(command = null, { colored, detailed = false, prefix = `$ ` } = {}) {
        // @ts-ignore
        const commandClass = command !== null && typeof command.getMeta === `undefined`
            ? command.constructor
            : command;
        let result = ``;
        if (!commandClass) {
            const commandsByCategories = new Map();
            for (const [commandClass, number] of this.registrations.entries()) {
                if (typeof commandClass.usage === `undefined`)
                    continue;
                const category = typeof commandClass.usage.category !== `undefined`
                    ? formatMarkdownish(commandClass.usage.category, { format: this.format(colored), paragraphs: false })
                    : null;
                let categoryCommands = commandsByCategories.get(category);
                if (typeof categoryCommands === `undefined`)
                    commandsByCategories.set(category, categoryCommands = []);
                const { usage } = this.getUsageByIndex(number);
                categoryCommands.push({ commandClass, usage });
            }
            const categoryNames = Array.from(commandsByCategories.keys()).sort((a, b) => {
                if (a === null)
                    return -1;
                if (b === null)
                    return +1;
                return a.localeCompare(b, `en`, { usage: `sort`, caseFirst: `upper` });
            });
            const hasLabel = typeof this.binaryLabel !== `undefined`;
            const hasVersion = typeof this.binaryVersion !== `undefined`;
            if (hasLabel || hasVersion) {
                if (hasLabel && hasVersion)
                    result += `${this.format(colored).bold(`${this.binaryLabel} - ${this.binaryVersion}`)}\n\n`;
                else if (hasLabel)
                    result += `${this.format(colored).bold(`${this.binaryLabel}`)}\n`;
                else
                    result += `${this.format(colored).bold(`${this.binaryVersion}`)}\n`;
                result += `  ${this.format(colored).bold(prefix)}${this.binaryName} <command>\n`;
            }
            else {
                result += `${this.format(colored).bold(prefix)}${this.binaryName} <command>\n`;
            }
            for (let categoryName of categoryNames) {
                const commands = commandsByCategories.get(categoryName).slice().sort((a, b) => {
                    return a.usage.localeCompare(b.usage, `en`, { usage: `sort`, caseFirst: `upper` });
                });
                const header = categoryName !== null
                    ? categoryName.trim()
                    : `Where <command> is one of`;
                result += `\n`;
                result += `${this.format(colored).bold(`${header}:`)}\n`;
                for (let { commandClass, usage } of commands) {
                    const doc = commandClass.usage.description || `undocumented`;
                    result += `\n`;
                    result += `  ${this.format(colored).bold(usage)}\n`;
                    result += `    ${formatMarkdownish(doc, { format: this.format(colored), paragraphs: false })}`;
                }
            }
            result += `\n`;
            result += formatMarkdownish(`You can also print more details about any of these commands by calling them after adding the \`-h,--help\` flag right after the command name.`, { format: this.format(colored), paragraphs: true });
        }
        else {
            if (!detailed) {
                const { usage } = this.getUsageByRegistration(commandClass);
                result += `${this.format(colored).bold(prefix)}${usage}\n`;
            }
            else {
                const { description = ``, details = ``, examples = [], } = commandClass.usage || {};
                if (description !== ``) {
                    result += formatMarkdownish(description, { format: this.format(colored), paragraphs: false }).replace(/^./, $0 => $0.toUpperCase());
                    result += `\n`;
                }
                if (details !== `` || examples.length > 0) {
                    result += `${this.format(colored).bold(`Usage:`)}\n`;
                    result += `\n`;
                }
                const { usage, options } = this.getUsageByRegistration(commandClass, { inlineOptions: false });
                result += `${this.format(colored).bold(prefix)}${usage}\n`;
                if (options.length > 0) {
                    result += `\n`;
                    result += `${richFormat.bold('Options:')}\n`;
                    const maxDefinitionLength = options.reduce((length, option) => {
                        return Math.max(length, option.definition.length);
                    }, 0);
                    result += `\n`;
                    for (const { definition, description } of options) {
                        result += `  ${definition.padEnd(maxDefinitionLength)}    ${formatMarkdownish(description, { format: this.format(colored), paragraphs: false })}`;
                    }
                }
                if (details !== ``) {
                    result += `\n`;
                    result += `${this.format(colored).bold(`Details:`)}\n`;
                    result += `\n`;
                    result += formatMarkdownish(details, { format: this.format(colored), paragraphs: true });
                }
                if (examples.length > 0) {
                    result += `\n`;
                    result += `${this.format(colored).bold(`Examples:`)}\n`;
                    for (let [description, example] of examples) {
                        result += `\n`;
                        result += formatMarkdownish(description, { format: this.format(colored), paragraphs: false });
                        result += example
                            .replace(/^/m, `  ${this.format(colored).bold(prefix)}`)
                            .replace(/\$0/g, this.binaryName)
                            + `\n`;
                    }
                }
            }
        }
        return result;
    }
    error(error, { colored, command = null } = {}) {
        if (!(error instanceof Error))
            error = new Error(`Execution failed with a non-error rejection (rejected value: ${JSON.stringify(error)})`);
        let result = ``;
        let name = error.name.replace(/([a-z])([A-Z])/g, `$1 $2`);
        if (name === `Error`)
            name = `Internal Error`;
        result += `${this.format(colored).error(name)}: ${error.message}\n`;
        // @ts-ignore
        const meta = error.clipanion;
        if (typeof meta !== `undefined`) {
            if (meta.type === `usage`) {
                result += `\n`;
                result += this.usage(command);
            }
        }
        else {
            if (error.stack) {
                result += `${error.stack.replace(/^.*\n/, ``)}\n`;
            }
        }
        return result;
    }
    getUsageByRegistration(klass, opts) {
        const index = this.registrations.get(klass);
        if (typeof index === `undefined`)
            throw new Error(`Assertion failed: Unregistered command`);
        return this.getUsageByIndex(index, opts);
    }
    getUsageByIndex(n, opts) {
        return this.builder.getBuilderByIndex(n).usage(opts);
    }
    format(colored = this.enableColors) {
        return colored ? richFormat : textFormat;
    }
}
/**
 * The default context of the CLI.
 *
 * Contains the stdio of the current `process`.
 */
Cli.defaultContext = {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
};

Command.Entries.Help = HelpCommand;
Command.Entries.Version = VersionCommand;

exports.Cli = Cli;
exports.Command = Command;
exports.UsageError = UsageError;
