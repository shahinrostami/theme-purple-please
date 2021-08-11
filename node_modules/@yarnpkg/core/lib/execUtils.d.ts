/// <reference types="node" />
import { PortablePath } from '@yarnpkg/fslib';
import { Readable, Writable } from 'stream';
export declare enum EndStrategy {
    Never = 0,
    ErrorCode = 1,
    Always = 2
}
export declare type PipevpOptions = {
    cwd: PortablePath;
    env?: {
        [key: string]: string | undefined;
    };
    end?: EndStrategy;
    strict?: boolean;
    stdin: Readable | null;
    stdout: Writable;
    stderr: Writable;
};
export declare function pipevp(fileName: string, args: Array<string>, { cwd, env, strict, stdin, stdout, stderr, end }: PipevpOptions): Promise<{
    code: number;
}>;
export declare type ExecvpOptions = {
    cwd: PortablePath;
    env?: {
        [key: string]: string | undefined;
    };
    encoding?: string;
    strict?: boolean;
};
export declare function execvp(fileName: string, args: Array<string>, opts: ExecvpOptions & {
    encoding: 'buffer';
}): Promise<{
    code: number;
    stdout: Buffer;
    stderr: Buffer;
}>;
export declare function execvp(fileName: string, args: Array<string>, opts: ExecvpOptions & {
    encoding: string;
}): Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;
export declare function execvp(fileName: string, args: Array<string>, opts: ExecvpOptions): Promise<{
    code: number;
    stdout: string;
    stderr: string;
}>;
