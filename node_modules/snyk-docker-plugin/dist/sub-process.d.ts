export { execute, CmdOutput };
interface CmdOutput {
    stdout: string;
    stderr: string;
}
declare function execute(command: string, args?: string[], options?: any): Promise<CmdOutput>;
