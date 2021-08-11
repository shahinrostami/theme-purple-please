/// <reference types="node" />
import { MethodResult } from './commands/types';
export declare interface Global extends NodeJS.Global {
    ignoreUnknownCA: boolean;
}
export declare type MethodArgs = Array<string | ArgsOptions>;
export interface Args {
    command: string;
    method: (...args: MethodArgs) => Promise<MethodResult>;
    options: ArgsOptions;
}
export interface ArgsOptions {
    _doubleDashArgs: string[];
    _: MethodArgs;
    [key: string]: boolean | string | number | MethodArgs | string[];
}
export declare function args(rawArgv: string[]): Args;
