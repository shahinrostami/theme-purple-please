export declare function execute(command: string, args: string[], options?: {
    cwd?: string;
    timeout?: number;
}): Promise<string>;
