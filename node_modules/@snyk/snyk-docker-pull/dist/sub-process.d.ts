/// <reference types="node" />
export interface CmdOutput {
    stdout: string;
    stderr: string;
}
export declare function execute(command: string, args?: string[], cwd?: string, env?: NodeJS.ProcessEnv, shell?: boolean): Promise<CmdOutput>;
