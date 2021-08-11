import { TestOptions, Options } from '../../lib/types';
import { TestResult } from '../../lib/snyk-test/legacy';
import { IacTestResponse } from '../../lib/snyk-test/iac-test-result';
export declare function formatTestMeta(res: TestResult | IacTestResponse, options: Options & TestOptions): string;
