import { TestResult } from '../../../lib/snyk-test/legacy';
import { EntityToFix } from '@snyk/fix';
import { Options, TestOptions } from '../../../lib/types';
export declare function convertLegacyTestResultToFixEntities(testResults: (TestResult | TestResult[]) | Error, root: string, options: Partial<Options & TestOptions>): EntityToFix[];
