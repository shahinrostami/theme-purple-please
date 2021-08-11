import { TestResult } from '../../../lib/ecosystems/types';
import { TestResult as LegacyTestResult } from '../../../lib/snyk-test/legacy';
export declare function convertLegacyTestResultToNew(testResult: LegacyTestResult): TestResult;
