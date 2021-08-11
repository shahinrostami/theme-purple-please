import { Options, TestOptions } from '../../../lib/types';
export declare function setDefaultTestOptions<CommandOptions>(options: Options & CommandOptions): Options & TestOptions & CommandOptions;
