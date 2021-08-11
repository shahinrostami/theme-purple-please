import { Ecosystem } from '../ecosystems/types';
import { Options, PolicyOptions, TestOptions } from '../types';
import { Payload } from './types';
export declare function assembleEcosystemPayloads(ecosystem: Ecosystem, options: Options & TestOptions & PolicyOptions): Promise<Payload[]>;
