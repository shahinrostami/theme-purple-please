import { Options, TestOptions } from '../../../lib/types';
import { TestResult } from '../../../lib/snyk-test/legacy';
export declare function displayResult(res: TestResult, options: Options & TestOptions, foundProjectCount?: number): string;
