/// <reference types="node" />
import { Readable, Writable } from "stream";
// ------------------------------------------------------------------------
type StateMachine = {
    nodes: Node[];
};
type RunState = {
    candidateUsage: string | null;
    errorMessage: string | null;
    ignoreOptions: boolean;
    options: {
        name: string;
        value: any;
    }[];
    path: string[];
    positionals: {
        value: string;
        extra: boolean | typeof NoLimits;
    }[];
    remainder: string | null;
    selectedIndex: number | null;
};
// ------------------------------------------------------------------------
type Transition = {
    to: number;
    reducer?: Callback<keyof typeof reducers, typeof reducers>;
};
type Node = {
    dynamics: [Callback<keyof typeof tests, typeof tests>, Transition][];
    shortcuts: Transition[];
    statics: {
        [segment: string]: Transition[];
    };
};
type CallbackFn<P extends any[], R> = (state: RunState, segment: string, ...args: P) => R;
type CallbackStore<T extends string, R> = Record<T, CallbackFn<any, R>>;
type Callback<T extends string, S extends CallbackStore<T, any>> = [
] extends [
] ? (T | [
]) : [
];
declare const tests: {
    always: () => boolean;
    isOptionLike: (state: RunState, segment: string) => boolean;
    isNotOptionLike: (state: RunState, segment: string) => boolean;
    isOption: (state: RunState, segment: string, name: string, hidden?: boolean | undefined) => boolean;
    isBatchOption: (state: RunState, segment: string, names: string[]) => boolean;
    isBoundOption: (state: RunState, segment: string, names: string[], options: OptDefinition[]) => boolean;
    isNegatedOption: (state: RunState, segment: string, name: string) => boolean;
    isHelp: (state: RunState, segment: string) => boolean;
    isUnsupportedOption: (state: RunState, segment: string, names: string[]) => boolean;
    isInvalidOption: (state: RunState, segment: string) => boolean;
}; // @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
declare const reducers: {
    setCandidateUsage: (state: RunState, segment: string, usage: string) => {
        candidateUsage: string;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    setSelectedIndex: (state: RunState, segment: string, index: number) => {
        selectedIndex: number;
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
    };
    pushBatch: (state: RunState, segment: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushBound: (state: RunState, segment: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushPath: (state: RunState, segment: string) => {
        path: string[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushPositional: (state: RunState, segment: string) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushExtra: (state: RunState, segment: string) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushExtraNoLimits: (state: RunState, segment: string) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushTrue: (state: RunState, segment: string, name?: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushFalse: (state: RunState, segment: string, name?: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushUndefined: (state: RunState, segment: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushStringValue: (state: RunState, segment: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    setStringValue: (state: RunState, segment: string) => {
        options: {
            name: string;
            value: any;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    inhibateOptions: (state: RunState) => {
        ignoreOptions: boolean;
        candidateUsage: string | null;
        errorMessage: string | null;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    useHelp: (state: RunState, segment: string, command: number) => {
        options: {
            name: string;
            value: string;
        }[];
        candidateUsage: string | null;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    setError: (state: RunState, segment: string, errorMessage: string) => {
        errorMessage: string;
        candidateUsage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
    setOptionArityError: (state: RunState, segment: string) => {
        errorMessage: string;
        candidateUsage: string | null;
        ignoreOptions: boolean;
        options: {
            name: string;
            value: any;
        }[];
        path: string[];
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        remainder: string | null;
        selectedIndex: number | null;
    };
}; // ------------------------------------------------------------------------
// ------------------------------------------------------------------------
declare const NoLimits: unique symbol;
type ArityDefinition = {
    leading: string[];
    extra: string[] | typeof NoLimits;
    trailing: string[];
    proxy: boolean;
};
type OptDefinition = {
    names: string[];
    description?: string;
    arity: number;
    hidden: boolean;
    allowBinding: boolean;
};
declare class CommandBuilder<Context> {
    readonly cliIndex: number;
    readonly cliOpts: Readonly<CliOptions>;
    readonly allOptionNames: string[];
    readonly arity: ArityDefinition;
    readonly options: OptDefinition[];
    readonly paths: string[][];
    private context?;
    constructor(cliIndex: number, cliOpts: CliOptions);
    addPath(path: string[]): void;
    setArity({ leading, trailing, extra, proxy }: Partial<ArityDefinition>): void;
    addPositional({ name, required }?: {
        name?: string;
        required?: boolean;
    }): void;
    addRest({ name, required }?: {
        name?: string;
        required?: number;
    }): void;
    addProxy({ required }?: {
        name?: string;
        required?: number;
    }): void;
    addOption({ names, description, arity, hidden, allowBinding }: Partial<OptDefinition> & {
        names: string[];
    }): void;
    setContext(context: Context): void;
    usage({ detailed, inlineOptions }?: {
        detailed?: boolean;
        inlineOptions?: boolean;
    }): {
        usage: string;
        options: {
            definition: string;
            description: string;
        }[];
    };
    compile(): {
        machine: StateMachine;
        context: Context;
    };
    private registerOptions;
}
type CliOptions = {
    binaryName: string;
};
/**
 * The base context of the CLI.
 *
 * All Contexts have to extend it.
 */
type BaseContext = {
    /**
     * The input stream of the CLI.
     *
     * @default
     * process.stdin
     */
    stdin: Readable;
    /**
     * The output stream of the CLI.
     *
     * @default
     * process.stdout
     */
    stdout: Writable;
    /**
     * The error stream of the CLI.
     *
     * @default
     * process.stderr
     */
    stderr: Writable;
};
type CliContext<Context extends BaseContext> = {
    commandClass: CommandClass<Context>;
};
type CliOptions$0 = Readonly<{
    /**
     * The label of the binary.
     *
     * Shown at the top of the usage information.
     */
    binaryLabel?: string;
    /**
     * The name of the binary.
     *
     * Included in the path and the examples of the definitions.
     */
    binaryName: string;
    /**
     * The version of the binary.
     *
     * Shown at the top of the usage information.
     */
    binaryVersion?: string;
    /**
     * If `true`, the Cli will use colors in the output.
     *
     * @default
     * process.env.FORCE_COLOR ?? process.stdout.isTTY
     */
    enableColors: boolean;
}>;
type MiniCli<Context extends BaseContext> = CliOptions$0 & {
    /**
     * Returns an Array representing the definitions of all registered commands.
     */
    definitions(): Definition[];
    /**
     * Formats errors using colors.
     *
     * @param error The error to format. If `error.name` is `'Error'`, it is replaced with `'Internal Error'`.
     * @param opts.command The command whose usage will be included in the formatted error.
     */
    error(error: Error, opts?: {
        command?: Command<Context> | null;
    }): string;
    /**
     * Compiles a command and its arguments using the `CommandBuilder`.
     *
     * @param input An array containing the name of the command and its arguments
     *
     * @returns The compiled `Command`, with its properties populated with the arguments.
     */
    process(input: string[]): Command<Context>;
    /**
     * Runs a command.
     *
     * @param input An array containing the name of the command and its arguments
     * @param context Overrides the Context of the main `Cli` instance
     *
     * @returns The exit code of the command
     */
    run(input: string[], context?: Partial<Context>): Promise<number>;
    /**
     * Returns the usage of a command.
     *
     * @param command The `Command` whose usage will be returned or `null` to return the usage of all commands.
     * @param opts.detailed If `true`, the usage of a command will also include its description, details, and examples. Doesn't have any effect if `command` is `null` or doesn't have a `usage` property.
     * @param opts.prefix The prefix displayed before each command. Defaults to `$`.
     */
    usage(command?: CommandClass<Context> | Command<Context> | null, opts?: {
        detailed?: boolean;
        prefix?: string;
    }): string;
};
/**
 * @template Context The context shared by all commands. Contexts are a set of values, defined when calling the `run`/`runExit` functions from the CLI instance, that will be made available to the commands via `this.context`.
 */
declare class Cli<Context extends BaseContext = BaseContext> implements MiniCli<Context> {
    /**
     * The default context of the CLI.
     *
     * Contains the stdio of the current `process`.
     */
    static defaultContext: {
        stdin: NodeJS.ReadStream;
        stdout: NodeJS.WriteStream;
        stderr: NodeJS.WriteStream;
    };
    private readonly builder;
    private readonly registrations;
    readonly binaryLabel?: string;
    readonly binaryName: string;
    readonly binaryVersion?: string;
    readonly enableColors: boolean;
    /**
     * Creates a new Cli and registers all commands passed as parameters.
     *
     * @param commandClasses The Commands to register
     * @returns The created `Cli` instance
     */
    static from<Context extends BaseContext = BaseContext>(commandClasses: CommandClass<Context>[], options?: Partial<CliOptions$0>): Cli<Context>;
    constructor({ binaryLabel, binaryName: binaryNameOpt, binaryVersion, enableColors }?: Partial<CliOptions$0>);
    /**
     * Registers a command inside the CLI.
     */
    register(commandClass: CommandClass<Context>): void;
    process(input: string[]): Command<Context>;
    run(input: Command<Context> | string[], context: Context): Promise<number>;
    /**
     * Runs a command and exits the current `process` with the exit code returned by the command.
     *
     * @param input An array containing the name of the command and its arguments.
     *
     * @example
     * cli.runExit(process.argv.slice(2), Cli.defaultContext)
     */
    runExit(input: Command<Context> | string[], context: Context): Promise<void>;
    suggest(input: string[], partial: boolean): string[][];
    definitions({ colored }?: {
        colored?: boolean;
    }): Definition[];
    usage(command?: CommandClass<Context> | Command<Context> | null, { colored, detailed, prefix }?: {
        colored?: boolean;
        detailed?: boolean;
        prefix?: string;
    }): string;
    error(error: Error | any, { colored, command }?: {
        colored?: boolean;
        command?: Command<Context> | null;
    }): string;
    private getUsageByRegistration;
    private getUsageByIndex;
    private format;
}
declare class HelpCommand extends Command {
    execute(): Promise<void>;
}
declare class VersionCommand extends Command {
    execute(): Promise<void>;
}
type Meta<Context extends BaseContext> = {
    definitions: ((command: CommandBuilder<CliContext<Context>>) => void)[];
    transformers: ((state: RunState, command: Command<Context>, builder: CommandBuilder<CliContext<Context>>) => void)[];
}; /**
 * The usage of a Command.
 */
/**
 * The usage of a Command.
 */
type Usage = {
    /**
     * The category of the command.
     *
     * Included in the detailed usage.
     */
    category?: string;
    /**
     * The short description of the command, formatted as Markdown.
     *
     * Included in the detailed usage.
     */
    description?: string;
    /**
     * The extended details of the command, formatted as Markdown.
     *
     * Included in the detailed usage.
     */
    details?: string;
    /**
     * Examples of the command represented as an Array of tuples.
     *
     * The first element of the tuple represents the description of the example.
     *
     * The second element of the tuple represents the command of the example.
     * If present, the leading `$0` is replaced with `cli.binaryName`.
     */
    examples?: [string, string][];
}; /**
 * The definition of a Command.
 */
/**
 * The definition of a Command.
 */
type Definition = Usage & {
    /**
     * The path of the command, starting with `cli.binaryName`.
     */
    path: string;
    /**
     * The detailed usage of the command.
     */
    usage: string;
    /**
     * The various options registered on the command.
     */
    options: {
        definition: string;
        description?: string;
    }[];
}; /**
 * The schema used to validate the Command instance.
 *
 * The easiest way to validate it is by using the [Yup](https://github.com/jquense/yup) library.
 *
 * @example
 * yup.object().shape({
 *   a: yup.number().integer(),
 *   b: yup.number().integer(),
 * })
 */
/**
 * The schema used to validate the Command instance.
 *
 * The easiest way to validate it is by using the [Yup](https://github.com/jquense/yup) library.
 *
 * @example
 * yup.object().shape({
 *   a: yup.number().integer(),
 *   b: yup.number().integer(),
 * })
 */
type Schema<C extends Command<any>> = {
    /**
     * A function that takes the `Command` instance as a parameter and validates it, throwing an Error if the validation fails.
     */
    validate: (object: C) => void;
};
type CommandClass<Context extends BaseContext = BaseContext> = {
    new (): Command<Context>;
    resolveMeta(prototype: Command<Context>): Meta<Context>;
    schema?: Schema<any>;
    usage?: Usage;
};
declare abstract class Command<Context extends BaseContext = BaseContext> {
    private static meta?;
    static getMeta<Context extends BaseContext>(prototype: Command<Context>): Meta<Context>;
    static resolveMeta<Context extends BaseContext>(prototype: Command<Context>): Meta<Context>;
    private static registerDefinition;
    private static registerTransformer;
    static addPath(...path: string[]): void;
    static addOption<Context extends BaseContext>(name: string, builder: (prototype: Command<Context>, propertyName: string) => void): void;
    /**
     * Wrap the specified command to be attached to the given path on the command line.
     * The first path thus attached will be considered the "main" one, and all others will be aliases.
     * @param path The command path.
     */
    static Path(...path: string[]): <Context extends BaseContext>(prototype: Command<Context>, propertyName: string) => void;
    /**
     * Register a boolean listener for the given option names. When Clipanion detects that this argument is present, the value will be set to false. The value won't be set unless the option is found, so you must remember to set it to an appropriate default value.
     * @param descriptor the option names.
     */
    static Boolean(descriptor: string, { hidden, description }?: {
        hidden?: boolean;
        description?: string;
    }): <Context extends BaseContext>(prototype: Command<Context>, propertyName: string) => void;
    /**
     * Register a boolean listener for the given option names. Each time Clipanion detects that this argument is present, the counter will be incremented. Each time the argument is negated, the counter will be reset to `0`. The counter won't be set unless the option is found, so you must remember to set it to an appropriate default value.
     
     * @param descriptor A comma-separated list of option names.
     */
    static Counter(descriptor: string, { hidden, description }?: {
        hidden?: boolean;
        description?: string;
    }): <Context extends BaseContext>(prototype: Command<Context>, propertyName: string) => void;
    /**
     * Register a listener that looks for an option and its followup argument. When Clipanion detects that this argument is present, the value will be set to whatever follows the option in the input. The value won't be set unless the option is found, so you must remember to set it to an appropriate default value.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     * @param descriptor The option names.
     */
    static String(descriptor: string, opts?: {
        arity?: number;
        tolerateBoolean?: boolean;
        hidden?: boolean;
        description?: string;
    }): PropertyDecorator;
    /**
     * Register a listener that looks for positional arguments. When Clipanion detects that an argument isn't an option, it will put it in this property and continue processing the rest of the command line.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     * @param descriptor Whether or not filling the positional argument is required for the command to be a valid selection.
     */
    static String(descriptor?: {
        required?: boolean;
        name?: string;
    }): PropertyDecorator;
    /**
     * Register a listener that looks for an option and its followup argument. When Clipanion detects that this argument is present, the value will be pushed into the array represented in the property.
     */
    static Array(descriptor: string, { arity, hidden, description }?: {
        arity?: number;
        hidden?: boolean;
        description?: string;
    }): <Context extends BaseContext>(prototype: Command<Context>, propertyName: string) => void;
    /**
     * Register a listener that takes all the positional arguments remaining and store them into the selected property.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     */
    static Rest(): PropertyDecorator;
    /**
     * Register a listener that takes all the positional arguments remaining and store them into the selected property.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     * @param opts.required The minimal number of arguments required for the command to be successful.
     */
    static Rest(opts: {
        required: number;
    }): PropertyDecorator;
    /**
     * Register a listener that takes all the arguments remaining (including options and such) and store them into the selected property.
     * Note that all methods affecting positional arguments are evaluated in the definition order; don't mess with it (for example sorting your properties in ascendent order might have adverse results).
     */
    static Proxy({ required }?: {
        required?: number;
    }): <Context extends BaseContext>(prototype: Command<Context>, propertyName: string) => void;
    /**
     * Defines the usage information for the given command.
     * @param usage
     */
    static Usage(usage: Usage): Usage;
    /**
     * Contains the usage information for the command. If undefined, the command will be hidden from the general listing.
     */
    static usage?: Usage;
    /**
     * Defines the schema for the given command.
     * @param schema
     */
    static Schema<C extends Command<any> = Command<BaseContext>>(schema: Schema<C>): Schema<C>;
    /**
     * The schema used to validate the Command instance.
     */
    static schema?: Schema<any>;
    /**
     * Standard command that'll get executed by `Cli#run` and `Cli#runExit`. Expected to return an exit code or nothing (which Clipanion will treat as if 0 had been returned).
     */
    abstract execute(): Promise<number | void>;
    /**
     * Standard error handler which will simply rethrow the error. Can be used to add custom logic to handle errors
     * from the command or simply return the parent class error handling.
     * @param error
     */
    catch(error: any): Promise<void>;
    validateAndExecute(): Promise<number>;
    /**
     * Predefined that will be set to true if `-h,--help` has been used, in which case `Command#execute` shouldn't be called.
     */
    help: boolean;
    /**
     * Predefined variable that will be populated with a miniature API that can be used to query Clipanion and forward commands.
     */
    cli: MiniCli<Context>;
    /**
     * Predefined variable that will be populated with the context of the application.
     */
    context: Context;
    /**
     * The path that got used to access the command being executed.
     */
    path: string[];
    /**
     * A list of useful semi-opinionated command entries that have to be registered manually.
     *
     * They cover the basic needs of most CLIs (e.g. help command, version command).
     *
     * @example
     * cli.register(Command.Entries.Help);
     * cli.register(Command.Entries.Version);
     */
    static Entries: {
        /**
         * A command that prints the usage of all commands.
         *
         * Paths: `-h`, `--help`
         */
        Help: typeof HelpCommand;
        /**
         * A command that prints the version of the binary (`cli.binaryVersion`).
         *
         * Paths: `-v`, `--version`
         */
        Version: typeof VersionCommand;
    };
}
type ErrorMeta = {
    type: `none`;
} | {
    type: `usage`;
}; /**
 * A generic usage error with the name `UsageError`.
 *
 * It should be used over `Error` only when it's the user's fault.
 */
/**
 * A generic usage error with the name `UsageError`.
 *
 * It should be used over `Error` only when it's the user's fault.
 */
declare class UsageError extends Error {
    clipanion: ErrorMeta;
    constructor(message: string);
}
export { Command, BaseContext, Cli, CliOptions$0 as CliOptions, CommandClass, Usage, Definition, Schema, UsageError };
