/// <reference types="node" />
import { PortablePath, FakeFS } from '@yarnpkg/fslib';
import { Readable, Writable } from 'stream';
import { ShellError } from './errors';
import * as globUtils from './globUtils';
import { ProcessImplementation } from './pipe';
export { globUtils, ShellError };
export declare type Glob = globUtils.Glob;
export declare type UserOptions = {
    baseFs: FakeFS<PortablePath>;
    builtins: {
        [key: string]: ShellBuiltin;
    };
    cwd: PortablePath;
    env: {
        [key: string]: string | undefined;
    };
    stdin: Readable | null;
    stdout: Writable;
    stderr: Writable;
    variables: {
        [key: string]: string;
    };
    glob: globUtils.Glob;
};
export declare type ShellBuiltin = (args: Array<string>, opts: ShellOptions, state: ShellState) => Promise<number>;
export declare type ShellOptions = {
    args: Array<string>;
    baseFs: FakeFS<PortablePath>;
    builtins: Map<string, ShellBuiltin>;
    initialStdin: Readable;
    initialStdout: Writable;
    initialStderr: Writable;
    glob: globUtils.Glob;
};
export declare type ShellState = {
    cwd: PortablePath;
    environment: {
        [key: string]: string;
    };
    exitCode: number | null;
    procedures: {
        [key: string]: ProcessImplementation;
    };
    stdin: Readable;
    stdout: Writable;
    stderr: Writable;
    variables: {
        [key: string]: string;
    };
};
export declare function execute(command: string, args?: Array<string>, { baseFs, builtins, cwd, env, stdin, stdout, stderr, variables, glob, }?: Partial<UserOptions>): Promise<number>;
