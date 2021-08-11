import { TestResult } from './legacy';
import { Options, SupportedProjectTypes, TestOptions } from '../types';
export declare function runTest(projectType: SupportedProjectTypes | undefined, root: string, options: Options & TestOptions): Promise<TestResult[]>;
