import { Options } from '../../lib/types';
export declare function processCommandArgs<CommandOptions>(...args: any[]): {
    paths: string[];
    options: Options & CommandOptions;
};
