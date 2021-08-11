/// <reference types="node" />
import { Readable, Writable } from 'stream';
import * as t from 'typanion';
import { Command } from '../advanced';
declare type Context = {
    cwd: string;
    stdin: Readable;
    stdout: Writable;
    stderr: Writable;
};
export default class YarnAdd extends Command<Context> {
    dev: boolean;
    peer: boolean;
    exact: boolean;
    tilde: boolean;
    caret: boolean;
    pkgs: string[];
    static schema: t.LooseValidator<{
        [key: string]: unknown;
    }, {
        [key: string]: unknown;
    }>[];
    static usage: import("../advanced/Command").Usage;
    static paths: string[][];
    execute(): Promise<void>;
}
export {};
